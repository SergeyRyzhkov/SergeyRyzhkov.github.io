MapExpress.Tools.SelectParcelOnMap = {

	_parecelSelectionLayerId: "parecelSelectionLayer",

	_selectedStyle: {
		weight: 4,
		opacity: 1,
		color: 'red',
		dashArray: '3',
		fillOpacity: 0.3,
		fillColor: '#666666'
	},

	selectParcelsByIds: function(getGeoJsonUrlTemplate, selObjectsId) {
		var that = this;
		this._dataUrl = getGeoJsonUrlTemplate;
		var ajaxPromises = [];

		if (this._layer) {
			MapManager._map.removeLayer(this._layer);
		}

		this._layer = new L.GeoJSON();
		this._layer.id = this._parecelSelectionLayerId;
		this._layer.displayName = this._parecelSelectionLayerId;
		this._layer.visible = true;
		this._layer.type = "overlay";
		this._layer.addTo(MapManager._map);
		
		for (var i = 0; i < selObjectsId.length; i++) {
			ajaxPromises.push(this._getParcelGeoJsonAsync(selObjectsId[i]));
		}

		Q.allSettled(ajaxPromises)
			.then(function(results) {
				for (var j = 0; j < results.length; j++) {
					var result = results[j];
					if (result.state === "fulfilled") {
						if (result.value !== undefined && result.value.features && result.value.features.length > 0) {
							that._layer.addData(result.value);
						}
					}
				}
				var bounds = that._layer.getBounds().pad(1);
				that._layer.setStyle(that._selectedStyle);
				that._layer.bringToFront();
				MapManager.moveOverlay(that._parecelSelectionLayerId, 0);
				MapManager._map.fitBounds(bounds);
			});
	},


	_getParcelGeoJsonAsync: function(parcelId) {
		var url = L.Util.template(this._dataUrl, {
			id: parcelId
		});
		return MapExpress.Utils.Promise.qAjax(url);
	}



};