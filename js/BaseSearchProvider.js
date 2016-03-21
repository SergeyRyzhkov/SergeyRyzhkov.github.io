var BaseSearchProvider = function(name, map) {
	this.name = name
	this.map = map;
};
BaseSearchProvider.prototype = {
	getName: function(name) {
		return this.name
	},

	getDataByMask: function(searchValue) {},

	processResult: function(featuresActiveResult, options) {
		if (featuresActiveResult.geojson.type === "Point") {
			options = {
				iconSize: [12, 12],
				color: 'blue'
			};
			var coord = featuresActiveResult.geojson.coordinates.reverse();
			MapManager._map.setView(coord, 16);
			this.resultLayer = MapManager.addPulseMarker(coord, 5000, options);
		} else {
			var drawStyle = options.drawStyleOptions;
			this.resultLayer = L.geoJson(featuresActiveResult.geojson, {
				style: drawStyle
			}).addTo(this.map);
			var bounds = this.resultLayer.getBounds().pad(1);
			this.map.fitBounds(bounds);
		}

		if (this.map.getZoom() > 17) {
			this.map.setZoom(16);
		}

		window.setTimeout(removeTempLayer.bind(this), 5000);

		function removeTempLayer() {
			if (this.resultLayer) {
				MapManager._map.removeLayer(this.resultLayer);
				delete this.resultLayer;
			}
		}
	}
};