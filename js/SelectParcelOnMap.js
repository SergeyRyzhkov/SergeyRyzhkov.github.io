MapExpress.Tools.SelectParcelOnMap = {

	parecelSelectionLayerId: "parecelSelectionLayer",

	selectedStyle: {
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.3,
		fillColor: '#666666'
	},

	selectParcelsByIds: function(getGeoJsonUrlTemplate, selectedObjectsId) {
		this._dataUrl = getGeoJsonUrlTemplate;
		var ajaxPromises = [];

		MapManager.removeLayerById(this.parecelSelectionLayerId);

		var layer = new L.GeoJSON();
		layer.setStyle(selectedStyle);

		layer.id = this.parecelSelectionLayerId;
		layer.displayName = this.parecelSelectionLayerId;
		layer.visible = true;
		layer.type = "overlay";

		MapManager.addLayerObject(layer);

		for (var i = 0; i < selectedObjectsId.length; i++) {
			ajaxPromises.push(this._getParcelGeoJsonAsync(selectedObjectsId[i]));
		}

		Q.allSettled(ajaxPromises)
			.then(function(results) {
				for (var i = 0; i < results.length; i++) {
					var result = results[i];
					if (result.state === "fulfilled") {
						layer.addData(result);
					}
				}
			});
	},


	_getParcelGeoJsonAsync: function(parcelId) {
		var url = L.Util.template(this._dataUrl, {
			id: parcelId
		});
		return MapExpress.Utils.Promise.qAjax(url);
	}



};