MapExpress = {

	Controls: {},

	Service: {},

	Geo: {},

	Layers: {},

	Utils: {
		Promise: {}
	},

	Mapping: {},

	Tools: {}
};

if (typeof window !== 'undefined' && window.L) {
	window.MapExpress = MapExpress;
};MapExpress.Layers.GeoJSONServiceLayer = L.GeoJSON.extend({

	options: {
		useVectorTile: false,
		replaceDataOnReset: false,
		crossOrigin: true
	},

	initialize: function(vectorProvider, options) {
		L.GeoJSON.prototype.initialize.call(this, null, options);
		this._dataPovider = vectorProvider;
		this._prevMapView = {};
		this._first = true;
	},

	onAdd: function(map) {
		L.GeoJSON.prototype.onAdd.call(this, map);
		map.on('moveend', this._updateData, this);
		this._updateData();
	},

	onRemove: function(map) {
		this.clearLayers();
		L.GeoJSON.prototype.onRemove.call(this, map);
		map.off('moveend', this._updateData, this);
		this._first = true;
	},

	_updateData: function() {
		var that = this;
		var bb = this._map.getBounds();
		var zoom = this._map.getZoom();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			this.clearLayers();
			return;
		}

		if (this.options.useVectorTile) {
			this._updateVectorTileData(bb, zoom);
		} else {
			if (this.options.replaceDataOnReset) {
				this._updateVectorDataInBounds(bb, zoom);
			}
			if (!this.options.replaceDataOnReset && this._first) {
				this._addVectorData();
			}
		}
		this._storeMapView();
	},

	_addVectorData: function() {
		var that = this;
		this._dataPovider.getDataAsync().then(
			function(data) {
				that._replaceData(data);
			},
			function() {
				that.clearLayers();
			}
		);
	},

	_updateVectorDataInBounds: function(mapBounds, zoom) {
		var that = this;
		this._dataPovider.getDataInBoundsAsync(mapBounds, zoom).then(
			function(data) {
				that._replaceData(data);
			},
			function() {
				that.clearLayers();
			}
		);
	},

	_updateVectorTileData: function(mapBounds, zoom) {
		var toAddTileRange = [];
		if (this.options.replaceDataOnReset) {
			this.clearLayers();
			toAddTileRange = this._dataPovider._getTileCoordRangeByMapBounds(mapBounds, zoom);
		} else {
			toAddTileRange = this._dataPovider._getAddedTileCoordRangeByMapBounds(this._prevMapView.bounds, this._prevMapView.zoom, mapBounds, zoom);
			if (this._map.getZoom() !== this._prevMapView.zoom) {
				this.clearLayers();
			} else {
				var toRemoveTileRange = this._dataPovider._getRemovedTileCoordRangeByMapBounds(this._prevMapView.bounds, this._prevMapView.zoom, mapBounds, zoom);
				for (var i = 0; i < toRemoveTileRange.length; i++) {
					this._removeVectorTile(toRemoveTileRange[i]);
				}
			}
		}

		for (var j = 0; j < toAddTileRange.length; j++) {
			this._addVectorTile(toAddTileRange[j]);
		}
	},

	_addVectorTile: function(tileCoord) {
		var that = this;
		this._dataPovider.getDataByTileAsync(tileCoord).then(
			function(geoJSON) {
				if (geoJSON) {
					var added = that.addData(geoJSON);
					for (var i in added._layers) {
						if (!added._layers[i]._tileCoordKey) {
							added._layers[i]._tileCoordKey = that._dataPovider._tileCoordsToKey(tileCoord);
						}
					}
				}
			}
		);
	},

	_removeVectorTile: function(tileCoord) {
		for (var i in this._layers) {
			var iterLayer = this._layers[i];
			if (iterLayer._tileCoordKey && iterLayer._tileCoordKey === this._dataPovider._tileCoordsToKey(tileCoord)) {
				this.removeLayer(iterLayer);
			}
		}
	},

	_replaceData: function(geoJSON) {
		this.clearLayers();
		if (geoJSON) {
			this.addData(geoJSON);
			this._first = false;
		}
	},

	_storeMapView: function() {
		this._prevMapView.zoom = this._map.getZoom();
		this._prevMapView.bounds = this._map.getBounds();
		this._prevMapView.center = this._map.getCenter();
	},

	_getFeaturesAtPoint: function(latlng, layerPoint, mapBounds, mapSize, zoom) {
		var that = this;
		var d = Q.defer();
		try {
			var features = [];
			for (var i in that._layers) {
				var iterLayer = that._layers[i];
				if (iterLayer._containsPoint && iterLayer._containsPoint(layerPoint)) {
					features.push(iterLayer.feature);
				}
			}
			d.resolve(features);
		} catch (e) {
			e.layer = that;
			d.reject(e);
		}
		return d.promise;
	}
});

MapExpress.Layers.geoJSONServiceLayer = function(vectorProvider, options) {
	return new MapExpress.Layers.GeoJSONServiceLayer(vectorProvider, options);
};;MapExpress.Layers.ImageOverlayLayer = L.ImageOverlay.extend({

	options: {
		crossOrigin: true
	},

	initialize: function(dataPovider, options) {
		this._dataPovider = dataPovider;
		L.setOptions(this, options);
	},

	onAdd: function(map) {
		map.on('moveend', this._reset, this);
		L.ImageOverlay.prototype.onAdd.call(this, map);
	},

	onRemove: function(map) {
		L.ImageOverlay.prototype.onRemove.call(this, map);
		map.off('moveend', this._reset, this);
	},

	_reset: function() {
		this._updateData();
		L.ImageOverlay.prototype._reset.call(this);
	},

	_updateData: function() {
		var zoom = this._map.getZoom();
		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			this._removeData();
			return;
		}
		this._bounds = this._map.getBounds();
		var newUrl = this._dataPovider.getDataUrlByBounds(this._bounds, this._map.getSize());
		if (newUrl === this._url) {
			return;
		}
		this._url = newUrl;
		this._removeData();
		this._initImage();
		if (this.options.opacity < 1) {
			this._updateOpacity();
		}
		if (this.options.interactive) {
			L.DomUtil.addClass(this._image, 'leaflet-interactive');
			this.addInteractiveTarget(this._image);
		}
		this.getPane().appendChild(this._image);
	},

	_removeData: function() {
		L.DomUtil.remove(this._image);
		if (this.options.interactive) {
			this.removeInteractiveTarget(this._image);
		}
	}

});

MapExpress.Layers.imageOverlayLayer = function(wmsProvider, options) {
	return new MapExpress.Layers.ImageOverlayLayer(wmsProvider, options);
};;MapExpress.Layers.TileServiceLayer = L.TileLayer.extend({	options: {		crossOrigin: true	},	initialize: function(tileProvider, options) {		L.TileLayer.prototype.initialize.call(this, null, options);		this._dataPovider = tileProvider;	},	onAdd: function(map) {		L.TileLayer.prototype.onAdd.call(this, map);	},	onRemove: function(map) {		L.TileLayer.prototype.onRemove.call(this, map);	},	createTile: function(coords, done) {		var tile = document.createElement('img');		L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile));		L.DomEvent.on(tile, 'error', L.bind(this._tileOnError, this, done, tile));		if (this.options.crossOrigin) {			tile.crossOrigin = '';		}		tile.alt = '';		tile.src = this._dataPovider.getDataUrlByTile(coords);		return tile;	}});MapExpress.Layers.tileServiceLayer = function(tileProvider, options) {	return new MapExpress.Layers.TileServiceLayer(tileProvider, options);};;MapExpress.Mapping.MapLoader = L.Class.extend({

	initialize: function(map, options) {
		this._map = map;
		L.setOptions(this, options);
	},

	loadMap: function(jsonMapModel) {
		var that = this;
		this._layers = [];

		this._map.id = jsonMapModel.id;
		this._map.name = jsonMapModel.name;
		this._map.displayName = jsonMapModel.displayName;
		this._map.description = jsonMapModel.description;

		L.setOptions(this._map, jsonMapModel.options);

		if (jsonMapModel.layers && jsonMapModel.layers.length > 0) {
			jsonMapModel.layers.forEach(function(iterLayerModel) {
				var iterLayer = that._createLayer(iterLayerModel);
				if (iterLayer) {
					that._layers.push(iterLayer);
					if (iterLayer.visible) {
						iterLayer.addTo(that._map);
					}
				}
			});
		}

		return this._map;
	},

	_getLayers: function() {
		return this._layers;
	},

	_getBaseLayers: function() {
		return this._layers.filter(function(iter) {
			return iter.type === 'base';
		});
	},

	_getOverlayLayers: function() {
		return this._layers.filter(function(iter) {
			return iter.type === 'overlay';
		});
	},

	_createLayer: function(layerModel) {
		var layerClass;
		var providerClass = this._createProvider(layerModel.dataProviderClass.constructor, layerModel.dataProviderClass.args);

		if (providerClass) {
			L.setOptions(providerClass, layerModel.dataProviderClass.options);

			layerModel.layerClass.args.splice(0, 0, providerClass);
			switch (layerModel.layerClass.constructor) {
				case 'MapExpress.Layers.GeoJSONServiceLayer':
					layerClass = this._applyToConstructor(MapExpress.Layers.GeoJSONServiceLayer, layerModel.layerClass.args);
					break;

				case 'MapExpress.Layers.ImageOverlayLayer':
					layerClass = this._applyToConstructor(MapExpress.Layers.ImageOverlayLayer, layerModel.layerClass.args);
					break;

				case 'MapExpress.Layers.TileServiceLayer':
					layerClass = this._applyToConstructor(MapExpress.Layers.TileServiceLayer, layerModel.layerClass.args);
					break;
			}
			if (layerClass) {
				layerClass.id = layerModel.id;
				layerClass.displayName = layerModel.displayName;
				layerClass.visible = layerModel.visible;
				layerClass.type = layerModel.type;
				layerClass.minZoom = layerModel.minZoom;
				layerClass.maxZoom = layerModel.maxZoom;
				layerClass.selectable = layerModel.selectable;
				layerClass.queryable = layerModel.queryable;

				L.setOptions(layerClass, layerModel.layerClass.options);
			}
		}
		return layerClass;
	},

	_createProvider: function(providerClassName, argArray) {
		var provider;
		switch (providerClassName) {
			case 'MapExpress.Service.TileProvider':
				provider = this._applyToConstructor(MapExpress.Service.TileProvider, argArray);
				break;

			case 'MapExpress.Service.GeoJSONProvider':
				provider = this._applyToConstructor(MapExpress.Service.GeoJSONProvider, argArray);
				break;

			case 'MapExpress.Service.MapServiceAgsProvider':
				provider = this._applyToConstructor(MapExpress.Service.MapServiceAgsProvider, argArray);
				break;

			case 'MapExpress.Service.FeatureServiceAgsProvider':
				provider = this._applyToConstructor(MapExpress.Service.FeatureServiceAgsProvider, argArray);
				break;

			case 'MapExpress.Service.WmsProvider':
				provider = this._applyToConstructor(MapExpress.Service.WmsProvider, argArray);
				break;
		}
		return provider;
	},

	_applyToConstructor: function(constructor, argArray) {
		var args = [null].concat(argArray);
		var FactoryFunction = constructor.bind.apply(constructor, args);
		return new FactoryFunction();
	}


});

MapExpress.Mapping.mapLoader = function(map, options) {
	return new MapExpress.Mapping.MapLoader(map, options);
};;MapExpress.Mapping.MapManager = L.Class.extend({

	initialize: function(map, mapLoader, options) {
		this._map = map;
		L.setOptions(this, options);
		this._layers = [];
		this._mapLoader = mapLoader ? mapLoader : MapExpress.Mapping.mapLoader(map, options);
	},

	renderMap: function(mapmodel) {
		this._mapLoader.loadMap(mapmodel);
	},

	getLayerById: function(layerId) {
		var layers = this._mapLoader._getLayers();
		if (layers) {
			var filtered = filterByID(layers, layerId);
			return filtered.length > 0 ? filtered[0] : "undefined";
		}

		function filterByID(lrs, id) {
			return lrs.filter(function(iter) {
				return iter.id === id;
			});
		}
	},

	getLayers: function() {
		return this._mapLoader._getLayers();
	},

	getBaseLayers: function() {
		return this._mapLoader._getBaseLayers();
	},

	getOverlayLayers: function() {
		return this._mapLoader._getOverlayLayers();
	},

	_getBaseObj: function() {
		var layers = this.getBaseLayers();
		var baseMaps = {};
		layers.forEach(function(iterLayer) {
			baseMaps[iterLayer.displayName] = iterLayer;
		});
		return baseMaps;
	},

	_getOverlayObj: function() {
		var layers = this.getOverlayLayers();
		var overMaps = {};
		layers.forEach(function(iterLayer) {
			overMaps[iterLayer.displayName] = iterLayer;
		});
		return overMaps;
	}

});;/* jshint ignore:start */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.geojsonvt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = clip;

/* clip features between two axis-parallel lines:
 *     |        |
 *  ___|___     |     /
 * /   |   \____|____/
 *     |        |
 */

function clip(features, scale, k1, k2, axis, intersect, minAll, maxAll) {

    k1 /= scale;
    k2 /= scale;

    if (minAll >= k1 && maxAll <= k2) return features; // trivial accept
    else if (minAll > k2 || maxAll < k1) return null; // trivial reject

    var clipped = [];

    for (var i = 0; i < features.length; i++) {

        var feature = features[i],
            geometry = feature.geometry,
            type = feature.type,
            min, max;

        min = feature.min[axis];
        max = feature.max[axis];

        if (min >= k1 && max <= k2) { // trivial accept
            clipped.push(feature);
            continue;
        } else if (min > k2 || max < k1) continue; // trivial reject

        var slices = type === 1 ?
                clipPoints(geometry, k1, k2, axis) :
                clipGeometry(geometry, k1, k2, axis, intersect, type === 3);

        if (slices.length) {
            // if a feature got clipped, it will likely get clipped on the next zoom level as well,
            // so there's no need to recalculate bboxes
            clipped.push({
                geometry: slices,
                type: type,
                tags: features[i].tags || null,
                min: feature.min,
                max: feature.max
            });
        }
    }

    return clipped.length ? clipped : null;
}

function clipPoints(geometry, k1, k2, axis) {
    var slice = [];

    for (var i = 0; i < geometry.length; i++) {
        var a = geometry[i],
            ak = a[axis];

        if (ak >= k1 && ak <= k2) slice.push(a);
    }
    return slice;
}

function clipGeometry(geometry, k1, k2, axis, intersect, closed) {

    var slices = [];

    for (var i = 0; i < geometry.length; i++) {

        var ak = 0,
            bk = 0,
            b = null,
            points = geometry[i],
            area = points.area,
            dist = points.dist,
            len = points.length,
            a, j, last;

        var slice = [];

        for (j = 0; j < len - 1; j++) {
            a = b || points[j];
            b = points[j + 1];
            ak = bk || a[axis];
            bk = b[axis];

            if (ak < k1) {

                if ((bk > k2)) { // ---|-----|-->
                    slice.push(intersect(a, b, k1), intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk >= k1) slice.push(intersect(a, b, k1)); // ---|-->  |

            } else if (ak > k2) {

                if ((bk < k1)) { // <--|-----|---
                    slice.push(intersect(a, b, k2), intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk <= k2) slice.push(intersect(a, b, k2)); // |  <--|---

            } else {

                slice.push(a);

                if (bk < k1) { // <--|---  |
                    slice.push(intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist);

                } else if (bk > k2) { // |  ---|-->
                    slice.push(intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist);
                }
                // | --> |
            }
        }

        // add the last point
        a = points[len - 1];
        ak = a[axis];
        if (ak >= k1 && ak <= k2) slice.push(a);

        // close the polygon if its endpoints are not the same after clipping

        last = slice[slice.length - 1];
        if (closed && last && (slice[0][0] !== last[0] || slice[0][1] !== last[1])) slice.push(slice[0]);

        // add the final slice
        newSlice(slices, slice, area, dist);
    }

    return slices;
}

function newSlice(slices, slice, area, dist) {
    if (slice.length) {
        // we don't recalculate the area/length of the unclipped geometry because the case where it goes
        // below the visibility threshold as a result of clipping is rare, so we avoid doing unnecessary work
        slice.area = area;
        slice.dist = dist;

        slices.push(slice);
    }
    return [];
}

},{}],2:[function(require,module,exports){
'use strict';

module.exports = convert;

var simplify = require('./simplify');

// converts GeoJSON feature into an intermediate projected JSON vector format with simplification data

function convert(data, tolerance) {
    var features = [];

    if (data.type === 'FeatureCollection') {
        for (var i = 0; i < data.features.length; i++) {
            convertFeature(features, data.features[i], tolerance);
        }
    } else if (data.type === 'Feature') {
        convertFeature(features, data, tolerance);

    } else {
        // single geometry or a geometry collection
        convertFeature(features, {geometry: data}, tolerance);
    }
    return features;
}

function convertFeature(features, feature, tolerance) {
    var geom = feature.geometry,
        type = geom.type,
        coords = geom.coordinates,
        tags = feature.properties,
        i, j, rings;

    if (type === 'Point') {
        features.push(create(tags, 1, [projectPoint(coords)]));

    } else if (type === 'MultiPoint') {
        features.push(create(tags, 1, project(coords)));

    } else if (type === 'LineString') {
        features.push(create(tags, 2, [project(coords, tolerance)]));

    } else if (type === 'MultiLineString' || type === 'Polygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            rings.push(project(coords[i], tolerance));
        }
        features.push(create(tags, type === 'Polygon' ? 3 : 2, rings));

    } else if (type === 'MultiPolygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                rings.push(project(coords[i][j], tolerance));
            }
        }
        features.push(create(tags, 3, rings));

    } else if (type === 'GeometryCollection') {
        for (i = 0; i < geom.geometries.length; i++) {
            convertFeature(features, {
                geometry: geom.geometries[i],
                properties: tags
            }, tolerance);
        }

    } else {
        throw new Error('Input data is not a valid GeoJSON object.');
    }
}

function create(tags, type, geometry) {
    var feature = {
        geometry: geometry,
        type: type,
        tags: tags || null,
        min: [2, 1], // initial bbox values;
        max: [-1, 0]  // note that coords are usually in [0..1] range
    };
    calcBBox(feature);
    return feature;
}

function project(lonlats, tolerance) {
    var projected = [];
    for (var i = 0; i < lonlats.length; i++) {
        projected.push(projectPoint(lonlats[i]));
    }
    if (tolerance) {
        simplify(projected, tolerance);
        calcSize(projected);
    }
    return projected;
}

function projectPoint(p) {
    var sin = Math.sin(p[1] * Math.PI / 180),
        x = (p[0] / 360 + 0.5),
        y = (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);

    y = y < -1 ? -1 :
        y > 1 ? 1 : y;

    return [x, y, 0];
}

// calculate area and length of the poly
function calcSize(points) {
    var area = 0,
        dist = 0;

    for (var i = 0, a, b; i < points.length - 1; i++) {
        a = b || points[i];
        b = points[i + 1];

        area += a[0] * b[1] - b[0] * a[1];

        // use Manhattan distance instead of Euclidian one to avoid expensive square root computation
        dist += Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    }
    points.area = Math.abs(area / 2);
    points.dist = dist;
}

// calculate the feature bounding box for faster clipping later
function calcBBox(feature) {
    var geometry = feature.geometry,
        min = feature.min,
        max = feature.max;

    if (feature.type === 1) calcRingBBox(min, max, geometry);
    else for (var i = 0; i < geometry.length; i++) calcRingBBox(min, max, geometry[i]);

    return feature;
}

function calcRingBBox(min, max, points) {
    for (var i = 0, p; i < points.length; i++) {
        p = points[i];
        min[0] = Math.min(p[0], min[0]);
        max[0] = Math.max(p[0], max[0]);
        min[1] = Math.min(p[1], min[1]);
        max[1] = Math.max(p[1], max[1]);
    }
}

},{"./simplify":4}],3:[function(require,module,exports){
'use strict';

module.exports = geojsonvt;

var convert = require('./convert'),     // GeoJSON conversion and preprocessing
    transform = require('./transform'), // coordinate transformation
    clip = require('./clip'),           // stripe clipping algorithm
    wrap = require('./wrap'),           // date line processing
    createTile = require('./tile');     // final simplified tile generation


function geojsonvt(data, options) {
    return new GeoJSONVT(data, options);
}

function GeoJSONVT(data, options) {
    options = this.options = extend(Object.create(this.options), options);

    var debug = options.debug;

    if (debug) console.time('preprocess data');

    var z2 = 1 << options.maxZoom, // 2^z
        features = convert(data, options.tolerance / (z2 * options.extent));

    this.tiles = {};
    this.tileCoords = [];

    if (debug) {
        console.timeEnd('preprocess data');
        console.log('index: maxZoom: %d, maxPoints: %d', options.indexMaxZoom, options.indexMaxPoints);
        console.time('generate tiles');
        this.stats = {};
        this.total = 0;
    }

    features = wrap(features, options.buffer / options.extent, intersectX);

    // start slicing from the top tile down
    if (features.length) this.splitTile(features, 0, 0, 0);

    if (debug) {
        if (features.length) console.log('features: %d, points: %d', this.tiles[0].numFeatures, this.tiles[0].numPoints);
        console.timeEnd('generate tiles');
        console.log('tiles generated:', this.total, JSON.stringify(this.stats));
    }
}

GeoJSONVT.prototype.options = {
    maxZoom: 14,            // max zoom to preserve detail on
    indexMaxZoom: 5,        // max zoom in the tile index
    indexMaxPoints: 100000, // max number of points per tile in the tile index
    solidChildren: false,   // whether to tile solid square tiles further
    tolerance: 3,           // simplification tolerance (higher means simpler)
    extent: 4096,           // tile extent
    buffer: 64,             // tile buffer on each side
    debug: 0                // logging level (0, 1 or 2)
};

GeoJSONVT.prototype.splitTile = function (features, z, x, y, cz, cx, cy) {

    var stack = [features, z, x, y],
        options = this.options,
        debug = options.debug;

    // avoid recursion by using a processing queue
    while (stack.length) {
        y = stack.pop();
        x = stack.pop();
        z = stack.pop();
        features = stack.pop();

        var z2 = 1 << z,
            id = toID(z, x, y),
            tile = this.tiles[id],
            tileTolerance = z === options.maxZoom ? 0 : options.tolerance / (z2 * options.extent);

        if (!tile) {
            if (debug > 1) console.time('creation');

            tile = this.tiles[id] = createTile(features, z2, x, y, tileTolerance, z === options.maxZoom);
            this.tileCoords.push({z: z, x: x, y: y});

            if (debug) {
                if (debug > 1) {
                    console.log('tile z%d-%d-%d (features: %d, points: %d, simplified: %d)',
                        z, x, y, tile.numFeatures, tile.numPoints, tile.numSimplified);
                    console.timeEnd('creation');
                }
                var key = 'z' + z;
                this.stats[key] = (this.stats[key] || 0) + 1;
                this.total++;
            }
        }

        // save reference to original geometry in tile so that we can drill down later if we stop now
        tile.source = features;

        // stop tiling if the tile is solid clipped square
        if (!options.solidChildren && isClippedSquare(tile, options.extent, options.buffer)) continue;

        // if it's the first-pass tiling
        if (!cz) {
            // stop tiling if we reached max zoom, or if the tile is too simple
            if (z === options.indexMaxZoom || tile.numPoints <= options.indexMaxPoints) continue;

        // if a drilldown to a specific tile
        } else {
            // stop tiling if we reached base zoom or our target tile zoom
            if (z === options.maxZoom || z === cz) continue;

            // stop tiling if it's not an ancestor of the target tile
            var m = 1 << (cz - z);
            if (x !== Math.floor(cx / m) || y !== Math.floor(cy / m)) continue;
        }

        // if we slice further down, no need to keep source geometry
        tile.source = null;

        if (debug > 1) console.time('clipping');

        // values we'll use for clipping
        var k1 = 0.5 * options.buffer / options.extent,
            k2 = 0.5 - k1,
            k3 = 0.5 + k1,
            k4 = 1 + k1,
            tl, bl, tr, br, left, right;

        tl = bl = tr = br = null;

        left  = clip(features, z2, x - k1, x + k3, 0, intersectX, tile.min[0], tile.max[0]);
        right = clip(features, z2, x + k2, x + k4, 0, intersectX, tile.min[0], tile.max[0]);

        if (left) {
            tl = clip(left, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);
            bl = clip(left, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);
        }

        if (right) {
            tr = clip(right, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);
            br = clip(right, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);
        }

        if (debug > 1) console.timeEnd('clipping');

        if (tl) stack.push(tl, z + 1, x * 2,     y * 2);
        if (bl) stack.push(bl, z + 1, x * 2,     y * 2 + 1);
        if (tr) stack.push(tr, z + 1, x * 2 + 1, y * 2);
        if (br) stack.push(br, z + 1, x * 2 + 1, y * 2 + 1);
    }
};

GeoJSONVT.prototype.getTile = function (z, x, y) {
    var options = this.options,
        extent = options.extent,
        debug = options.debug;

    var z2 = 1 << z;
    x = ((x % z2) + z2) % z2; // wrap tile x coordinate

    var id = toID(z, x, y);
    if (this.tiles[id]) return transform.tile(this.tiles[id], extent);

    if (debug > 1) console.log('drilling down to z%d-%d-%d', z, x, y);

    var z0 = z,
        x0 = x,
        y0 = y,
        parent;

    while (!parent && z0 > 0) {
        z0--;
        x0 = Math.floor(x0 / 2);
        y0 = Math.floor(y0 / 2);
        parent = this.tiles[toID(z0, x0, y0)];
    }

    if (!parent) return null;

    if (debug > 1) console.log('found parent tile z%d-%d-%d', z0, x0, y0);

    // if we found a parent tile containing the original geometry, we can drill down from it
    if (parent.source) {
        if (isClippedSquare(parent, extent, options.buffer)) return transform.tile(parent, extent);

        if (debug > 1) console.time('drilling down');
        this.splitTile(parent.source, z0, x0, y0, z, x, y);
        if (debug > 1) console.timeEnd('drilling down');
    }

    if (!this.tiles[id]) return null;

    return transform.tile(this.tiles[id], extent);
};

function toID(z, x, y) {
    return (((1 << z) * y + x) * 32) + z;
}

function intersectX(a, b, x) {
    return [x, (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]) + a[1], 1];
}
function intersectY(a, b, y) {
    return [(y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) + a[0], y, 1];
}

function extend(dest, src) {
    for (var i in src) dest[i] = src[i];
    return dest;
}

// checks whether a tile is a whole-area fill after clipping; if it is, there's no sense slicing it further
function isClippedSquare(tile, extent, buffer) {

    var features = tile.source;
    if (features.length !== 1) return false;

    var feature = features[0];
    if (feature.type !== 3 || feature.geometry.length > 1) return false;

    var len = feature.geometry[0].length;
    if (len !== 5) return false;

    for (var i = 0; i < len; i++) {
        var p = transform.point(feature.geometry[0][i], extent, tile.z2, tile.x, tile.y);
        if ((p[0] !== -buffer && p[0] !== extent + buffer) ||
            (p[1] !== -buffer && p[1] !== extent + buffer)) return false;
    }

    return true;
}

},{"./clip":1,"./convert":2,"./tile":5,"./transform":6,"./wrap":7}],4:[function(require,module,exports){
'use strict';

module.exports = simplify;

// calculate simplification data using optimized Douglas-Peucker algorithm

function simplify(points, tolerance) {

    var sqTolerance = tolerance * tolerance,
        len = points.length,
        first = 0,
        last = len - 1,
        stack = [],
        i, maxSqDist, sqDist, index;

    // always retain the endpoints (1 is the max value)
    points[first][2] = 1;
    points[last][2] = 1;

    // avoid recursion by using a stack
    while (last) {

        maxSqDist = 0;

        for (i = first + 1; i < last; i++) {
            sqDist = getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            points[index][2] = maxSqDist; // save the point importance in squared pixels as a z coordinate
            stack.push(first);
            stack.push(index);
            first = index;

        } else {
            last = stack.pop();
            first = stack.pop();
        }
    }
}

// square distance from a point to a segment
function getSqSegDist(p, a, b) {

    var x = a[0], y = a[1],
        bx = b[0], by = b[1],
        px = p[0], py = p[1],
        dx = bx - x,
        dy = by - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = bx;
            y = by;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = px - x;
    dy = py - y;

    return dx * dx + dy * dy;
}

},{}],5:[function(require,module,exports){
'use strict';

module.exports = createTile;

function createTile(features, z2, tx, ty, tolerance, noSimplify) {
    var tile = {
        features: [],
        numPoints: 0,
        numSimplified: 0,
        numFeatures: 0,
        source: null,
        x: tx,
        y: ty,
        z2: z2,
        transformed: false,
        min: [2, 1],
        max: [-1, 0]
    };
    for (var i = 0; i < features.length; i++) {
        tile.numFeatures++;
        addFeature(tile, features[i], tolerance, noSimplify);

        var min = features[i].min,
            max = features[i].max;

        if (min[0] < tile.min[0]) tile.min[0] = min[0];
        if (min[1] < tile.min[1]) tile.min[1] = min[1];
        if (max[0] > tile.max[0]) tile.max[0] = max[0];
        if (max[1] > tile.max[1]) tile.max[1] = max[1];
    }
    return tile;
}

function addFeature(tile, feature, tolerance, noSimplify) {

    var geom = feature.geometry,
        type = feature.type,
        simplified = [],
        sqTolerance = tolerance * tolerance,
        i, j, ring, p;

    if (type === 1) {
        for (i = 0; i < geom.length; i++) {
            simplified.push(geom[i]);
            tile.numPoints++;
            tile.numSimplified++;
        }

    } else {

        // simplify and transform projected coordinates for tile geometry
        for (i = 0; i < geom.length; i++) {
            ring = geom[i];

            // filter out tiny polylines & polygons
            if (!noSimplify && ((type === 2 && ring.dist < tolerance) ||
                                (type === 3 && ring.area < sqTolerance))) {
                tile.numPoints += ring.length;
                continue;
            }

            var simplifiedRing = [];

            for (j = 0; j < ring.length; j++) {
                p = ring[j];
                // keep points with importance > tolerance
                if (noSimplify || p[2] > sqTolerance) {
                    simplifiedRing.push(p);
                    tile.numSimplified++;
                }
                tile.numPoints++;
            }

            simplified.push(simplifiedRing);
        }
    }

    if (simplified.length) {
        tile.features.push({
            geometry: simplified,
            type: type,
            tags: feature.tags || null
        });
    }
}

},{}],6:[function(require,module,exports){
'use strict';

exports.tile = transformTile;
exports.point = transformPoint;

// Transforms the coordinates of each feature in the given tile from
// mercator-projected space into (extent x extent) tile space.
function transformTile(tile, extent) {
    if (tile.transformed) return tile;

    var z2 = tile.z2,
        tx = tile.x,
        ty = tile.y,
        i, j, k;

    for (i = 0; i < tile.features.length; i++) {
        var feature = tile.features[i],
            geom = feature.geometry,
            type = feature.type;

        if (type === 1) {
            for (j = 0; j < geom.length; j++) geom[j] = transformPoint(geom[j], extent, z2, tx, ty);

        } else {
            for (j = 0; j < geom.length; j++) {
                var ring = geom[j];
                for (k = 0; k < ring.length; k++) ring[k] = transformPoint(ring[k], extent, z2, tx, ty);
            }
        }
    }

    tile.transformed = true;

    return tile;
}

function transformPoint(p, extent, z2, tx, ty) {
    var x = Math.round(extent * (p[0] * z2 - tx)),
        y = Math.round(extent * (p[1] * z2 - ty));
    return [x, y];
}

},{}],7:[function(require,module,exports){
'use strict';

var clip = require('./clip');

module.exports = wrap;

function wrap(features, buffer, intersectX) {
    var merged = features,
        left  = clip(features, 1, -1 - buffer, buffer,     0, intersectX, -1, 2), // left world copy
        right = clip(features, 1,  1 - buffer, 2 + buffer, 0, intersectX, -1, 2); // right world copy

    if (left || right) {
        merged = clip(features, 1, -buffer, 1 + buffer, 0, intersectX, -1, 2); // center world copy

        if (left) merged = shiftFeatureCoords(left, 1).concat(merged); // merge left into center
        if (right) merged = merged.concat(shiftFeatureCoords(right, -1)); // merge right into center
    }

    return merged;
}

function shiftFeatureCoords(features, offset) {
    var newFeatures = [];

    for (var i = 0; i < features.length; i++) {
        var feature = features[i],
            type = feature.type;

        var newGeometry;

        if (type === 1) {
            newGeometry = shiftCoords(feature.geometry, offset);
        } else {
            newGeometry = [];
            for (var j = 0; j < feature.geometry.length; j++) {
                newGeometry.push(shiftCoords(feature.geometry[j], offset));
            }
        }

        newFeatures.push({
            geometry: newGeometry,
            type: type,
            tags: feature.tags,
            min: [feature.min[0] + offset, feature.min[1]],
            max: [feature.max[0] + offset, feature.max[1]]
        });
    }

    return newFeatures;
}

function shiftCoords(points, offset) {
    var newPoints = [];
    newPoints.area = points.area;
    newPoints.dist = points.dist;

    for (var i = 0; i < points.length; i++) {
        newPoints.push([points[i][0] + offset, points[i][1], points[i][2]]);
    }
    return newPoints;
}

},{"./clip":1}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpcC5qcyIsInNyYy9jb252ZXJ0LmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3NpbXBsaWZ5LmpzIiwic3JjL3RpbGUuanMiLCJzcmMvdHJhbnNmb3JtLmpzIiwic3JjL3dyYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xpcDtcclxuXHJcbi8qIGNsaXAgZmVhdHVyZXMgYmV0d2VlbiB0d28gYXhpcy1wYXJhbGxlbCBsaW5lczpcclxuICogICAgIHwgICAgICAgIHxcclxuICogIF9fX3xfX18gICAgIHwgICAgIC9cclxuICogLyAgIHwgICBcXF9fX198X19fXy9cclxuICogICAgIHwgICAgICAgIHxcclxuICovXHJcblxyXG5mdW5jdGlvbiBjbGlwKGZlYXR1cmVzLCBzY2FsZSwgazEsIGsyLCBheGlzLCBpbnRlcnNlY3QsIG1pbkFsbCwgbWF4QWxsKSB7XHJcblxyXG4gICAgazEgLz0gc2NhbGU7XHJcbiAgICBrMiAvPSBzY2FsZTtcclxuXHJcbiAgICBpZiAobWluQWxsID49IGsxICYmIG1heEFsbCA8PSBrMikgcmV0dXJuIGZlYXR1cmVzOyAvLyB0cml2aWFsIGFjY2VwdFxyXG4gICAgZWxzZSBpZiAobWluQWxsID4gazIgfHwgbWF4QWxsIDwgazEpIHJldHVybiBudWxsOyAvLyB0cml2aWFsIHJlamVjdFxyXG5cclxuICAgIHZhciBjbGlwcGVkID0gW107XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICB2YXIgZmVhdHVyZSA9IGZlYXR1cmVzW2ldLFxyXG4gICAgICAgICAgICBnZW9tZXRyeSA9IGZlYXR1cmUuZ2VvbWV0cnksXHJcbiAgICAgICAgICAgIHR5cGUgPSBmZWF0dXJlLnR5cGUsXHJcbiAgICAgICAgICAgIG1pbiwgbWF4O1xyXG5cclxuICAgICAgICBtaW4gPSBmZWF0dXJlLm1pbltheGlzXTtcclxuICAgICAgICBtYXggPSBmZWF0dXJlLm1heFtheGlzXTtcclxuXHJcbiAgICAgICAgaWYgKG1pbiA+PSBrMSAmJiBtYXggPD0gazIpIHsgLy8gdHJpdmlhbCBhY2NlcHRcclxuICAgICAgICAgICAgY2xpcHBlZC5wdXNoKGZlYXR1cmUpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKG1pbiA+IGsyIHx8IG1heCA8IGsxKSBjb250aW51ZTsgLy8gdHJpdmlhbCByZWplY3RcclxuXHJcbiAgICAgICAgdmFyIHNsaWNlcyA9IHR5cGUgPT09IDEgP1xyXG4gICAgICAgICAgICAgICAgY2xpcFBvaW50cyhnZW9tZXRyeSwgazEsIGsyLCBheGlzKSA6XHJcbiAgICAgICAgICAgICAgICBjbGlwR2VvbWV0cnkoZ2VvbWV0cnksIGsxLCBrMiwgYXhpcywgaW50ZXJzZWN0LCB0eXBlID09PSAzKTtcclxuXHJcbiAgICAgICAgaWYgKHNsaWNlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgLy8gaWYgYSBmZWF0dXJlIGdvdCBjbGlwcGVkLCBpdCB3aWxsIGxpa2VseSBnZXQgY2xpcHBlZCBvbiB0aGUgbmV4dCB6b29tIGxldmVsIGFzIHdlbGwsXHJcbiAgICAgICAgICAgIC8vIHNvIHRoZXJlJ3Mgbm8gbmVlZCB0byByZWNhbGN1bGF0ZSBiYm94ZXNcclxuICAgICAgICAgICAgY2xpcHBlZC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBzbGljZXMsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICAgICAgdGFnczogZmVhdHVyZXNbaV0udGFncyB8fCBudWxsLFxyXG4gICAgICAgICAgICAgICAgbWluOiBmZWF0dXJlLm1pbixcclxuICAgICAgICAgICAgICAgIG1heDogZmVhdHVyZS5tYXhcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjbGlwcGVkLmxlbmd0aCA/IGNsaXBwZWQgOiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGlwUG9pbnRzKGdlb21ldHJ5LCBrMSwgazIsIGF4aXMpIHtcclxuICAgIHZhciBzbGljZSA9IFtdO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2VvbWV0cnkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgYSA9IGdlb21ldHJ5W2ldLFxyXG4gICAgICAgICAgICBhayA9IGFbYXhpc107XHJcblxyXG4gICAgICAgIGlmIChhayA+PSBrMSAmJiBhayA8PSBrMikgc2xpY2UucHVzaChhKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbGljZTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2xpcEdlb21ldHJ5KGdlb21ldHJ5LCBrMSwgazIsIGF4aXMsIGludGVyc2VjdCwgY2xvc2VkKSB7XHJcblxyXG4gICAgdmFyIHNsaWNlcyA9IFtdO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2VvbWV0cnkubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgdmFyIGFrID0gMCxcclxuICAgICAgICAgICAgYmsgPSAwLFxyXG4gICAgICAgICAgICBiID0gbnVsbCxcclxuICAgICAgICAgICAgcG9pbnRzID0gZ2VvbWV0cnlbaV0sXHJcbiAgICAgICAgICAgIGFyZWEgPSBwb2ludHMuYXJlYSxcclxuICAgICAgICAgICAgZGlzdCA9IHBvaW50cy5kaXN0LFxyXG4gICAgICAgICAgICBsZW4gPSBwb2ludHMubGVuZ3RoLFxyXG4gICAgICAgICAgICBhLCBqLCBsYXN0O1xyXG5cclxuICAgICAgICB2YXIgc2xpY2UgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGxlbiAtIDE7IGorKykge1xyXG4gICAgICAgICAgICBhID0gYiB8fCBwb2ludHNbal07XHJcbiAgICAgICAgICAgIGIgPSBwb2ludHNbaiArIDFdO1xyXG4gICAgICAgICAgICBhayA9IGJrIHx8IGFbYXhpc107XHJcbiAgICAgICAgICAgIGJrID0gYltheGlzXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChhayA8IGsxKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKChiayA+IGsyKSkgeyAvLyAtLS18LS0tLS18LS0+XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpY2UucHVzaChpbnRlcnNlY3QoYSwgYiwgazEpLCBpbnRlcnNlY3QoYSwgYiwgazIpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNsb3NlZCkgc2xpY2UgPSBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJrID49IGsxKSBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMSkpOyAvLyAtLS18LS0+ICB8XHJcblxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFrID4gazIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoKGJrIDwgazEpKSB7IC8vIDwtLXwtLS0tLXwtLS1cclxuICAgICAgICAgICAgICAgICAgICBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMiksIGludGVyc2VjdChhLCBiLCBrMSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghY2xvc2VkKSBzbGljZSA9IG5ld1NsaWNlKHNsaWNlcywgc2xpY2UsIGFyZWEsIGRpc3QpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmsgPD0gazIpIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsyKSk7IC8vIHwgIDwtLXwtLS1cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgc2xpY2UucHVzaChhKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYmsgPCBrMSkgeyAvLyA8LS18LS0tICB8XHJcbiAgICAgICAgICAgICAgICAgICAgc2xpY2UucHVzaChpbnRlcnNlY3QoYSwgYiwgazEpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNsb3NlZCkgc2xpY2UgPSBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJrID4gazIpIHsgLy8gfCAgLS0tfC0tPlxyXG4gICAgICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbG9zZWQpIHNsaWNlID0gbmV3U2xpY2Uoc2xpY2VzLCBzbGljZSwgYXJlYSwgZGlzdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyB8IC0tPiB8XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGFkZCB0aGUgbGFzdCBwb2ludFxyXG4gICAgICAgIGEgPSBwb2ludHNbbGVuIC0gMV07XHJcbiAgICAgICAgYWsgPSBhW2F4aXNdO1xyXG4gICAgICAgIGlmIChhayA+PSBrMSAmJiBhayA8PSBrMikgc2xpY2UucHVzaChhKTtcclxuXHJcbiAgICAgICAgLy8gY2xvc2UgdGhlIHBvbHlnb24gaWYgaXRzIGVuZHBvaW50cyBhcmUgbm90IHRoZSBzYW1lIGFmdGVyIGNsaXBwaW5nXHJcblxyXG4gICAgICAgIGxhc3QgPSBzbGljZVtzbGljZS5sZW5ndGggLSAxXTtcclxuICAgICAgICBpZiAoY2xvc2VkICYmIGxhc3QgJiYgKHNsaWNlWzBdWzBdICE9PSBsYXN0WzBdIHx8IHNsaWNlWzBdWzFdICE9PSBsYXN0WzFdKSkgc2xpY2UucHVzaChzbGljZVswXSk7XHJcblxyXG4gICAgICAgIC8vIGFkZCB0aGUgZmluYWwgc2xpY2VcclxuICAgICAgICBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2xpY2VzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0KSB7XHJcbiAgICBpZiAoc2xpY2UubGVuZ3RoKSB7XHJcbiAgICAgICAgLy8gd2UgZG9uJ3QgcmVjYWxjdWxhdGUgdGhlIGFyZWEvbGVuZ3RoIG9mIHRoZSB1bmNsaXBwZWQgZ2VvbWV0cnkgYmVjYXVzZSB0aGUgY2FzZSB3aGVyZSBpdCBnb2VzXHJcbiAgICAgICAgLy8gYmVsb3cgdGhlIHZpc2liaWxpdHkgdGhyZXNob2xkIGFzIGEgcmVzdWx0IG9mIGNsaXBwaW5nIGlzIHJhcmUsIHNvIHdlIGF2b2lkIGRvaW5nIHVubmVjZXNzYXJ5IHdvcmtcclxuICAgICAgICBzbGljZS5hcmVhID0gYXJlYTtcclxuICAgICAgICBzbGljZS5kaXN0ID0gZGlzdDtcclxuXHJcbiAgICAgICAgc2xpY2VzLnB1c2goc2xpY2UpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFtdO1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY29udmVydDtcclxuXHJcbnZhciBzaW1wbGlmeSA9IHJlcXVpcmUoJy4vc2ltcGxpZnknKTtcclxuXHJcbi8vIGNvbnZlcnRzIEdlb0pTT04gZmVhdHVyZSBpbnRvIGFuIGludGVybWVkaWF0ZSBwcm9qZWN0ZWQgSlNPTiB2ZWN0b3IgZm9ybWF0IHdpdGggc2ltcGxpZmljYXRpb24gZGF0YVxyXG5cclxuZnVuY3Rpb24gY29udmVydChkYXRhLCB0b2xlcmFuY2UpIHtcclxuICAgIHZhciBmZWF0dXJlcyA9IFtdO1xyXG5cclxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29udmVydEZlYXR1cmUoZmVhdHVyZXMsIGRhdGEuZmVhdHVyZXNbaV0sIHRvbGVyYW5jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdGZWF0dXJlJykge1xyXG4gICAgICAgIGNvbnZlcnRGZWF0dXJlKGZlYXR1cmVzLCBkYXRhLCB0b2xlcmFuY2UpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gc2luZ2xlIGdlb21ldHJ5IG9yIGEgZ2VvbWV0cnkgY29sbGVjdGlvblxyXG4gICAgICAgIGNvbnZlcnRGZWF0dXJlKGZlYXR1cmVzLCB7Z2VvbWV0cnk6IGRhdGF9LCB0b2xlcmFuY2UpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZlYXR1cmVzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywgZmVhdHVyZSwgdG9sZXJhbmNlKSB7XHJcbiAgICB2YXIgZ2VvbSA9IGZlYXR1cmUuZ2VvbWV0cnksXHJcbiAgICAgICAgdHlwZSA9IGdlb20udHlwZSxcclxuICAgICAgICBjb29yZHMgPSBnZW9tLmNvb3JkaW5hdGVzLFxyXG4gICAgICAgIHRhZ3MgPSBmZWF0dXJlLnByb3BlcnRpZXMsXHJcbiAgICAgICAgaSwgaiwgcmluZ3M7XHJcblxyXG4gICAgaWYgKHR5cGUgPT09ICdQb2ludCcpIHtcclxuICAgICAgICBmZWF0dXJlcy5wdXNoKGNyZWF0ZSh0YWdzLCAxLCBbcHJvamVjdFBvaW50KGNvb3JkcyldKSk7XHJcblxyXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnTXVsdGlQb2ludCcpIHtcclxuICAgICAgICBmZWF0dXJlcy5wdXNoKGNyZWF0ZSh0YWdzLCAxLCBwcm9qZWN0KGNvb3JkcykpKTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdMaW5lU3RyaW5nJykge1xyXG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlKHRhZ3MsIDIsIFtwcm9qZWN0KGNvb3JkcywgdG9sZXJhbmNlKV0pKTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdNdWx0aUxpbmVTdHJpbmcnIHx8IHR5cGUgPT09ICdQb2x5Z29uJykge1xyXG4gICAgICAgIHJpbmdzID0gW107XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICByaW5ncy5wdXNoKHByb2plY3QoY29vcmRzW2ldLCB0b2xlcmFuY2UpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmVhdHVyZXMucHVzaChjcmVhdGUodGFncywgdHlwZSA9PT0gJ1BvbHlnb24nID8gMyA6IDIsIHJpbmdzKSk7XHJcblxyXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAnTXVsdGlQb2x5Z29uJykge1xyXG4gICAgICAgIHJpbmdzID0gW107XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgY29vcmRzW2ldLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByaW5ncy5wdXNoKHByb2plY3QoY29vcmRzW2ldW2pdLCB0b2xlcmFuY2UpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmZWF0dXJlcy5wdXNoKGNyZWF0ZSh0YWdzLCAzLCByaW5ncykpO1xyXG5cclxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0dlb21ldHJ5Q29sbGVjdGlvbicpIHtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZ2VvbS5nZW9tZXRyaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnZlcnRGZWF0dXJlKGZlYXR1cmVzLCB7XHJcbiAgICAgICAgICAgICAgICBnZW9tZXRyeTogZ2VvbS5nZW9tZXRyaWVzW2ldLFxyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogdGFnc1xyXG4gICAgICAgICAgICB9LCB0b2xlcmFuY2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW5wdXQgZGF0YSBpcyBub3QgYSB2YWxpZCBHZW9KU09OIG9iamVjdC4nKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlKHRhZ3MsIHR5cGUsIGdlb21ldHJ5KSB7XHJcbiAgICB2YXIgZmVhdHVyZSA9IHtcclxuICAgICAgICBnZW9tZXRyeTogZ2VvbWV0cnksXHJcbiAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICB0YWdzOiB0YWdzIHx8IG51bGwsXHJcbiAgICAgICAgbWluOiBbMiwgMV0sIC8vIGluaXRpYWwgYmJveCB2YWx1ZXM7XHJcbiAgICAgICAgbWF4OiBbLTEsIDBdICAvLyBub3RlIHRoYXQgY29vcmRzIGFyZSB1c3VhbGx5IGluIFswLi4xXSByYW5nZVxyXG4gICAgfTtcclxuICAgIGNhbGNCQm94KGZlYXR1cmUpO1xyXG4gICAgcmV0dXJuIGZlYXR1cmU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByb2plY3QobG9ubGF0cywgdG9sZXJhbmNlKSB7XHJcbiAgICB2YXIgcHJvamVjdGVkID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvbmxhdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBwcm9qZWN0ZWQucHVzaChwcm9qZWN0UG9pbnQobG9ubGF0c1tpXSkpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRvbGVyYW5jZSkge1xyXG4gICAgICAgIHNpbXBsaWZ5KHByb2plY3RlZCwgdG9sZXJhbmNlKTtcclxuICAgICAgICBjYWxjU2l6ZShwcm9qZWN0ZWQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHByb2plY3RlZDtcclxufVxyXG5cclxuZnVuY3Rpb24gcHJvamVjdFBvaW50KHApIHtcclxuICAgIHZhciBzaW4gPSBNYXRoLnNpbihwWzFdICogTWF0aC5QSSAvIDE4MCksXHJcbiAgICAgICAgeCA9IChwWzBdIC8gMzYwICsgMC41KSxcclxuICAgICAgICB5ID0gKDAuNSAtIDAuMjUgKiBNYXRoLmxvZygoMSArIHNpbikgLyAoMSAtIHNpbikpIC8gTWF0aC5QSSk7XHJcblxyXG4gICAgeSA9IHkgPCAtMSA/IC0xIDpcclxuICAgICAgICB5ID4gMSA/IDEgOiB5O1xyXG5cclxuICAgIHJldHVybiBbeCwgeSwgMF07XHJcbn1cclxuXHJcbi8vIGNhbGN1bGF0ZSBhcmVhIGFuZCBsZW5ndGggb2YgdGhlIHBvbHlcclxuZnVuY3Rpb24gY2FsY1NpemUocG9pbnRzKSB7XHJcbiAgICB2YXIgYXJlYSA9IDAsXHJcbiAgICAgICAgZGlzdCA9IDA7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIGEsIGI7IGkgPCBwb2ludHMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgYSA9IGIgfHwgcG9pbnRzW2ldO1xyXG4gICAgICAgIGIgPSBwb2ludHNbaSArIDFdO1xyXG5cclxuICAgICAgICBhcmVhICs9IGFbMF0gKiBiWzFdIC0gYlswXSAqIGFbMV07XHJcblxyXG4gICAgICAgIC8vIHVzZSBNYW5oYXR0YW4gZGlzdGFuY2UgaW5zdGVhZCBvZiBFdWNsaWRpYW4gb25lIHRvIGF2b2lkIGV4cGVuc2l2ZSBzcXVhcmUgcm9vdCBjb21wdXRhdGlvblxyXG4gICAgICAgIGRpc3QgKz0gTWF0aC5hYnMoYlswXSAtIGFbMF0pICsgTWF0aC5hYnMoYlsxXSAtIGFbMV0pO1xyXG4gICAgfVxyXG4gICAgcG9pbnRzLmFyZWEgPSBNYXRoLmFicyhhcmVhIC8gMik7XHJcbiAgICBwb2ludHMuZGlzdCA9IGRpc3Q7XHJcbn1cclxuXHJcbi8vIGNhbGN1bGF0ZSB0aGUgZmVhdHVyZSBib3VuZGluZyBib3ggZm9yIGZhc3RlciBjbGlwcGluZyBsYXRlclxyXG5mdW5jdGlvbiBjYWxjQkJveChmZWF0dXJlKSB7XHJcbiAgICB2YXIgZ2VvbWV0cnkgPSBmZWF0dXJlLmdlb21ldHJ5LFxyXG4gICAgICAgIG1pbiA9IGZlYXR1cmUubWluLFxyXG4gICAgICAgIG1heCA9IGZlYXR1cmUubWF4O1xyXG5cclxuICAgIGlmIChmZWF0dXJlLnR5cGUgPT09IDEpIGNhbGNSaW5nQkJveChtaW4sIG1heCwgZ2VvbWV0cnkpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gMDsgaSA8IGdlb21ldHJ5Lmxlbmd0aDsgaSsrKSBjYWxjUmluZ0JCb3gobWluLCBtYXgsIGdlb21ldHJ5W2ldKTtcclxuXHJcbiAgICByZXR1cm4gZmVhdHVyZTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2FsY1JpbmdCQm94KG1pbiwgbWF4LCBwb2ludHMpIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgcCA9IHBvaW50c1tpXTtcclxuICAgICAgICBtaW5bMF0gPSBNYXRoLm1pbihwWzBdLCBtaW5bMF0pO1xyXG4gICAgICAgIG1heFswXSA9IE1hdGgubWF4KHBbMF0sIG1heFswXSk7XHJcbiAgICAgICAgbWluWzFdID0gTWF0aC5taW4ocFsxXSwgbWluWzFdKTtcclxuICAgICAgICBtYXhbMV0gPSBNYXRoLm1heChwWzFdLCBtYXhbMV0pO1xyXG4gICAgfVxyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZ2VvanNvbnZ0O1xyXG5cclxudmFyIGNvbnZlcnQgPSByZXF1aXJlKCcuL2NvbnZlcnQnKSwgICAgIC8vIEdlb0pTT04gY29udmVyc2lvbiBhbmQgcHJlcHJvY2Vzc2luZ1xyXG4gICAgdHJhbnNmb3JtID0gcmVxdWlyZSgnLi90cmFuc2Zvcm0nKSwgLy8gY29vcmRpbmF0ZSB0cmFuc2Zvcm1hdGlvblxyXG4gICAgY2xpcCA9IHJlcXVpcmUoJy4vY2xpcCcpLCAgICAgICAgICAgLy8gc3RyaXBlIGNsaXBwaW5nIGFsZ29yaXRobVxyXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcCcpLCAgICAgICAgICAgLy8gZGF0ZSBsaW5lIHByb2Nlc3NpbmdcclxuICAgIGNyZWF0ZVRpbGUgPSByZXF1aXJlKCcuL3RpbGUnKTsgICAgIC8vIGZpbmFsIHNpbXBsaWZpZWQgdGlsZSBnZW5lcmF0aW9uXHJcblxyXG5cclxuZnVuY3Rpb24gZ2VvanNvbnZ0KGRhdGEsIG9wdGlvbnMpIHtcclxuICAgIHJldHVybiBuZXcgR2VvSlNPTlZUKGRhdGEsIG9wdGlvbnMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBHZW9KU09OVlQoZGF0YSwgb3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyA9IGV4dGVuZChPYmplY3QuY3JlYXRlKHRoaXMub3B0aW9ucyksIG9wdGlvbnMpO1xyXG5cclxuICAgIHZhciBkZWJ1ZyA9IG9wdGlvbnMuZGVidWc7XHJcblxyXG4gICAgaWYgKGRlYnVnKSBjb25zb2xlLnRpbWUoJ3ByZXByb2Nlc3MgZGF0YScpO1xyXG5cclxuICAgIHZhciB6MiA9IDEgPDwgb3B0aW9ucy5tYXhab29tLCAvLyAyXnpcclxuICAgICAgICBmZWF0dXJlcyA9IGNvbnZlcnQoZGF0YSwgb3B0aW9ucy50b2xlcmFuY2UgLyAoejIgKiBvcHRpb25zLmV4dGVudCkpO1xyXG5cclxuICAgIHRoaXMudGlsZXMgPSB7fTtcclxuICAgIHRoaXMudGlsZUNvb3JkcyA9IFtdO1xyXG5cclxuICAgIGlmIChkZWJ1Zykge1xyXG4gICAgICAgIGNvbnNvbGUudGltZUVuZCgncHJlcHJvY2VzcyBkYXRhJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2luZGV4OiBtYXhab29tOiAlZCwgbWF4UG9pbnRzOiAlZCcsIG9wdGlvbnMuaW5kZXhNYXhab29tLCBvcHRpb25zLmluZGV4TWF4UG9pbnRzKTtcclxuICAgICAgICBjb25zb2xlLnRpbWUoJ2dlbmVyYXRlIHRpbGVzJyk7XHJcbiAgICAgICAgdGhpcy5zdGF0cyA9IHt9O1xyXG4gICAgICAgIHRoaXMudG90YWwgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZlYXR1cmVzID0gd3JhcChmZWF0dXJlcywgb3B0aW9ucy5idWZmZXIgLyBvcHRpb25zLmV4dGVudCwgaW50ZXJzZWN0WCk7XHJcblxyXG4gICAgLy8gc3RhcnQgc2xpY2luZyBmcm9tIHRoZSB0b3AgdGlsZSBkb3duXHJcbiAgICBpZiAoZmVhdHVyZXMubGVuZ3RoKSB0aGlzLnNwbGl0VGlsZShmZWF0dXJlcywgMCwgMCwgMCk7XHJcblxyXG4gICAgaWYgKGRlYnVnKSB7XHJcbiAgICAgICAgaWYgKGZlYXR1cmVzLmxlbmd0aCkgY29uc29sZS5sb2coJ2ZlYXR1cmVzOiAlZCwgcG9pbnRzOiAlZCcsIHRoaXMudGlsZXNbMF0ubnVtRmVhdHVyZXMsIHRoaXMudGlsZXNbMF0ubnVtUG9pbnRzKTtcclxuICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ2dlbmVyYXRlIHRpbGVzJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3RpbGVzIGdlbmVyYXRlZDonLCB0aGlzLnRvdGFsLCBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRzKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkdlb0pTT05WVC5wcm90b3R5cGUub3B0aW9ucyA9IHtcclxuICAgIG1heFpvb206IDE0LCAgICAgICAgICAgIC8vIG1heCB6b29tIHRvIHByZXNlcnZlIGRldGFpbCBvblxyXG4gICAgaW5kZXhNYXhab29tOiA1LCAgICAgICAgLy8gbWF4IHpvb20gaW4gdGhlIHRpbGUgaW5kZXhcclxuICAgIGluZGV4TWF4UG9pbnRzOiAxMDAwMDAsIC8vIG1heCBudW1iZXIgb2YgcG9pbnRzIHBlciB0aWxlIGluIHRoZSB0aWxlIGluZGV4XHJcbiAgICBzb2xpZENoaWxkcmVuOiBmYWxzZSwgICAvLyB3aGV0aGVyIHRvIHRpbGUgc29saWQgc3F1YXJlIHRpbGVzIGZ1cnRoZXJcclxuICAgIHRvbGVyYW5jZTogMywgICAgICAgICAgIC8vIHNpbXBsaWZpY2F0aW9uIHRvbGVyYW5jZSAoaGlnaGVyIG1lYW5zIHNpbXBsZXIpXHJcbiAgICBleHRlbnQ6IDQwOTYsICAgICAgICAgICAvLyB0aWxlIGV4dGVudFxyXG4gICAgYnVmZmVyOiA2NCwgICAgICAgICAgICAgLy8gdGlsZSBidWZmZXIgb24gZWFjaCBzaWRlXHJcbiAgICBkZWJ1ZzogMCAgICAgICAgICAgICAgICAvLyBsb2dnaW5nIGxldmVsICgwLCAxIG9yIDIpXHJcbn07XHJcblxyXG5HZW9KU09OVlQucHJvdG90eXBlLnNwbGl0VGlsZSA9IGZ1bmN0aW9uIChmZWF0dXJlcywgeiwgeCwgeSwgY3osIGN4LCBjeSkge1xyXG5cclxuICAgIHZhciBzdGFjayA9IFtmZWF0dXJlcywgeiwgeCwgeV0sXHJcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcclxuICAgICAgICBkZWJ1ZyA9IG9wdGlvbnMuZGVidWc7XHJcblxyXG4gICAgLy8gYXZvaWQgcmVjdXJzaW9uIGJ5IHVzaW5nIGEgcHJvY2Vzc2luZyBxdWV1ZVxyXG4gICAgd2hpbGUgKHN0YWNrLmxlbmd0aCkge1xyXG4gICAgICAgIHkgPSBzdGFjay5wb3AoKTtcclxuICAgICAgICB4ID0gc3RhY2sucG9wKCk7XHJcbiAgICAgICAgeiA9IHN0YWNrLnBvcCgpO1xyXG4gICAgICAgIGZlYXR1cmVzID0gc3RhY2sucG9wKCk7XHJcblxyXG4gICAgICAgIHZhciB6MiA9IDEgPDwgeixcclxuICAgICAgICAgICAgaWQgPSB0b0lEKHosIHgsIHkpLFxyXG4gICAgICAgICAgICB0aWxlID0gdGhpcy50aWxlc1tpZF0sXHJcbiAgICAgICAgICAgIHRpbGVUb2xlcmFuY2UgPSB6ID09PSBvcHRpb25zLm1heFpvb20gPyAwIDogb3B0aW9ucy50b2xlcmFuY2UgLyAoejIgKiBvcHRpb25zLmV4dGVudCk7XHJcblxyXG4gICAgICAgIGlmICghdGlsZSkge1xyXG4gICAgICAgICAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLnRpbWUoJ2NyZWF0aW9uJyk7XHJcblxyXG4gICAgICAgICAgICB0aWxlID0gdGhpcy50aWxlc1tpZF0gPSBjcmVhdGVUaWxlKGZlYXR1cmVzLCB6MiwgeCwgeSwgdGlsZVRvbGVyYW5jZSwgeiA9PT0gb3B0aW9ucy5tYXhab29tKTtcclxuICAgICAgICAgICAgdGhpcy50aWxlQ29vcmRzLnB1c2goe3o6IHosIHg6IHgsIHk6IHl9KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZWJ1Zykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRlYnVnID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aWxlIHolZC0lZC0lZCAoZmVhdHVyZXM6ICVkLCBwb2ludHM6ICVkLCBzaW1wbGlmaWVkOiAlZCknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6LCB4LCB5LCB0aWxlLm51bUZlYXR1cmVzLCB0aWxlLm51bVBvaW50cywgdGlsZS5udW1TaW1wbGlmaWVkKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ2NyZWF0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gJ3onICsgejtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdHNba2V5XSA9ICh0aGlzLnN0YXRzW2tleV0gfHwgMCkgKyAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBnZW9tZXRyeSBpbiB0aWxlIHNvIHRoYXQgd2UgY2FuIGRyaWxsIGRvd24gbGF0ZXIgaWYgd2Ugc3RvcCBub3dcclxuICAgICAgICB0aWxlLnNvdXJjZSA9IGZlYXR1cmVzO1xyXG5cclxuICAgICAgICAvLyBzdG9wIHRpbGluZyBpZiB0aGUgdGlsZSBpcyBzb2xpZCBjbGlwcGVkIHNxdWFyZVxyXG4gICAgICAgIGlmICghb3B0aW9ucy5zb2xpZENoaWxkcmVuICYmIGlzQ2xpcHBlZFNxdWFyZSh0aWxlLCBvcHRpb25zLmV4dGVudCwgb3B0aW9ucy5idWZmZXIpKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgLy8gaWYgaXQncyB0aGUgZmlyc3QtcGFzcyB0aWxpbmdcclxuICAgICAgICBpZiAoIWN6KSB7XHJcbiAgICAgICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIHdlIHJlYWNoZWQgbWF4IHpvb20sIG9yIGlmIHRoZSB0aWxlIGlzIHRvbyBzaW1wbGVcclxuICAgICAgICAgICAgaWYgKHogPT09IG9wdGlvbnMuaW5kZXhNYXhab29tIHx8IHRpbGUubnVtUG9pbnRzIDw9IG9wdGlvbnMuaW5kZXhNYXhQb2ludHMpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAvLyBpZiBhIGRyaWxsZG93biB0byBhIHNwZWNpZmljIHRpbGVcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBzdG9wIHRpbGluZyBpZiB3ZSByZWFjaGVkIGJhc2Ugem9vbSBvciBvdXIgdGFyZ2V0IHRpbGUgem9vbVxyXG4gICAgICAgICAgICBpZiAoeiA9PT0gb3B0aW9ucy5tYXhab29tIHx8IHogPT09IGN6KSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIGl0J3Mgbm90IGFuIGFuY2VzdG9yIG9mIHRoZSB0YXJnZXQgdGlsZVxyXG4gICAgICAgICAgICB2YXIgbSA9IDEgPDwgKGN6IC0geik7XHJcbiAgICAgICAgICAgIGlmICh4ICE9PSBNYXRoLmZsb29yKGN4IC8gbSkgfHwgeSAhPT0gTWF0aC5mbG9vcihjeSAvIG0pKSBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIHdlIHNsaWNlIGZ1cnRoZXIgZG93biwgbm8gbmVlZCB0byBrZWVwIHNvdXJjZSBnZW9tZXRyeVxyXG4gICAgICAgIHRpbGUuc291cmNlID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lKCdjbGlwcGluZycpO1xyXG5cclxuICAgICAgICAvLyB2YWx1ZXMgd2UnbGwgdXNlIGZvciBjbGlwcGluZ1xyXG4gICAgICAgIHZhciBrMSA9IDAuNSAqIG9wdGlvbnMuYnVmZmVyIC8gb3B0aW9ucy5leHRlbnQsXHJcbiAgICAgICAgICAgIGsyID0gMC41IC0gazEsXHJcbiAgICAgICAgICAgIGszID0gMC41ICsgazEsXHJcbiAgICAgICAgICAgIGs0ID0gMSArIGsxLFxyXG4gICAgICAgICAgICB0bCwgYmwsIHRyLCBiciwgbGVmdCwgcmlnaHQ7XHJcblxyXG4gICAgICAgIHRsID0gYmwgPSB0ciA9IGJyID0gbnVsbDtcclxuXHJcbiAgICAgICAgbGVmdCAgPSBjbGlwKGZlYXR1cmVzLCB6MiwgeCAtIGsxLCB4ICsgazMsIDAsIGludGVyc2VjdFgsIHRpbGUubWluWzBdLCB0aWxlLm1heFswXSk7XHJcbiAgICAgICAgcmlnaHQgPSBjbGlwKGZlYXR1cmVzLCB6MiwgeCArIGsyLCB4ICsgazQsIDAsIGludGVyc2VjdFgsIHRpbGUubWluWzBdLCB0aWxlLm1heFswXSk7XHJcblxyXG4gICAgICAgIGlmIChsZWZ0KSB7XHJcbiAgICAgICAgICAgIHRsID0gY2xpcChsZWZ0LCB6MiwgeSAtIGsxLCB5ICsgazMsIDEsIGludGVyc2VjdFksIHRpbGUubWluWzFdLCB0aWxlLm1heFsxXSk7XHJcbiAgICAgICAgICAgIGJsID0gY2xpcChsZWZ0LCB6MiwgeSArIGsyLCB5ICsgazQsIDEsIGludGVyc2VjdFksIHRpbGUubWluWzFdLCB0aWxlLm1heFsxXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocmlnaHQpIHtcclxuICAgICAgICAgICAgdHIgPSBjbGlwKHJpZ2h0LCB6MiwgeSAtIGsxLCB5ICsgazMsIDEsIGludGVyc2VjdFksIHRpbGUubWluWzFdLCB0aWxlLm1heFsxXSk7XHJcbiAgICAgICAgICAgIGJyID0gY2xpcChyaWdodCwgejIsIHkgKyBrMiwgeSArIGs0LCAxLCBpbnRlcnNlY3RZLCB0aWxlLm1pblsxXSwgdGlsZS5tYXhbMV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lRW5kKCdjbGlwcGluZycpO1xyXG5cclxuICAgICAgICBpZiAodGwpIHN0YWNrLnB1c2godGwsIHogKyAxLCB4ICogMiwgICAgIHkgKiAyKTtcclxuICAgICAgICBpZiAoYmwpIHN0YWNrLnB1c2goYmwsIHogKyAxLCB4ICogMiwgICAgIHkgKiAyICsgMSk7XHJcbiAgICAgICAgaWYgKHRyKSBzdGFjay5wdXNoKHRyLCB6ICsgMSwgeCAqIDIgKyAxLCB5ICogMik7XHJcbiAgICAgICAgaWYgKGJyKSBzdGFjay5wdXNoKGJyLCB6ICsgMSwgeCAqIDIgKyAxLCB5ICogMiArIDEpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuR2VvSlNPTlZULnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24gKHosIHgsIHkpIHtcclxuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxyXG4gICAgICAgIGV4dGVudCA9IG9wdGlvbnMuZXh0ZW50LFxyXG4gICAgICAgIGRlYnVnID0gb3B0aW9ucy5kZWJ1ZztcclxuXHJcbiAgICB2YXIgejIgPSAxIDw8IHo7XHJcbiAgICB4ID0gKCh4ICUgejIpICsgejIpICUgejI7IC8vIHdyYXAgdGlsZSB4IGNvb3JkaW5hdGVcclxuXHJcbiAgICB2YXIgaWQgPSB0b0lEKHosIHgsIHkpO1xyXG4gICAgaWYgKHRoaXMudGlsZXNbaWRdKSByZXR1cm4gdHJhbnNmb3JtLnRpbGUodGhpcy50aWxlc1tpZF0sIGV4dGVudCk7XHJcblxyXG4gICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS5sb2coJ2RyaWxsaW5nIGRvd24gdG8geiVkLSVkLSVkJywgeiwgeCwgeSk7XHJcblxyXG4gICAgdmFyIHowID0geixcclxuICAgICAgICB4MCA9IHgsXHJcbiAgICAgICAgeTAgPSB5LFxyXG4gICAgICAgIHBhcmVudDtcclxuXHJcbiAgICB3aGlsZSAoIXBhcmVudCAmJiB6MCA+IDApIHtcclxuICAgICAgICB6MC0tO1xyXG4gICAgICAgIHgwID0gTWF0aC5mbG9vcih4MCAvIDIpO1xyXG4gICAgICAgIHkwID0gTWF0aC5mbG9vcih5MCAvIDIpO1xyXG4gICAgICAgIHBhcmVudCA9IHRoaXMudGlsZXNbdG9JRCh6MCwgeDAsIHkwKV07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFwYXJlbnQpIHJldHVybiBudWxsO1xyXG5cclxuICAgIGlmIChkZWJ1ZyA+IDEpIGNvbnNvbGUubG9nKCdmb3VuZCBwYXJlbnQgdGlsZSB6JWQtJWQtJWQnLCB6MCwgeDAsIHkwKTtcclxuXHJcbiAgICAvLyBpZiB3ZSBmb3VuZCBhIHBhcmVudCB0aWxlIGNvbnRhaW5pbmcgdGhlIG9yaWdpbmFsIGdlb21ldHJ5LCB3ZSBjYW4gZHJpbGwgZG93biBmcm9tIGl0XHJcbiAgICBpZiAocGFyZW50LnNvdXJjZSkge1xyXG4gICAgICAgIGlmIChpc0NsaXBwZWRTcXVhcmUocGFyZW50LCBleHRlbnQsIG9wdGlvbnMuYnVmZmVyKSkgcmV0dXJuIHRyYW5zZm9ybS50aWxlKHBhcmVudCwgZXh0ZW50KTtcclxuXHJcbiAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lKCdkcmlsbGluZyBkb3duJyk7XHJcbiAgICAgICAgdGhpcy5zcGxpdFRpbGUocGFyZW50LnNvdXJjZSwgejAsIHgwLCB5MCwgeiwgeCwgeSk7XHJcbiAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lRW5kKCdkcmlsbGluZyBkb3duJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLnRpbGVzW2lkXSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgcmV0dXJuIHRyYW5zZm9ybS50aWxlKHRoaXMudGlsZXNbaWRdLCBleHRlbnQpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gdG9JRCh6LCB4LCB5KSB7XHJcbiAgICByZXR1cm4gKCgoMSA8PCB6KSAqIHkgKyB4KSAqIDMyKSArIHo7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGludGVyc2VjdFgoYSwgYiwgeCkge1xyXG4gICAgcmV0dXJuIFt4LCAoeCAtIGFbMF0pICogKGJbMV0gLSBhWzFdKSAvIChiWzBdIC0gYVswXSkgKyBhWzFdLCAxXTtcclxufVxyXG5mdW5jdGlvbiBpbnRlcnNlY3RZKGEsIGIsIHkpIHtcclxuICAgIHJldHVybiBbKHkgLSBhWzFdKSAqIChiWzBdIC0gYVswXSkgLyAoYlsxXSAtIGFbMV0pICsgYVswXSwgeSwgMV07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4dGVuZChkZXN0LCBzcmMpIHtcclxuICAgIGZvciAodmFyIGkgaW4gc3JjKSBkZXN0W2ldID0gc3JjW2ldO1xyXG4gICAgcmV0dXJuIGRlc3Q7XHJcbn1cclxuXHJcbi8vIGNoZWNrcyB3aGV0aGVyIGEgdGlsZSBpcyBhIHdob2xlLWFyZWEgZmlsbCBhZnRlciBjbGlwcGluZzsgaWYgaXQgaXMsIHRoZXJlJ3Mgbm8gc2Vuc2Ugc2xpY2luZyBpdCBmdXJ0aGVyXHJcbmZ1bmN0aW9uIGlzQ2xpcHBlZFNxdWFyZSh0aWxlLCBleHRlbnQsIGJ1ZmZlcikge1xyXG5cclxuICAgIHZhciBmZWF0dXJlcyA9IHRpbGUuc291cmNlO1xyXG4gICAgaWYgKGZlYXR1cmVzLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHZhciBmZWF0dXJlID0gZmVhdHVyZXNbMF07XHJcbiAgICBpZiAoZmVhdHVyZS50eXBlICE9PSAzIHx8IGZlYXR1cmUuZ2VvbWV0cnkubGVuZ3RoID4gMSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIHZhciBsZW4gPSBmZWF0dXJlLmdlb21ldHJ5WzBdLmxlbmd0aDtcclxuICAgIGlmIChsZW4gIT09IDUpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHAgPSB0cmFuc2Zvcm0ucG9pbnQoZmVhdHVyZS5nZW9tZXRyeVswXVtpXSwgZXh0ZW50LCB0aWxlLnoyLCB0aWxlLngsIHRpbGUueSk7XHJcbiAgICAgICAgaWYgKChwWzBdICE9PSAtYnVmZmVyICYmIHBbMF0gIT09IGV4dGVudCArIGJ1ZmZlcikgfHxcclxuICAgICAgICAgICAgKHBbMV0gIT09IC1idWZmZXIgJiYgcFsxXSAhPT0gZXh0ZW50ICsgYnVmZmVyKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2ltcGxpZnk7XHJcblxyXG4vLyBjYWxjdWxhdGUgc2ltcGxpZmljYXRpb24gZGF0YSB1c2luZyBvcHRpbWl6ZWQgRG91Z2xhcy1QZXVja2VyIGFsZ29yaXRobVxyXG5cclxuZnVuY3Rpb24gc2ltcGxpZnkocG9pbnRzLCB0b2xlcmFuY2UpIHtcclxuXHJcbiAgICB2YXIgc3FUb2xlcmFuY2UgPSB0b2xlcmFuY2UgKiB0b2xlcmFuY2UsXHJcbiAgICAgICAgbGVuID0gcG9pbnRzLmxlbmd0aCxcclxuICAgICAgICBmaXJzdCA9IDAsXHJcbiAgICAgICAgbGFzdCA9IGxlbiAtIDEsXHJcbiAgICAgICAgc3RhY2sgPSBbXSxcclxuICAgICAgICBpLCBtYXhTcURpc3QsIHNxRGlzdCwgaW5kZXg7XHJcblxyXG4gICAgLy8gYWx3YXlzIHJldGFpbiB0aGUgZW5kcG9pbnRzICgxIGlzIHRoZSBtYXggdmFsdWUpXHJcbiAgICBwb2ludHNbZmlyc3RdWzJdID0gMTtcclxuICAgIHBvaW50c1tsYXN0XVsyXSA9IDE7XHJcblxyXG4gICAgLy8gYXZvaWQgcmVjdXJzaW9uIGJ5IHVzaW5nIGEgc3RhY2tcclxuICAgIHdoaWxlIChsYXN0KSB7XHJcblxyXG4gICAgICAgIG1heFNxRGlzdCA9IDA7XHJcblxyXG4gICAgICAgIGZvciAoaSA9IGZpcnN0ICsgMTsgaSA8IGxhc3Q7IGkrKykge1xyXG4gICAgICAgICAgICBzcURpc3QgPSBnZXRTcVNlZ0Rpc3QocG9pbnRzW2ldLCBwb2ludHNbZmlyc3RdLCBwb2ludHNbbGFzdF0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNxRGlzdCA+IG1heFNxRGlzdCkge1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSBpO1xyXG4gICAgICAgICAgICAgICAgbWF4U3FEaXN0ID0gc3FEaXN0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobWF4U3FEaXN0ID4gc3FUb2xlcmFuY2UpIHtcclxuICAgICAgICAgICAgcG9pbnRzW2luZGV4XVsyXSA9IG1heFNxRGlzdDsgLy8gc2F2ZSB0aGUgcG9pbnQgaW1wb3J0YW5jZSBpbiBzcXVhcmVkIHBpeGVscyBhcyBhIHogY29vcmRpbmF0ZVxyXG4gICAgICAgICAgICBzdGFjay5wdXNoKGZpcnN0KTtcclxuICAgICAgICAgICAgc3RhY2sucHVzaChpbmRleCk7XHJcbiAgICAgICAgICAgIGZpcnN0ID0gaW5kZXg7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxhc3QgPSBzdGFjay5wb3AoKTtcclxuICAgICAgICAgICAgZmlyc3QgPSBzdGFjay5wb3AoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIHNxdWFyZSBkaXN0YW5jZSBmcm9tIGEgcG9pbnQgdG8gYSBzZWdtZW50XHJcbmZ1bmN0aW9uIGdldFNxU2VnRGlzdChwLCBhLCBiKSB7XHJcblxyXG4gICAgdmFyIHggPSBhWzBdLCB5ID0gYVsxXSxcclxuICAgICAgICBieCA9IGJbMF0sIGJ5ID0gYlsxXSxcclxuICAgICAgICBweCA9IHBbMF0sIHB5ID0gcFsxXSxcclxuICAgICAgICBkeCA9IGJ4IC0geCxcclxuICAgICAgICBkeSA9IGJ5IC0geTtcclxuXHJcbiAgICBpZiAoZHggIT09IDAgfHwgZHkgIT09IDApIHtcclxuXHJcbiAgICAgICAgdmFyIHQgPSAoKHB4IC0geCkgKiBkeCArIChweSAtIHkpICogZHkpIC8gKGR4ICogZHggKyBkeSAqIGR5KTtcclxuXHJcbiAgICAgICAgaWYgKHQgPiAxKSB7XHJcbiAgICAgICAgICAgIHggPSBieDtcclxuICAgICAgICAgICAgeSA9IGJ5O1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHQgPiAwKSB7XHJcbiAgICAgICAgICAgIHggKz0gZHggKiB0O1xyXG4gICAgICAgICAgICB5ICs9IGR5ICogdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZHggPSBweCAtIHg7XHJcbiAgICBkeSA9IHB5IC0geTtcclxuXHJcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVUaWxlO1xyXG5cclxuZnVuY3Rpb24gY3JlYXRlVGlsZShmZWF0dXJlcywgejIsIHR4LCB0eSwgdG9sZXJhbmNlLCBub1NpbXBsaWZ5KSB7XHJcbiAgICB2YXIgdGlsZSA9IHtcclxuICAgICAgICBmZWF0dXJlczogW10sXHJcbiAgICAgICAgbnVtUG9pbnRzOiAwLFxyXG4gICAgICAgIG51bVNpbXBsaWZpZWQ6IDAsXHJcbiAgICAgICAgbnVtRmVhdHVyZXM6IDAsXHJcbiAgICAgICAgc291cmNlOiBudWxsLFxyXG4gICAgICAgIHg6IHR4LFxyXG4gICAgICAgIHk6IHR5LFxyXG4gICAgICAgIHoyOiB6MixcclxuICAgICAgICB0cmFuc2Zvcm1lZDogZmFsc2UsXHJcbiAgICAgICAgbWluOiBbMiwgMV0sXHJcbiAgICAgICAgbWF4OiBbLTEsIDBdXHJcbiAgICB9O1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHRpbGUubnVtRmVhdHVyZXMrKztcclxuICAgICAgICBhZGRGZWF0dXJlKHRpbGUsIGZlYXR1cmVzW2ldLCB0b2xlcmFuY2UsIG5vU2ltcGxpZnkpO1xyXG5cclxuICAgICAgICB2YXIgbWluID0gZmVhdHVyZXNbaV0ubWluLFxyXG4gICAgICAgICAgICBtYXggPSBmZWF0dXJlc1tpXS5tYXg7XHJcblxyXG4gICAgICAgIGlmIChtaW5bMF0gPCB0aWxlLm1pblswXSkgdGlsZS5taW5bMF0gPSBtaW5bMF07XHJcbiAgICAgICAgaWYgKG1pblsxXSA8IHRpbGUubWluWzFdKSB0aWxlLm1pblsxXSA9IG1pblsxXTtcclxuICAgICAgICBpZiAobWF4WzBdID4gdGlsZS5tYXhbMF0pIHRpbGUubWF4WzBdID0gbWF4WzBdO1xyXG4gICAgICAgIGlmIChtYXhbMV0gPiB0aWxlLm1heFsxXSkgdGlsZS5tYXhbMV0gPSBtYXhbMV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGlsZTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkRmVhdHVyZSh0aWxlLCBmZWF0dXJlLCB0b2xlcmFuY2UsIG5vU2ltcGxpZnkpIHtcclxuXHJcbiAgICB2YXIgZ2VvbSA9IGZlYXR1cmUuZ2VvbWV0cnksXHJcbiAgICAgICAgdHlwZSA9IGZlYXR1cmUudHlwZSxcclxuICAgICAgICBzaW1wbGlmaWVkID0gW10sXHJcbiAgICAgICAgc3FUb2xlcmFuY2UgPSB0b2xlcmFuY2UgKiB0b2xlcmFuY2UsXHJcbiAgICAgICAgaSwgaiwgcmluZywgcDtcclxuXHJcbiAgICBpZiAodHlwZSA9PT0gMSkge1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBnZW9tLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHNpbXBsaWZpZWQucHVzaChnZW9tW2ldKTtcclxuICAgICAgICAgICAgdGlsZS5udW1Qb2ludHMrKztcclxuICAgICAgICAgICAgdGlsZS5udW1TaW1wbGlmaWVkKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIHNpbXBsaWZ5IGFuZCB0cmFuc2Zvcm0gcHJvamVjdGVkIGNvb3JkaW5hdGVzIGZvciB0aWxlIGdlb21ldHJ5XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGdlb20ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcmluZyA9IGdlb21baV07XHJcblxyXG4gICAgICAgICAgICAvLyBmaWx0ZXIgb3V0IHRpbnkgcG9seWxpbmVzICYgcG9seWdvbnNcclxuICAgICAgICAgICAgaWYgKCFub1NpbXBsaWZ5ICYmICgodHlwZSA9PT0gMiAmJiByaW5nLmRpc3QgPCB0b2xlcmFuY2UpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHR5cGUgPT09IDMgJiYgcmluZy5hcmVhIDwgc3FUb2xlcmFuY2UpKSkge1xyXG4gICAgICAgICAgICAgICAgdGlsZS5udW1Qb2ludHMgKz0gcmluZy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHNpbXBsaWZpZWRSaW5nID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgcmluZy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcCA9IHJpbmdbal07XHJcbiAgICAgICAgICAgICAgICAvLyBrZWVwIHBvaW50cyB3aXRoIGltcG9ydGFuY2UgPiB0b2xlcmFuY2VcclxuICAgICAgICAgICAgICAgIGlmIChub1NpbXBsaWZ5IHx8IHBbMl0gPiBzcVRvbGVyYW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNpbXBsaWZpZWRSaW5nLnB1c2gocCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGlsZS5udW1TaW1wbGlmaWVkKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aWxlLm51bVBvaW50cysrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzaW1wbGlmaWVkLnB1c2goc2ltcGxpZmllZFJpbmcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2ltcGxpZmllZC5sZW5ndGgpIHtcclxuICAgICAgICB0aWxlLmZlYXR1cmVzLnB1c2goe1xyXG4gICAgICAgICAgICBnZW9tZXRyeTogc2ltcGxpZmllZCxcclxuICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgdGFnczogZmVhdHVyZS50YWdzIHx8IG51bGxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5leHBvcnRzLnRpbGUgPSB0cmFuc2Zvcm1UaWxlO1xyXG5leHBvcnRzLnBvaW50ID0gdHJhbnNmb3JtUG9pbnQ7XHJcblxyXG4vLyBUcmFuc2Zvcm1zIHRoZSBjb29yZGluYXRlcyBvZiBlYWNoIGZlYXR1cmUgaW4gdGhlIGdpdmVuIHRpbGUgZnJvbVxyXG4vLyBtZXJjYXRvci1wcm9qZWN0ZWQgc3BhY2UgaW50byAoZXh0ZW50IHggZXh0ZW50KSB0aWxlIHNwYWNlLlxyXG5mdW5jdGlvbiB0cmFuc2Zvcm1UaWxlKHRpbGUsIGV4dGVudCkge1xyXG4gICAgaWYgKHRpbGUudHJhbnNmb3JtZWQpIHJldHVybiB0aWxlO1xyXG5cclxuICAgIHZhciB6MiA9IHRpbGUuejIsXHJcbiAgICAgICAgdHggPSB0aWxlLngsXHJcbiAgICAgICAgdHkgPSB0aWxlLnksXHJcbiAgICAgICAgaSwgaiwgaztcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGlsZS5mZWF0dXJlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBmZWF0dXJlID0gdGlsZS5mZWF0dXJlc1tpXSxcclxuICAgICAgICAgICAgZ2VvbSA9IGZlYXR1cmUuZ2VvbWV0cnksXHJcbiAgICAgICAgICAgIHR5cGUgPSBmZWF0dXJlLnR5cGU7XHJcblxyXG4gICAgICAgIGlmICh0eXBlID09PSAxKSB7XHJcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBnZW9tLmxlbmd0aDsgaisrKSBnZW9tW2pdID0gdHJhbnNmb3JtUG9pbnQoZ2VvbVtqXSwgZXh0ZW50LCB6MiwgdHgsIHR5KTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IGdlb20ubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHZhciByaW5nID0gZ2VvbVtqXTtcclxuICAgICAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCByaW5nLmxlbmd0aDsgaysrKSByaW5nW2tdID0gdHJhbnNmb3JtUG9pbnQocmluZ1trXSwgZXh0ZW50LCB6MiwgdHgsIHR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aWxlLnRyYW5zZm9ybWVkID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gdGlsZTtcclxufVxyXG5cclxuZnVuY3Rpb24gdHJhbnNmb3JtUG9pbnQocCwgZXh0ZW50LCB6MiwgdHgsIHR5KSB7XHJcbiAgICB2YXIgeCA9IE1hdGgucm91bmQoZXh0ZW50ICogKHBbMF0gKiB6MiAtIHR4KSksXHJcbiAgICAgICAgeSA9IE1hdGgucm91bmQoZXh0ZW50ICogKHBbMV0gKiB6MiAtIHR5KSk7XHJcbiAgICByZXR1cm4gW3gsIHldO1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBjbGlwID0gcmVxdWlyZSgnLi9jbGlwJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdyYXA7XHJcblxyXG5mdW5jdGlvbiB3cmFwKGZlYXR1cmVzLCBidWZmZXIsIGludGVyc2VjdFgpIHtcclxuICAgIHZhciBtZXJnZWQgPSBmZWF0dXJlcyxcclxuICAgICAgICBsZWZ0ICA9IGNsaXAoZmVhdHVyZXMsIDEsIC0xIC0gYnVmZmVyLCBidWZmZXIsICAgICAwLCBpbnRlcnNlY3RYLCAtMSwgMiksIC8vIGxlZnQgd29ybGQgY29weVxyXG4gICAgICAgIHJpZ2h0ID0gY2xpcChmZWF0dXJlcywgMSwgIDEgLSBidWZmZXIsIDIgKyBidWZmZXIsIDAsIGludGVyc2VjdFgsIC0xLCAyKTsgLy8gcmlnaHQgd29ybGQgY29weVxyXG5cclxuICAgIGlmIChsZWZ0IHx8IHJpZ2h0KSB7XHJcbiAgICAgICAgbWVyZ2VkID0gY2xpcChmZWF0dXJlcywgMSwgLWJ1ZmZlciwgMSArIGJ1ZmZlciwgMCwgaW50ZXJzZWN0WCwgLTEsIDIpOyAvLyBjZW50ZXIgd29ybGQgY29weVxyXG5cclxuICAgICAgICBpZiAobGVmdCkgbWVyZ2VkID0gc2hpZnRGZWF0dXJlQ29vcmRzKGxlZnQsIDEpLmNvbmNhdChtZXJnZWQpOyAvLyBtZXJnZSBsZWZ0IGludG8gY2VudGVyXHJcbiAgICAgICAgaWYgKHJpZ2h0KSBtZXJnZWQgPSBtZXJnZWQuY29uY2F0KHNoaWZ0RmVhdHVyZUNvb3JkcyhyaWdodCwgLTEpKTsgLy8gbWVyZ2UgcmlnaHQgaW50byBjZW50ZXJcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWVyZ2VkO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzaGlmdEZlYXR1cmVDb29yZHMoZmVhdHVyZXMsIG9mZnNldCkge1xyXG4gICAgdmFyIG5ld0ZlYXR1cmVzID0gW107XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBmZWF0dXJlID0gZmVhdHVyZXNbaV0sXHJcbiAgICAgICAgICAgIHR5cGUgPSBmZWF0dXJlLnR5cGU7XHJcblxyXG4gICAgICAgIHZhciBuZXdHZW9tZXRyeTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgbmV3R2VvbWV0cnkgPSBzaGlmdENvb3JkcyhmZWF0dXJlLmdlb21ldHJ5LCBvZmZzZXQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5ld0dlb21ldHJ5ID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZmVhdHVyZS5nZW9tZXRyeS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgbmV3R2VvbWV0cnkucHVzaChzaGlmdENvb3JkcyhmZWF0dXJlLmdlb21ldHJ5W2pdLCBvZmZzZXQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmV3RmVhdHVyZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBuZXdHZW9tZXRyeSxcclxuICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgdGFnczogZmVhdHVyZS50YWdzLFxyXG4gICAgICAgICAgICBtaW46IFtmZWF0dXJlLm1pblswXSArIG9mZnNldCwgZmVhdHVyZS5taW5bMV1dLFxyXG4gICAgICAgICAgICBtYXg6IFtmZWF0dXJlLm1heFswXSArIG9mZnNldCwgZmVhdHVyZS5tYXhbMV1dXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ld0ZlYXR1cmVzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzaGlmdENvb3Jkcyhwb2ludHMsIG9mZnNldCkge1xyXG4gICAgdmFyIG5ld1BvaW50cyA9IFtdO1xyXG4gICAgbmV3UG9pbnRzLmFyZWEgPSBwb2ludHMuYXJlYTtcclxuICAgIG5ld1BvaW50cy5kaXN0ID0gcG9pbnRzLmRpc3Q7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBuZXdQb2ludHMucHVzaChbcG9pbnRzW2ldWzBdICsgb2Zmc2V0LCBwb2ludHNbaV1bMV0sIHBvaW50c1tpXVsyXV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ld1BvaW50cztcclxufVxyXG4iXX0=
/* jshint ignore:end */;/* jshint ignore:start */
/*global window document console define require */
(function() {

    /**
     * @author James Cardona
     */

    "use strict";

    var root;
    root = typeof exports !== "undefined" && exports !== null ? exports : this;

    /*determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
      or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
      points-are-in-clockwise-order*/
    function ringIsClockwise(ringToTest) {
        var total = 0,i = 0,
            rLength = ringToTest.length,
            pt1 = ringToTest[i],
            pt2;
        for (i; i < rLength - 1; i++) {
            pt2 = ringToTest[i + 1];
            total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
            pt1 = pt2;
        }
        return (total >= 0);
    }

    /************************************
     * ESRI Rest to GeoJSON Converter
     ************************************/
    function esriConverter(){
        var esriCon = {};

        /*Converts ESRI Rest Geometry to GeoJSON Geometry
          Input is ESRI Rest Geometry Object*/
        function esriGeometryToGcGeometry(esriGeom){
            var gcGeom,
                i,
                g,
                coordinates,
                geomType,
                geomParts,
                polyArray,
                ringArray,
                ring;

            //check for x, points, paths, or rings to determine geometry type.
            if (esriGeom) {
                //gcGeom = {};
                if (((esriGeom.x && esriGeom.x !== "NaN") || esriGeom.x === 0) &&
                  ((esriGeom.y && esriGeom.y !== "NaN") || esriGeom.y === 0)) {
                    geomType = "Point";
                    coordinates = [esriGeom.x, esriGeom.y];
                } else if (esriGeom.points && esriGeom.points.length) {
                    geomType = "MultiPoint";
                    coordinates = esriGeom.points;
                } else if (esriGeom.paths && esriGeom.paths.length) {
                    geomParts = esriGeom.paths;
                    if (geomParts.length === 1) {
                        geomType = "LineString";
                        coordinates = geomParts[0];
                    } else {
                        geomType = "MultiLineString";
                        coordinates = geomParts;
                    }
                } else if (esriGeom.rings && esriGeom.rings.length) {
                    //array to hold the individual polygons. A polygon is an outer ring with one or more inner rings
                    //the conversion logic assumes that the Esri json is in the format of an outer ring (clockwise)
                    //followed by inner rings (counter-clockwise) with a clockwise ring signalling the start of a new polygon
                    polyArray = [];
                    geomParts = esriGeom.rings;
                    for (i = 0; i < geomParts.length; i++) {
                        ring = geomParts[i];
                        if (ringIsClockwise(ring)) {
                            //outer ring so new polygon. Add to poly array
                            polyArray.push([ring]);
                        } else if (polyArray.length > 0){
                            //inner ring. Add as part of last polygon in poly array
                            polyArray[polyArray.length - 1].push(ring);
                        }
                    }
                    if (polyArray.length > 1) {
                        //MultiPolygon. Leave coordinates wrapped in outer array
                        coordinates = polyArray;
                        geomType = "MultiPolygon";
                    } else {
                        //Polygon. Remove outer array wrapper.
                        coordinates = polyArray.pop();
                        geomType = "Polygon";
                    }
                }
                gcGeom = (coordinates && geomType) ? {type: geomType, coordinates: coordinates} : null;
                return gcGeom;
                //gcGeom.coordinates = coordinates;
            }
            return gcGeom;
        }

        /*
         * Converts GeoJSON feature to ESRI REST Feature.
         * Input parameter is an ESRI Rest Feature object
         */
        function esriFeatureToGcFeature(esriFeature) {
            var gcFeat = null,
                prop,
                gcProps,
                i,
                p;
            if (esriFeature) {
                gcFeat = {
                    type: "Feature"
                };
                if (esriFeature.geometry) {
                    gcFeat.geometry = esriGeometryToGcGeometry(esriFeature.geometry);
                }
                if (esriFeature.attributes) {
                    gcProps = {};
                    p = esriFeature.attributes;
                    for (prop in esriFeature.attributes) {
                        gcProps[prop] = esriFeature.attributes[prop];
                    }
                    gcFeat.properties = gcProps;
                }
            }
            return gcFeat;
        }

        /*Converts ESRI Rest Featureset, Feature, or Geometry
          to GeoJSON FeatureCollection, Feature, or Geometry */
        esriCon.toGeoJson = function(esriObject) {
            var outObj, i, esriFeats, gcFeat;
            if (esriObject){
                if (esriObject.features){
                    outObj = {
                        type: "FeatureCollection",
                        features: []
                    };
                    esriFeats = esriObject.features;
                    for (i = 0; i < esriFeats.length; i++) {
                        gcFeat = esriFeatureToGcFeature(esriFeats[i]);
                        if (gcFeat) {
                            outObj.features.push(gcFeat);
                        }
                    }
			    }
                else if (esriObject.geometry){
                    outObj = esriFeatureToGcFeature(esriObject);
                }
                else{
                    outObj = esriGeometryToGcGeometry(esriObject);
                }
            }
            return outObj;
        };

        return esriCon;
    }

    /************************************************
     * GeoJSON to ESRI Rest Converter
     ************************************************/
    function geoJsonConverter(){
        var gCon = {};

        /*compares a GeoJSON geometry type and ESRI geometry type to see if they can be safely
          put together in a single ESRI feature. ESRI features must only have one
          geometry type, point, line, polygon*/
        function isCompatible(esriGeomType, gcGeomType) {
            var compatible = false;
            if ((esriGeomType === "esriGeometryPoint" || esriGeomType === "esriGeometryMultipoint") && (gcGeomType === "Point" || gcGeomType === "MultiPoint")) {
                compatible = true;
            } else if (esriGeomType === "esriGeometryPolyline" && (gcGeomType === "LineString" || gcGeomType === "MultiLineString")) {
                compatible = true;
            } else if (esriGeomType === "esriGeometryPolygon" && (gcGeomType === "Polygon" || gcGeomType === "MultiPolygon")) {
                compatible = true;
            }
            return compatible;
        }

        /*Take a GeoJSON geometry type and make an object that has information about
          what the ESRI geometry should hold. Includes the ESRI geometry type and the name
          of the member that holds coordinate information*/
        function gcGeomTypeToEsriGeomInfo(gcType) {
            var esriType,
                geomHolderId;
            if (gcType === "Point") {
                esriType = "esriGeometryPoint";
            } else if (gcType === "MultiPoint") {
                esriType = "esriGeometryMultipoint";
                geomHolderId = "points";
            } else if (gcType === "LineString" || gcType === "MultiLineString") {
                esriType = "esriGeometryPolyline";
                geomHolderId = "paths";
            } else if (gcType === "Polygon" || gcType === "MultiPolygon") {
                esriType = "esriGeometryPolygon";
                geomHolderId = "rings";
            }
            return {
                type: esriType,
                    geomHolder: geomHolderId
            };
        }

        /*Convert GeoJSON polygon coordinates to ESRI polygon coordinates.
          GeoJSON rings are listed starting with a singular outer ring. ESRI
          rings can be listed in any order, but unlike GeoJSON, the ordering of
          vertices determines whether it's an outer or inner ring. Clockwise
          vertices indicate outer ring and counter-clockwise vertices indicate
          inner ring */
        function gcPolygonCoordinatesToEsriPolygonCoordinates(gcCoords) {
           var i,
               len,
               esriCoords = [],
               ring;
           for (i = 0, len = gcCoords.length; i < len; i++) {
               ring = gcCoords[i];
               // Exclusive OR.
               if ((i === 0) !== ringIsClockwise(ring)) {
                   ring = ring.reverse();
               }
               esriCoords.push(ring);
           }
           return esriCoords;
        }

        /*Wraps GeoJSON coordinates in an array if necessary so code can iterate
          through array of points, rings, or lines and add them to an ESRI geometry
          Input is a GeoJSON geometry object. A GeoJSON GeometryCollection is not a
          valid input */
        function gcCoordinatesToEsriCoordinates(gcGeom) {
            var i,
                len,
                esriCoords;
            if (gcGeom.type === "MultiPoint" || gcGeom.type === "MultiLineString") {
                esriCoords = gcGeom.coordinates || [];
            } else if (gcGeom.type === "Point" || gcGeom.type === "LineString") {
                esriCoords = gcGeom.coordinates ? [gcGeom.coordinates] : [];
            } else if (gcGeom.type === "Polygon") {
                esriCoords = [];
                if(gcGeom.coordinates){
                    esriCoords = gcPolygonCoordinatesToEsriPolygonCoordinates(gcGeom.coordinates);
                }
            } else if (gcGeom.type === "MultiPolygon") {
                esriCoords = [];
                if(gcGeom.coordinates){
                    for (i = 0, len = gcGeom.coordinates.length; i < len; i++) {
                        esriCoords.push(gcPolygonCoordinatesToEsriPolygonCoordinates(gcGeom.coordinates[i]));
                    }
                }
            }
            return esriCoords;
        }

        /*Converts GeoJSON geometry to ESRI geometry. The ESRI geometry is
          only allowed to contain one type of geometry, so if the GeoJSON
          geometry is a GeometryCollection, then only geometries compatible
          with the first geometry type in the collection are added to the ESRI geometry

          Input parameter is a GeoJSON geometry object.*/
        function gcGeometryToEsriGeometry(gcGeom) {
            var esriGeometry,
                esriGeomInfo,
                gcGeometriesToConvert,
                i,
                g,
                coords;

            //if geometry collection, get info about first geometry in collection
            if (gcGeom.type === "GeometryCollection") {
                var geomCompare = gcGeom.geometries[0];
                gcGeometriesToConvert = [];
                esriGeomInfo = gcGeomTypeToEsriGeomInfo(geomCompare.type);

                //loop through collection and only add compatible geometries to the array
                //of geometries that will be converted
                for (i = 0; i < gcGeom.geometries.length; i++) {
                    if (isCompatible(esriGeomInfo.type, gcGeom.geometries[i].type)) {
                        gcGeometriesToConvert.push(gcGeom.geometries[i]);
                    }
                }
            } else {
                esriGeomInfo = gcGeomTypeToEsriGeomInfo(gcGeom.type);
                gcGeometriesToConvert = [gcGeom];
            }

            //if a collection contained multiple points, change the ESRI geometry
            //type to MultiPoint
            if (esriGeomInfo.type === "esriGeometryPoint" && gcGeometriesToConvert.length > 1) {
                esriGeomInfo = gcGeomTypeToEsriGeomInfo("MultiPoint");
            }

            //make new empty ESRI geometry object
            esriGeometry = {
                //type: esriGeomInfo.type,
                spatialReference: {
                                      wkid: 4326
                                  }
            };

            //perform conversion
            if (esriGeomInfo.type === "esriGeometryPoint") {
                if (!gcGeometriesToConvert[0] || !gcGeometriesToConvert[0].coordinates || gcGeometriesToConvert[0].coordinates.length === 0) {
                    esriGeometry.x = null;
                } else {
                    esriGeometry.x = gcGeometriesToConvert[0].coordinates[0];
                    esriGeometry.y = gcGeometriesToConvert[0].coordinates[1];
                }
            } else {
                esriGeometry[esriGeomInfo.geomHolder] = [];
                for (i = 0; i < gcGeometriesToConvert.length; i++) {
                    coords = gcCoordinatesToEsriCoordinates(gcGeometriesToConvert[i]);
                    for (g = 0; g < coords.length; g++) {
                        esriGeometry[esriGeomInfo.geomHolder].push(coords[g]);
                    }
                }
            }
            return esriGeometry;
        }

        /*Converts GeoJSON feature to ESRI REST Feature.
          Input parameter is a GeoJSON Feature object*/
        function gcFeatureToEsriFeature(gcFeature) {
            var esriFeat,
                prop,
                esriAttribs;
            if (gcFeature) {
                esriFeat = {};
                if (gcFeature.geometry) {
                    esriFeat.geometry = gcGeometryToEsriGeometry(gcFeature.geometry);
                }
                if (gcFeature.properties) {
                    esriAttribs = {};
                    for (prop in gcFeature.properties) {
                        esriAttribs[prop] = gcFeature.properties[prop];
                    }
                    esriFeat.attributes = esriAttribs;
                }
            }
            return esriFeat;
        }

        /*Converts GeoJSON FeatureCollection, Feature, or Geometry
          to ESRI Rest Featureset, Feature, or Geometry*/
        gCon.toEsri = function(geoJsonObject) {
            var outObj,
                i,
                gcFeats,
                esriFeat;
            if (geoJsonObject){
                if (geoJsonObject.type === "FeatureCollection"){
                    outObj = {
                        features: []
                    };
                    gcFeats = geoJsonObject.features;
                    for (i = 0; i < gcFeats.length; i++) {
                        esriFeat = gcFeatureToEsriFeature(gcFeats[i]);
                        if (esriFeat) {
                            outObj.features.push(esriFeat);
                        }
                    }
                }
                else if (geoJsonObject.type === "Feature"){
                    outObj = gcFeatureToEsriFeature(geoJsonObject);
                }
                else{
                    outObj = gcGeometryToEsriGeometry(geoJsonObject);
                }
            }
            return outObj;
        };

        return gCon;
    }

    if (typeof define === 'function') {
        var module = {
            esriConverter: esriConverter,
            geoJsonConverter: geoJsonConverter
        };

        define([], function() {

            return module;

        });
    } else {
        root.esriConverter = esriConverter;
        root.geoJsonConverter = geoJsonConverter;
    }

}).call(this);
/* jshint ignore:end */
;MapExpress.Service.BaseDataProvider = L.Class.extend({

	statics: {},

	options: {
		tileSize: 256,
		subdomains: 'abc',
		useQuadkey: false,
		maxZoom: 23,
		uppercase: false,
		crs: L.CRS.EPSG3857,
		identifyFormat: 'text/html',
		identifyLayersId: ''
	},

	initialize: function(options) {
		if (typeof this.options.subdomains === 'string') {
			this.options.subdomains = this.options.subdomains.split('');
		}
	},

	getDataAsync: function() {

	},

	getDataUrl: function() {

	},


	getDataInBoundsAsync: function(mapBounds, mapSize) {
		var url = this.getDataUrlByBounds(mapBounds, mapSize);
		var promise = new MapExpress.Utils.Promise.QImage(url);
		return promise;
	},

	getDataUrlByBounds: function(mapBounds, mapSize) {

	},


	getDataByTileAsync: function(tileCoord) {

	},

	getDataUrlByTile: function(tileCoord) {
		if (!this._dataUrl) {
			return;
		}

		if (this.options.useQuadkey) {
			return L.Util.template(this._dataUrl, L.extend({
				r: this.options.tileCoord && L.Browser.retina && this.options.maxZoom > 0 ? '@2x' : '',
				s: this._getSubdomain(tileCoord),
				q: this._tileCoordsToQuadkey(tileCoord)
			}, this.options));
		} else {
			return L.Util.template(this._dataUrl, L.extend({
				r: this.options.tileCoord && L.Browser.retina && this.options.maxZoom > 0 ? '@2x' : '',
				s: this._getSubdomain(tileCoord),
				x: tileCoord.x,
				y: tileCoord.y,
				z: tileCoord.z
			}, this.options));
		}
	},


	getFeatureInfoAsync: function(latlng, layerPoint, mapBounds, mapSize, zoom) {
		var url = this.getFeatureInfoUrl(latlng, layerPoint, mapBounds, mapSize, zoom);
		if (url) {
			var isJson = this.options.identifyFormat === 'json' || this.options.identifyFormat === 'pjson' ? true : false; 
			return  MapExpress.Utils.Promise.qAjax(url, !isJson);
		}
	},

	getFeatureInfoUrl: function(latlng, layerPoint, mapBounds, mapSize, zoom) {

	},

	_tileCoordToBounds: function(tileCoord) {
		var tileSize = this.options.tileSize;
		var crs = L.CRS.EPSG3857;

		var nwPoint = new L.Point(tileCoord.x * tileSize, tileCoord.y * tileSize);
		var sePoint = new L.Point(nwPoint.x + tileSize, nwPoint.y + tileSize);

		var nwUnprojected = crs.pointToLatLng(nwPoint, tileCoord.z);
		var seUnprojected = crs.pointToLatLng(sePoint, tileCoord.z);

		var nw = crs.wrapLatLng(nwUnprojected);
		var se = crs.wrapLatLng(seUnprojected);

		return new L.LatLngBounds(nw, se);
	},

	_getTileCoordRangeByMapBounds: function(mapBounds, zoom) {
		var range = [];
		if (mapBounds === undefined) {
			return range;
		}
		var nw = mapBounds.getNorthWest();
		var se = mapBounds.getSouthEast();
		var minTileCoord = this._getTileCoordByLatLng(nw, zoom);
		var maxTileCoord = this._getTileCoordByLatLng(se, zoom);

		for (var j = minTileCoord.y; j <= maxTileCoord.y; j++) {
			for (var i = minTileCoord.x; i <= maxTileCoord.x; i++) {
				var coords = new L.Point(i, j);
				coords.z = zoom;
				range.push(coords);
			}
		}

		return range;
	},

	_getAddedTileCoordRangeByMapBounds: function(prevMapBounds, prevZoom, newMapBounds, newZoom) {
		return this._getAddedAndRemovedTileCoordRangeByMapBounds(prevMapBounds, prevZoom, newMapBounds, newZoom).Added;
	},

	_getRemovedTileCoordRangeByMapBounds: function(prevMapBounds, prevZoom, newMapBounds, newZoom) {
		return this._getAddedAndRemovedTileCoordRangeByMapBounds(prevMapBounds, prevZoom, newMapBounds, newZoom).Removed;
	},

	_getAddedAndRemovedTileCoordRangeByMapBounds: function(prevMapBounds, prevZoom, newMapBounds, newZoom) {
		var ranges = {};
		var tileExists = function(array, tileCoord) {
			for (var i = 0; i < array.length; i++) {
				if (array[i].x === tileCoord.x && array[i].y === tileCoord.y && array[i].z === tileCoord.z) {
					return true;
				}
			}
			return false;
		};

		var newRange = this._getTileCoordRangeByMapBounds(newMapBounds, newZoom);
		var prevRange = this._getTileCoordRangeByMapBounds(prevMapBounds, prevZoom);

		if (prevZoom !== newZoom) {
			ranges.Added = newRange;
			ranges.Removed = prevRange;
			return ranges;
		}

		var added = newRange.filter(function(iterTile) {
			return !tileExists(prevRange, iterTile);
		});

		var removed = prevRange.filter(function(iterTile) {
			return !tileExists(newRange, iterTile);
		});

		ranges.Added = added;
		ranges.Removed = removed;

		return ranges;
	},


	_getTileCoordByLatLng: function(latlng, zoom) {
		var tileSize = this.options.tileSize;
		var crs = L.CRS.EPSG3857;
		var pixelPoint = crs.latLngToPoint(latlng, zoom);
		return this._pixelPointToTileCoord(pixelPoint, zoom);
	},

	_pixelPointToTileCoord: function(pixelPoint, zoom) {
		var tileSize = this.options.tileSize;
		var x = Math.ceil(pixelPoint.x / tileSize) - 1;
		var y = Math.ceil(pixelPoint.y / tileSize) - 1;
		var tileCoord = new L.Point(x, y);
		tileCoord.z = zoom;
		return tileCoord;
	},

	_tileCoordsToQuadkey: function(tileCoord) {
		var result = '';
		for (var i = tileCoord.z; i > 0; i--) {
			var digit = 0;
			var mask = 1 << (i - 1);
			if ((tileCoord.x & mask) !== 0) {
				digit++;
			}
			if ((tileCoord.y & mask) !== 0) {
				digit++;
				digit++;
			}
			result += digit;
		}
		return result;
	},

	_tileCoordsToKey: function(tileCoord) {
		return tileCoord.x + ':' + tileCoord.y + ':' + tileCoord.z;
	},

	_getSubdomain: function(tileCoord) {
		var index = Math.abs(tileCoord.x + tileCoord.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	_boundsEquals: function(bounds1, bounds2, maxMargin) {
		var ne2 = bounds2.getNorthEast();
		var ne1 = bounds1.getNorthEast();
		var sw1 = bounds1.getSouthWest();
		var sw2 = bounds2.getSouthWest();

		var margin1 = Math.max(Math.abs(ne1.lat - ne2.lat), Math.abs(ne1.lng - ne2.lng));
		var margin2 = Math.max(Math.abs(sw1.lat - sw2.lat), Math.abs(sw1.lng - sw2.lng));
		var eq1 = margin1 <= (maxMargin === undefined ? 1.0E-1000 : maxMargin);
		var eq2 = margin2 <= (maxMargin === undefined ? 1.0E-1000 : maxMargin);
		return eq1 && eq2;
	}

});

MapExpress.Service.baseDataProvider = function(options) {
	return new MapExpress.Service.BaseDataProvider(options);
};;MapExpress.Service.EsriBaseProvider = MapExpress.Service.BaseDataProvider.extend({


	options: {
		tileSize: 256,
		crs: L.CRS.EPSG3857,
		identifyUrl: '',
		identifyFormat: 'json',
		identifyTolerance: 1
	},

	initialize: function(url, options) {
		MapExpress.Service.BaseDataProvider.prototype.initialize.call(this, options);
		this._dataUrl = url;
		L.setOptions(this, options);
	},

	getDataByTileAsync: function(tileCoord) {
		var bounds = this._tileCoordToBounds(tileCoord);
		var mapSize = new L.Point(this.options.tileSize, this.options.tileSize);
		return this.getDataInBoundsAsync(bounds, mapSize);
	},


	getDataUrlByTile: function(tileCoord) {
		var bounds = this._tileCoordToBounds(tileCoord);
		var mapSize = new L.Point(this.options.tileSize, this.options.tileSize);
		return this.getDataUrlByBounds(bounds, mapSize);
	},


	getFeatureInfoUrl: function(latlng, layerPoint, mapBounds, mapSize, zoom) {
		var identLyr = this.options.identifyLayersId ? 'visible:' + this.options.identifyLayersId : 'top';
		var params = {
			geometryType: 'esriGeometryPoint',
			sr: '4326',
			layers: identLyr,
			tolerance: this.options.identifyTolerance,
			imageDisplay: [mapSize.x, mapSize.y, '96'].join(','),
			returnGeometry: false,
			f: this.options.identifyFormat,
			geometry: [latlng.lng, latlng.lat].join(','),
			mapExtent: [mapBounds._northEast.lng, mapBounds._northEast.lat, mapBounds._southWest.lng, mapBounds._southWest.lat].join(',')
		};
		var uppercase = this.options.uppercase || false;
		var identifyUrl = this.options.identifyUrl ? this.options.identifyUrl : this._dataUrl;
		return identifyUrl + '/identify' + L.Util.getParamString(params, identifyUrl, uppercase);
	}


});

MapExpress.Service.esriBaseProvider = function(url, options) {
	return new MapExpress.Service.EsriBaseProvider(url, options);
};;MapExpress.Service.FeatureServiceAgsProvider = MapExpress.Service.EsriBaseProvider.extend({

	defaultFeatureServiceParams: {
		where: '',
		text: '',
		objectIds: '',
		time: '',
		geometryType: 'esriGeometryEnvelope',
		inSR: '',
		spatialRel: 'esriSpatialRelIntersects',
		relationParam: '',
		outFields: "*",
		returnGeometry: true,
		maxAllowableOffset: '',
		geometryPrecision: '',
		returnIdsOnly: false,
		orderByFields: '',
		groupByFieldsForStatistics: '',
		outStatistics: '',
		returnZ: false,
		returnM: false,
		gdbVersion: '',
		returnDistinctValues: false,
		f: 'json'
	},

	options: {
		layerId: ''
	},

	initialize: function(url, options) {
		MapExpress.Service.EsriBaseProvider.prototype.initialize.call(this, options);
		this._dataUrl = url;
		this.esriConverter = esriConverter();
		var defaultFeatureServiceParams = L.extend({}, this.defaultFeatureServiceParams);
		for (var i in options) {
			if (!(i in this.options)) {
				defaultFeatureServiceParams[i] = options[i];
			}
		}
		L.setOptions(this, options);
		this.defaultFeatureServiceParams = defaultFeatureServiceParams;
	},

	getDataInBoundsAsync: function(mapBounds, mapSize) {
		// Вынести в базовый и сделать хук
		var that = this;
		var url = this.getDataUrlByBounds(mapBounds, mapSize);
		return MapExpress.Utils.Promise.qAjax(url).then(
			function(esriObjects) {
				if (esriObjects) {
					return that.esriConverter.toGeoJson(esriObjects);
				}
			}
		);
	},

	getDataUrlByBounds: function(mapBounds, mapSize) {
		// Учесть {s} - subdomains
		var crs = this.options.crs;
		var nw = crs.project(mapBounds.getNorthWest());
		var se = crs.project(mapBounds.getSouthEast());
		var params = {};
		params.inSR = crs.code;
		params.outSR = '4326';
		params.geometry = L.Util.template(
			'{xmin: {0}, ymin: {1}, xmax: {2}, ymax: {3}}', {
				0: nw.x,
				1: se.y,
				2: se.x,
				3: nw.y
			});
		L.extend(this.defaultFeatureServiceParams, params);

		var uppercase = this.options.uppercase || false;
		var pstr = L.Util.getParamString(this.defaultFeatureServiceParams, this._dataUrl, uppercase);

		return this._dataUrl + '/' + this.options.layerId + '/query' + pstr;
	}

});

MapExpress.Service.featureServiceAgsProvider = function(url, options) {
	return new MapExpress.Service.FeatureServiceAgsProvider(url, options);
};;MapExpress.Service.GeoJSONProvider = MapExpress.Service.BaseDataProvider.extend({

	options: {
		useTileIndex: false,
		identifyFormat:'json'
	},

	initialize: function(dataUrl, options) {
		MapExpress.Service.BaseDataProvider.prototype.initialize.call(this, options);
		L.setOptions(this, options);
		this._dataUrl = dataUrl;
		if (this._dataUrl) {
			this._loadDataAsync();
		}
	},


	getDataAsync: function() {
		return MapExpress.Utils.Promise.qAjax(this._dataUrl);
	},

	getDataInBoundsAsync: function(mapBounds, mapSize) {
		var url = this.getDataUrlByBounds(mapBounds, mapSize);
		return MapExpress.Utils.Promise.qAjax(url);
	},

	getDataByTileAsync: function(tileCoord) {
		if (this.options.useTileIndex) {
			return this._getVectorTileIndexPromise(tileCoord);
		} else {
			var url = this.getDataUrlByTile(tileCoord);
			return MapExpress.Utils.Promise.qAjax(url);
		}
	},

	getFeatureInfoAsync: function(latlng, layerPoint, mapBounds, mapSize, zoom) {

	},

	_loadDataAsync: function() {
		var that = this;
		this.getDataAsync().then(
			function(data) {
				that.geoJson = data;
				if (that.options.useTileIndex) {
					that.tileIndex = geojsonvt(data);
				}
			}
		);
	},

	_getVectorTileIndexPromise: function(tileCoord) {
		var d = Q.defer();
		try {
			var tileData = this.tileIndex.getTile(tileCoord.z, tileCoord.x, tileCoord.y);
			d.resolve(tileData);
		} catch (e) {
			e.tileCoord = tileCoord;
			d.reject(e);
		}
		return d.promise;

		//	Q.async(function* (oneP, twoP) {
    	//var one = yield oneP;
    	//var two = yield twoP;
    	//return one + two;
		//});
	}


});

MapExpress.Service.geoJSONProvider = function(dataUrl, options) {
	return new MapExpress.Service.GeoJSONProvider(dataUrl, options);
};;MapExpress.Service.MapServiceAgsProvider = MapExpress.Service.EsriBaseProvider.extend({

	defaultParams: {
		size: '256,256',
		bboxSR: 3857,
		imageSR: 3857,
		dpi: 96,
		f: 'image',
		format: 'png32',
		transparent: true,
		layersId: ''
	},

	initialize: function(url, options) {
		MapExpress.Service.EsriBaseProvider.prototype.initialize.call(this, options);
		this._dataUrl = url;
		var mapServiceParams = L.extend({}, this.defaultParams);
		for (var i in options) {
			if (!(i in this.options)) {
				mapServiceParams[i] = options[i];
			}
		}
		L.setOptions(this, options);
		this.mapServiceParams = mapServiceParams;
	},

	getDataUrlByBounds: function(mapBounds, mapSize) {
		// Учесть {s} - subdomains
		var crs = this.options.crs;
		var nw = crs.project(mapBounds.getNorthWest());
		var se = crs.project(mapBounds.getSouthEast());
		var params = {};
		params.bbox = [nw.x, se.y, se.x, nw.y].join(',');
		params.layers = 'visible:' + this.options.layersId;
		L.extend(this.mapServiceParams, params);
		var uppercase = this.options.uppercase || false;
		var pstr = L.Util.getParamString(this.mapServiceParams, this._url, uppercase);
		return this._dataUrl + '/export' + pstr;
	}

});

MapExpress.Service.mapServiceAgsProvider = function(url, options) {
	return new MapExpress.Service.MapServiceAgsProvider(url, options);
};;MapExpress.Service.TileProvider = MapExpress.Service.BaseDataProvider.extend({
	
	initialize: function(url, options) {
		MapExpress.Service.BaseDataProvider.prototype.initialize.call(this, options);
		L.setOptions(this, options);
		this._dataUrl = url;
	},


	getDataByTileAsync: function(tileCoord) {
		var url = this.getDataUrlByTile(tileCoord);
		var promise = new MapExpress.Utils.Promise.QImage(url);
		return promise;
	},

	getFeatureInfoAsync: function(latlng, mapPanePoint, mapBounds, mapSize, zoom) {

	}

});

MapExpress.Service.tileProvider = function(url, options) {
	return new MapExpress.Service.TileProvider(url, options);
};;MapExpress.Service.WmsProvider = MapExpress.Service.BaseDataProvider.extend({
	defaultWmsParams: {
		service: 'WMS',
		request: 'GetMap',
		version: '1.1.1',
		layers: '',
		styles: '',
		format: 'image/png',
		transparent: false,
		dpi: 96
	},

	options: {
	},

	initialize: function(url, options) {
		MapExpress.Service.BaseDataProvider.prototype.initialize.call(this, options);
		this._dataUrl = url;
		var wmsParams = L.extend({}, this.defaultWmsParams);
		for (var i in options) {
			if (!(i in this.options)) {
				wmsParams[i] = options[i];
			}
		}
		options = L.setOptions(this, options);
		wmsParams.width = wmsParams.height = options.tileSize * (options.detectRetina && L.Browser.retina ? 2 : 1);
		this.wmsParams = wmsParams;
	},

	getDataInBoundsAsync: function(mapBounds, mapSize) {
		var url = this.getDataUrlByBounds(mapBounds, mapSize);
		var promise = new MapExpress.Utils.Promise.QImage(url);
		return promise;
	},

	getDataByTileAsync: function(tileCoord) {
		var bounds = this._tileCoordToBounds(tileCoord);
		var mapSize = new L.Point(this.options.tileSize, this.options.tileSize);
		return this.getDataInBoundsAsync(bounds, mapSize);
	},

	getDataUrlByBounds: function(mapBounds, mapSize) {
		// Не понятно с СК. А если будет 4326?
		var wmsVersion = parseFloat(this.wmsParams.version);
		var crs = this.options.crs;
		var projectionKey = wmsVersion >= 1.3 ? 'crs' : 'srs';
		var nw = crs.project(mapBounds.getNorthWest());
		var se = crs.project(mapBounds.getSouthEast());
		var params = {
			width: mapSize.x,
			height: mapSize.y
		};
		params[projectionKey] = crs.code;
		params.bbox = (
			wmsVersion >= 1.3 && crs === L.CRS.EPSG4326 ?
			[se.y, nw.x, nw.y, se.x] : [nw.x, se.y, se.x, nw.y]
		).join(',');

		L.extend(this.wmsParams, params);

		var uppercase = this.options.uppercase || false;
		var pstr = L.Util.getParamString(this.wmsParams, this._dataUrl, uppercase);
		return this._dataUrl + pstr;
	},

	getDataUrlByTile: function(tileCoord) {
		var bounds = this._tileCoordToBounds(tileCoord);
		var mapSize = new L.Point(this.options.tileSize, this.options.tileSize);
		return this.getDataUrlByBounds(bounds, mapSize);
	},

	getFeatureInfoUrl: function(latlng, layerPoint, mapBounds, mapSize, zoom) {
		var wmsVersion = parseFloat(this.wmsParams.version);
		var qLayers = this.options.identifyLayersId ? this.options.identifyLayersId : this.wmsParams.layers;
		var params = {
			request: 'GetFeatureInfo',
			service: 'WMS',
			styles: this.wmsParams.styles,
			transparent: this.wmsParams.transparent,
			version: this.wmsParams.version,
			format: this.wmsParams.format,
			bbox: mapBounds.toBBoxString(),
			height: mapSize.y,
			width: mapSize.x,
			layers: qLayers,
			query_layers: qLayers,
			info_format: this.options.identifyFormat
		};
		var projectionKey = wmsVersion >= 1.3 ? 'crs' : 'srs';
		params[projectionKey] = 'EPSG:4326';

		params[wmsVersion >= 1.3 ? 'i' : 'x'] = layerPoint.x;
		params[wmsVersion >= 1.3 ? 'j' : 'y'] = layerPoint.y;

		var uppercase = this.options.uppercase || false;
		return this._dataUrl + L.Util.getParamString(params, this._url, uppercase);
	}

});

MapExpress.Service.wmsProvider = function(url, options) {
	return new MapExpress.Service.WmsProvider(url, options);
};;MapExpress.Tools.BaseMapCommand = L.Class.extend({
	options: {

	},

	initialize: function(mapManager, options) {
		this._mapManager = mapManager;
		L.setOptions(this, options);
	},

	createContent: function() {

	},

	activate: function() {

	},

	deactivate: function() {

	},

	doCommand: function(args) {

	}

});

MapExpress.Service.baseMapCommand = function(mapManager, options) {
	return new MapExpress.Tools.BaseMapCommand(mapManager, options);
};;MapExpress.Tools.IdentifyMapCommand = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
			//buttonClassName: 'btn btn-primary btn-sm btn-fab-mini btn-fab btn-raised icon icon-material-favorite'
			//data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Информация"'
			//buttonClassName: '<a href="#" class="btn btn-primary"><span class="glyphicon glyphicon-info-sign"></span>Информация</a>'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
		this._active = false;
	},

	createContent: function(toolBarContainer) {
		//var a = L.DomUtil.create('a', 'btn btn-primary', toolBarContainer);
		//var span = L.DomUtil.create('span', 'glyphicon glyphicon-info-sign', a);
		//return a;
		//

		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-info fa-lg fa-fw', button);

		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Информация');

		return button;
	},

	activate: function() {
		if (!this._active) {
			this._mapManager._map.on('click', this.doCommand, this);
		}
		this._active = true;
	},

	deactivate: function() {
		this._mapManager._map.off('click', this.doCommand, this);
		this._active = false;
	},

	doCommand: function(args) {
		var that = this;
		var identifyedLayers = [];
		var identifyedResults = [];

		var layers = this._getQueryableLayers();
		var map = this._mapManager._map;

		var latlng = args.latlng;
		var layerPoint = args.layerPoint;
		var mapZoom = map.getZoom();
		var mapBounds = map.getBounds();
		var mapSize = map.getSize();

		identifyedResults.latlng = latlng;

		var identifyPromises = [];
		for (var i = 0; i < layers.length; i++) {
			var iterLayer = layers[i];
			var dataProvider = iterLayer._dataPovider;
			if (dataProvider) {
				var func = dataProvider.getFeatureInfoAsync(latlng, layerPoint, mapBounds, mapSize, mapZoom);

				if (!func && iterLayer instanceof MapExpress.Layers.GeoJSONServiceLayer) {
					func = iterLayer._getFeaturesAtPoint(latlng, layerPoint, mapBounds, mapSize, mapZoom);
				}

				if (func) {
					identifyPromises.push(func);
					identifyedLayers.push(iterLayer);
				}
			}
		}

		Q.allSettled(identifyPromises)
			.then(function(results) {
				for (var i = 0; i < results.length; i++) {
					var result = results[i];
					if (result.state === "fulfilled") {
						var identRes = {};
						identRes.layer = identifyedLayers[i];
						identRes.data = result.value;
						identifyedResults.push(identRes);
					}
				}
				that._showInfo(identifyedResults);
			});
	},

	_getQueryableLayers: function() {
		var layers = this._mapManager.getLayers();
		return layers;
	},

	_showInfo: function(identifyedResults) {
		var content = '';
		identifyedResults.forEach(function(item) {
			if (item.data) {
				var formatter = resultFormatter();
				var data;
				var cont = true;
				var isJson = item.layer._dataPovider && item.layer._dataPovider.options.identifyFormat.indexOf("json") > -1;

				if (item.data.error) {
					cont = false;
				}

				// Это с арки
				if (cont && item.data.results && item.data.results.length > 0) {
					data = formatter.formatGeoJSON(item.data.results[0]);
					cont = false;
				}
				if (item.data.results && item.data.results.length === 0) {
					cont = false;
				}

				if (cont && L.Util.isArray(item.data) && item.data.length > 0) {
					data = formatter.formatGeoJSON(item.data[0]);
					cont = false;
				}

				if (L.Util.isArray(item.data) && item.data.length === 0) {
					cont = false;
				}

				if (cont) {
					data = item.data;
				}

				if (data) {
					content += '<h4>' + item.layer.displayName + '</h4>' + data;
				}
			}
		});
		if (content) {
			L.popup({
					maxWidth: 600,
					maxHeight: 600
				})
				.setLatLng(identifyedResults.latlng)
				.setContent(content)
				.openOn(this._mapManager._map);

		}
	}

	//function adjustPopup(html) {
	//	$('#a').html(html);
	//	var $leaflet = $('#a').closest('div.leaflet-popup');
	//	var width = $leaflet.width();
	//	$leaflet.css({
	//		left: "-" + (width / 2) + "px"
	//	});
	//}


});

MapExpress.Service.identifyMapCommand = function(mapManager, options) {
	return new MapExpress.Tools.IdentifyMapCommand(mapManager, options);
};;MapExpress.Tools.MapToolbar = L.Control.extend({
	options: {
		position: 'topleft',
		containerClassName: 'panel panel-default'
	},

	initialize: function(mapManager, options) {
		this._mapManager = mapManager;
		L.setOptions(this, options);
		this._commands = [];
	},

	onAdd: function() {
		return this._createContainer();
	},

	addTo: function() {
		L.Control.prototype.addTo.call(this, this._mapManager._map);
	},

	addCommand: function(mapCommand) {
		this._commands.push(mapCommand);
		return this;
	},

	_createContainer: function() {
		this._container = L.DomUtil.create('div', this.options.containerClassName);
		this._container.style.padding = '3px';
		var panelBody = L.DomUtil.create('div', 'panel-body', this._container);
		panelBody.style.padding = '3px';

		for (var i = 0; i < this._commands.length; i++) {
			this._createCommandContent(this._commands[i], panelBody);
		}

		return this._container;
	},

	_createCommandContent: function(mapCommand, panelBody) {
		var that = this;
		var commandContent = mapCommand.createContent(panelBody);
		commandContent.command = mapCommand;
		//L.DomEvent
		//    .on(commandContent, 'mousedown dblclick', L.DomEvent.stopPropagation)
		//    .on(commandContent, 'click', L.DomEvent.stop)
		//    .on(commandContent, 'click', fn, this)
		//   .on(commandContent, 'click', this._refocusOnMap, this);

		L.DomEvent
			.addListener(commandContent, 'click', L.DomEvent.stopPropagation)
			.addListener(commandContent, 'click', L.DomEvent.preventDefault)
			.addListener(commandContent, 'click', function() {
				if (that._activeCommand){
					that._activeCommand.deactivate();
				}
				that._activeCommand = commandContent.command;
				commandContent.command.activate();
			});
		return commandContent;
	}

});

MapExpress.Service.mapToolbar = function(mapManager, options) {
	return new MapExpress.Tools.MapToolbar(mapManager, options);
};;MapExpress.Tools.ShowLayerControlMapCommand = MapExpress.Tools.BaseMapCommand.extend({

	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
		this._active = false;
	},

	createContent: function(toolBarContainer) {
		//var a = L.DomUtil.create('a', 'btn btn-primary', toolBarContainer);
		//var span = L.DomUtil.create('span', 'glyphicon glyphicon-info-sign', a);
		//return a;
		//

		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-bars fa-lg fa-fw', button);

		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Слои');

		return button;
	},
});

MapExpress.Service.showLayerControlMapCommand = function(mapManager, options) {
	return new MapExpress.Tools.ShowLayerControlMapCommand(mapManager, options);
};;/* jshint ignore:start */
(function() {

	"use strict";

	var root;
	root = typeof exports !== "undefined" && exports !== null ? exports : this;

	function resultFormatter() {
		var formater = {};

		formater.formatGeoJSON = function(data) {
			if (data.attributes) {
				return formatAsTable(data.attributes);
			}

			if (data.properties) {
				return formatAsTable(data.properties)
			}
		};

		function formatAsTable(props) {
			var result = '<table class="table"> <tbody>';

			for (var i in props) {
				result = result + '<tr>';
				result = result + '<td>' + i + '</td>';
				result = result + '<td>' + props[i] + '</td>';
				result = result + '</tr>';
			}
			return result + '</tbody></table>';
		};

		return formater;
	}

	if (typeof define === 'function') {
		var module = {
			resultFormatter: resultFormatter,
		};

		define([], function() {

			return module;

		});
	} else {
		root.resultFormatter = resultFormatter;
	}

}).call(this);
/* jshint ignore:end */;/* jshint ignore:start */
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    "use strict";

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
        // Prefer window over self for add-on scripts. Use self for
        // non-windowed contexts.
        var global = typeof window !== "undefined" ? window : self;

        // Get the `window` object, save the previous Q global
        // and initialize Q as a global.
        var previousQ = global.Q;
        global.Q = definition();

        // Add a noConflict function so Q can be removed from the
        // global namespace.
        global.Q.noConflict = function () {
            global.Q = previousQ;
            return this;
        };

    } else {
        throw new Error("This environment was not anticipated by Q. Please file a bug.");
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;
    // queue for late tasks, used by unhandled rejection tracking
    var laterQueue = [];

    function flush() {
        /* jshint loopfunc: true */
        var task, domain;

        while (head.next) {
            head = head.next;
            task = head.task;
            head.task = void 0;
            domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }
            runSingle(task, domain);

        }
        while (laterQueue.length) {
            task = laterQueue.pop();
            runSingle(task);
        }
        flushing = false;
    }
    // runs a single function in the async queue
    function runSingle(task, domain) {
        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process === "object" &&
        process.toString() === "[object process]" && process.nextTick) {
        // Ensure Q is in a real Node environment, with a `process.nextTick`.
        // To see through fake Node environments:
        // * Mocha test runner - exposes a `process` global without a `nextTick`
        // * Browserify - exposes a `process.nexTick` function that uses
        //   `setTimeout`. In this case `setImmediate` is preferred because
        //    it is faster. Browserify's `process.toString()` yields
        //   "[object Object]", while in a real Node environment
        //   `process.nextTick()` yields "[object process]".
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }
    // runs a task after all other tasks have been run
    // this is useful for unhandled rejection tracking that needs to happen
    // after all `then`d tasks have been run.
    nextTick.runAfter = function (task) {
        laterQueue.push(task);
        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };
    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (value instanceof Promise) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

// enable long stacks if Q_DEBUG is set
if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
    Q.longStackSupport = true;
}

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            Q.nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Q can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
Q.race = race;
function race(answerPs) {
    return promise(function (resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function (answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    Q.nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

Q.tap = function (promise, callback) {
    return Q(promise).tap(callback);
};

/**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
Promise.prototype.tap = function (callback) {
    callback = Q(callback);

    return this.then(function (value) {
        return callback.fcall(value).thenResolve(value);
    });
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return object instanceof Promise;
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var reportedUnhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }
    if (typeof process === "object" && typeof process.emit === "function") {
        Q.nextTick.runAfter(function () {
            if (array_indexOf(unhandledRejections, promise) !== -1) {
                process.emit("unhandledRejection", reason, promise);
                reportedUnhandledRejections.push(promise);
            }
        });
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        if (typeof process === "object" && typeof process.emit === "function") {
            Q.nextTick.runAfter(function () {
                var atReport = array_indexOf(reportedUnhandledRejections, promise);
                if (atReport !== -1) {
                    process.emit("rejectionHandled", unhandledReasons[at], promise);
                    reportedUnhandledRejections.splice(atReport, 1);
                }
            });
        }
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    Q.nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return Q(result.value);
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return Q(exception.value);
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    Q.nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var pendingCount = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++pendingCount;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--pendingCount === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (pendingCount === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
Q.any = any;

function any(promises) {
    if (promises.length === 0) {
        return Q.resolve();
    }

    var deferred = Q.defer();
    var pendingCount = 0;
    array_reduce(promises, function (prev, current, index) {
        var promise = promises[index];

        pendingCount++;

        when(promise, onFulfilled, onRejected, onProgress);
        function onFulfilled(result) {
            deferred.resolve(result);
        }
        function onRejected() {
            pendingCount--;
            if (pendingCount === 0) {
                deferred.reject(new Error(
                    "Q can't get fulfillment value from any promise, all " +
                    "promises were rejected."
                ));
            }
        }
        function onProgress(progress) {
            deferred.notify({
                index: index,
                value: progress
            });
        }
    }, undefined);

    return deferred.promise;
}

Promise.prototype.any = function () {
    return any(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    if (!callback || typeof callback.apply !== "function") {
        throw new Error("Q can't apply finally callback");
    }
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, error) {
    return Q(object).timeout(ms, error);
};

Promise.prototype.timeout = function (ms, error) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        if (!error || "string" === typeof error) {
            error = new Error(error || "Timed out after " + ms + " ms");
            error.code = "ETIMEDOUT";
        }
        deferred.reject(error);
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    if (callback === undefined) {
        throw new Error("Q can't wrap an undefined function");
    }
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            Q.nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            Q.nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

Q.noConflict = function() {
    throw new Error("Q.noConflict only works when Q is used as a global");
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});
/* jshint ignore:end */;(function(Q) {
	"use strict";
	MapExpress.Utils.Promise.qAjax = function(url, isGet) {
		var deferred = Q.defer();
		if (!isGet) {
			$.getJSON(url).done(function(data) {
					deferred.resolve(data);
				})
				.fail(function(xhr, textStatus, errorThrown) {
					var error = new Error("Ajax request failed" + url);
					error.textStatus = textStatus;
					error.errorThrown = errorThrown;
					deferred.reject(error);
				});
		} else {
			$.get(url).done(function(data) {
					deferred.resolve(data);
				})
				.fail(function(xhr, textStatus, errorThrown) {
					var error = new Error("Ajax request failed" + url);
					error.textStatus = textStatus;
					error.errorThrown = errorThrown;
					deferred.reject(error);
				});
		}
		return deferred.promise;
	};
}(Q));;(function(Q) 
{
"use strict";
  MapExpress.Utils.Promise.qImage = function(url, options) {
    options = options || {};
    var img = new Image();
    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin;
      img.alt = '';
    }
    var d = Q.defer();
    img.onload = function() {
      d.resolve(img);
    };
    img.onabort = function(e) {
      d.reject(img);
    };
    img.onerror = function(e) {
      d.reject(img);
    };
    img.src = url;
    return d.promise;
  };
}(Q));