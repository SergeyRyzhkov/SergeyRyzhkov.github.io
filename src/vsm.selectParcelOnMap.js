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
			window.MapManager._map.removeLayer(this._layer);
		}

		this._layer = new L.GeoJSON();
		this._layer.id = this._parecelSelectionLayerId;
		this._layer.displayName = this._parecelSelectionLayerId;
		this._layer.visible = true;
		this._layer.type = "overlay";
		this._layer.addTo(window.MapManager._map);

		for (var i = 0; i < selObjectsId.length; i++) {
			var promise = this._getParcelGeoJsonAsync(selObjectsId[i]);
			ajaxPromises.push(promise);
		}
		$.when.apply($, ajaxPromises)
			.done(function() {
				if (arguments && arguments.length > 0) {
					for (var i = 0; i < arguments.length; i++) {
						var curFc = arguments[i];
						if (curFc.features) {
							for (var j = 0; j < curFc.features.length; j++) {
								var result = curFc.features[j];
								if (result !== undefined) {
									that._layer.addData(result);
								}
							}
						}
					}
					var bounds = that._layer.getBounds().pad(1);
					that._layer.setStyle(that._selectedStyle);
					that._layer.bringToFront();
					window.MapManager.moveOverlay(that._parecelSelectionLayerId, 0);
					window.MapManager._map.fitBounds(bounds);
				}
			});
	},


	_getParcelGeoJsonAsync: function(parcelId) {
		var url = L.Util.template(this._dataUrl, {
			id: parcelId
		});
		return MapExpress.Utils.Promise.GetJSON(url);
	}



};