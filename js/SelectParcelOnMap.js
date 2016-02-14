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

		MapManager.removeLayerById(this._parecelSelectionLayerId);

		var layer = new L.GeoJSON();

		layer.id = this._parecelSelectionLayerId;
		layer.displayName = this._parecelSelectionLayerId;
		layer.visible = true;
		layer.type = "overlay";
--
		MapManager.addLayerObject(layer);

		for (var i = 0; i < selObjectsId.length; i++) {
			ajaxPromises.push(this._getParcelGeoJsonAsync(selObjectsId[i]));
		}

		Q.allSettled(ajaxPromises)
			.then(function(results) {
				for (var j = 0; j < results.length; j++) {
					var result = results[j];
					if (result.state === "fulfilled") {
						if (result.value !== undefined && result.value.features && result.value.features.length > 0) {
							layer.addData(result.value);
						}
					}
				}
				var bounds = layer.getBounds().pad(1);
				layer.setStyle(that._selectedStyle);
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