/* jshint ignore:start */
function InitializeMap(mapDiv) {
	//MapExpress.Mapping.MapInitializerHelper.initializeFromURL(mapDiv, "map_model.json", onWorkspaceLoaded);

	var map = L.map(mapDiv, {
		zoomControl: false,
		editable: true,
		attributionControl: false
	});

	if (map.touchZoom) {
		map.touchZoom.enable();
	}

	window.MapManager = new MapExpress.Mapping.MapManager(map);

	//if (window.VSM_IS_LOCAL_MAP) {
	//	MapExpress.Mapping.MapInitializerHelper.initializeFromFile(mapDiv, "map_model.json", onWorkspaceLoaded);
	//} else {
		new VsmMapWorkspaceManager(onWorkspaceLoaded).loadWorkspace();
	//}
}
/* jshint ignore:end */

function onWorkspaceLoaded() {

	var mapManager = window.MapManager;
	var map = window.MapManager._map;

	map.addControl(createSearchToolbar());
	map.addControl(createStandartToolbar());
	map.addControl(createMapStatusBar());


	L.control.zoom({
		position: 'topleft'
	}).addTo(map);

	if (map.touchZoom) {
		map.touchZoom.enable();
	}

	replaceRosreestrIdentifyFunc();
	addFavoriteLayers();
	window.vsmShowLegend();

	addUserLayers();
	addRasters();

	setTimeout(_selectParcels, 1100);

}


function createSearchToolbar() {
	var mapManager = window.MapManager;
	var toolbar = new MapExpress.Tools.MapToolbar(mapManager, {
		position: 'topleft'
	});
	toolbar.addCommand(new MapExpress.Tools.ShowLayerControlMapCommandExt(mapManager));
	toolbar.addControlFromTemplate("templates/vsmsearch.html", "searchId");
	return toolbar;
}

function createStandartToolbar() {
	var mapManager = window.MapManager;
	var toolbar = new MapExpress.Tools.MapToolbar(mapManager, {
		position: 'topright'
	});


	toolbar.addCommand(new MapExpress.Tools.IdentifyMapCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.LineMeasureCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.SqrtMeasureCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.ActiveViewMapExportCommand(mapManager));

	toolbar.addCommand(new MapExpress.Tools.MapExportCommand(mapManager));

	toolbar.addCommand(new MapExpress.Tools.ShowFavoriteLayersCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.SelectorBaseMapsCommand(mapManager));

	return toolbar;
}


MapExpress.Tools.ShowLayerControlMapCommandExt = MapExpress.Tools.ShowLayerControlMapCommand.extend({
	createContent: function(toolBarContainer) {
		this.options.template = "templates/vsmMapSidebar.html";
		var button = MapExpress.Tools.ShowLayerControlMapCommand.prototype.createContent.call(this, toolBarContainer);
		MapExpress.Controls.MapControlUtils.setStyle(button, "float:left");
		var divider = L.DomUtil.create('span', 'divider1', toolBarContainer);
		MapExpress.Controls.MapControlUtils.setStyle(divider, "float:left");
		return button;
	}
});

function replaceRosreestrIdentifyFunc() {
	var rosreestrLayers = window.MapManager.getMapModel().getLayersByOptionValue("displayName", "Публичная кадастровая карта");
	if (rosreestrLayers && rosreestrLayers.length > 0) {
		var allLayers = [];
		window.MapManager.getMapModel()._fillAllLayers(rosreestrLayers[0], allLayers);
		for (var i = 0; i < allLayers.length; i++) {
			var iterLayer = allLayers[i];
			if (iterLayer.mapLayer && iterLayer.mapLayer._dataPovider) {
				if (iterLayer.options.displayName === "Земельные участки") {
					iterLayer.mapLayer._dataPovider.getFeatureInfoAsync = zuIdentitfyFunc;
					continue;
				}
				if (iterLayer.options.displayName === "ОКС") {
					iterLayer.mapLayer._dataPovider.getFeatureInfoAsync = oksIdentitfyFunc;
					continue;
				}
				if (iterLayer.options.displayName === "ЗОУИТ") {
					iterLayer.mapLayer._dataPovider.getFeatureInfoAsync = zoutIdentitfyFunc;
					continue;
				}
				iterLayer.mapLayer._dataPovider.getFeatureInfoAsync = empyIdentitfyFunc;
			}
		}
	}

	function empyIdentitfyFunc(latlng, layerPoint, mapBounds, mapSize, mapZoom) {
		return null;
	}

	function zuIdentitfyFunc(latlng, layerPoint, mapBounds, mapSize, mapZoom) {
		return MapExpress.Utils.CadastreUtils.getObjectListGeoJSONByLatLngAsyn(latlng, MapExpress.Utils.CadastreUtils.cadastreObjectType.PARCEL);
	}

	function oksIdentitfyFunc(latlng, layerPoint, mapBounds, mapSize, mapZoom) {
		return MapExpress.Utils.CadastreUtils.getObjectListGeoJSONByLatLngAsyn(latlng, MapExpress.Utils.CadastreUtils.cadastreObjectType.OKS);
	}

	function zoutIdentitfyFunc(latlng, layerPoint, mapBounds, mapSize, mapZoom) {
		return MapExpress.Utils.CadastreUtils.getObjectListGeoJSONByLatLngAsyn(latlng, MapExpress.Utils.CadastreUtils.cadastreObjectType.ZOUT);
	}
}

function addFavoriteLayers() {
	var mapModel = window.MapManager.getMapModel();
	var favLayers = mapModel.getFavoriteLayers();
	var vsmLayers = mapModel.getLayersByOptionValue("displayName", "Слои ВСМ РЖД");
	if (vsmLayers && vsmLayers.length > 0) {
		mapModel._favoriteLayers = favLayers.concat(vsmLayers[0]._layers);
	}
}

function createMapStatusBar() {
	var statusBar = new MapExpress.Controls.MapStatusbarControl(window.MapManager);
	statusBar.addSection(new MapExpress.Controls.ZoomStandartStatusbarSection(window.MapManager));
	statusBar.addSection(new MapExpress.Controls.CoordinatesStandartStatusbarSection(window.MapManager));
	statusBar.addSection(new MapExpress.Controls.CurrentToolStatusbarSection(window.MapManager));
	//statusBar.addSection(new MapExpress.Controls.AttibutionStandartStatusbarSection(window.MapManager));
	window.MapManager.mapStatusBar = statusBar;
	return statusBar;
}

function addUserLayers() {
	var url = window.VSM_SITE_ROOT + "/Map/Map/UserLayers";
	var layerGroupModel = new MapExpress.Mapping.LayerModel("Пользовательские слои", {
		displayName: "Пользовательские слои"
	});
	window.MapManager.getMapModel().addLayer(layerGroupModel);

	MapExpress.Utils.Promise.GetJSON(url).then(
		function(data) {

			for (var i = 0; i < data.length; i++) {
				var iterLayerName = data[i];
				var newLayer = createLayerObj(iterLayerName);
				if (newLayer) {
					layerGroupModel.addLayer(newLayer);
				}
			}
		},
		function(err) {
			console.log(err);
		}
	);

	function createLayerObj(layerName) {
		var providerUrl = window.VSM_SITE_ROOT + "/Map/Map/GeoJsonData/?schema=user_layers&view=" + layerName + "&geoColumn=wkb_geometry&idColumn=ogc_fid&bbox={xMin},{yMin},{xMax},{yMax}";
		var provider = new MapExpress.Service.GeoJSONProvider(providerUrl);

		var layerClassOptions = {
			useVectorTile: false,
			dynamicData: true,
			maxZoom: 23,
			minZoom: 4,
			queryable: true
		};
		var layerClass = new MapExpress.Layers.GeoJSONServiceLayer(provider, layerClassOptions);

		var layerModelOptions = {
			displayName: layerName,
			type: "overlay"
		};
		var layerModel = new MapExpress.Mapping.LayerModel(layerName, layerModelOptions);
		layerModel.mapLayer = layerClass;

		return layerModel;
	}

}

function addRasters() {
	var url = window.VSM_SITE_ROOT + "/Map/Map/RasterFileNames";
	var layerGroupModel = new MapExpress.Mapping.LayerModel("Каталог растров", {
		displayName: "Каталог растров"
	});
	window.MapManager.getMapModel().addLayer(layerGroupModel);

	MapExpress.Utils.Promise.GetJSON(url).then(
		function(data) {
			for (var i = 0; i < data.length; i++) {
				var iterImageName = data[i];
				createLayerObj(iterImageName);
			}
		},
		function(err) {
			console.log(err);
		}
	);

	function createLayerObj(iterImageName) {
		var that = this;
		var shortName = /[^.]*/.exec(iterImageName)[0];
		var imageInfoUrl = window.VSM_SITE_ROOT + "/Map/Map/RasterFileInfo?fileName=" + shortName;

		MapExpress.Utils.Promise.GetJSON(imageInfoUrl).then(
			function(data) {
				var imageUrl = window.VSM_SITE_ROOT + "/Content/Raster/" + iterImageName;

				var uncorrectBounds = data["bbox"];
				var correctBounds = [
					[uncorrectBounds[1][0], uncorrectBounds[0][0]],
					[uncorrectBounds[1][1], uncorrectBounds[0][1]]
				];


				var provider = new MapExpress.Service.SingleImageProvider(imageUrl, {
					imageBounds: correctBounds
				});


				var layerClassOptions = {
					maxZoom: 23,
					minZoom: 0,
					queryable: false,
					visible: false
				};
				var layerClass = new MapExpress.Layers.ImageOverlayLayer(provider, layerClassOptions);

				var layerModelOptions = {
					displayName: iterImageName,
					type: "overlay"
				};
				var layerModel = new MapExpress.Mapping.LayerModel(iterImageName, layerModelOptions);
				layerModel.mapLayer = layerClass;

				window.MapManager.getMapModel().getLayerById("Каталог растров").addLayer(layerModel);

				layerModel.mapLayer.on('add', fitRasterToBounds);
			}
		);

		function fitRasterToBounds(evnt) {
			if (evnt.target) {
				evnt.target.bringToFront();
				var bounds = evnt.target.getBounds();
				MapManager._map.fitBounds(bounds);
			}
		}
	}
}

function _selectParcels() {
	if (window.selectedObjectsId !== undefined && window.selectedObjectsId.length > 0) {
		MapExpress.Tools.SelectParcelOnMap.selectParcelsByIds(window.VSM_SITE_ROOT + "/Map/Map/GeoJsonById/?view=land_geo&geoColumn=geom&idColumn=object_id&id={id}", window.selectedObjectsId);
	}
}