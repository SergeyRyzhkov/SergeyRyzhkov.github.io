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
};function VsmMapWorkspaceManager(onMapInitializedCallbak) {

	this.defaultMapModel = "map_model.json";
	this.getUrl = window.VSM_SITE_ROOT + "/Map/Map/MapWorkspaceList";
	this.updateUrl = window.VSM_SITE_ROOT + "/Map/Map/UpdateMapWorkspace";
	this.onMapInitializedCallbak = onMapInitializedCallbak;


	this.getWorkspaces = function() {
		return MapExpress.Utils.Promise.GetJSON(this.getUrl);
	};

	this.saveWorkspace = function(id, name, content) {
		var _data = {
			MAP_WORKSPACE_ID: id,
			MAP_WORKSPACE_NAME: name,
			MAP_WORKSPACE_BODY: content
		};
		$.ajax({
			type: "POST",
			url: this.updateUrl,
			data: _data
		});
	};

	this.loadWorkspace = function() {
		var that = this;
		this.getWorkspaces().then(
			function(data) {
				if (data && data.length > 0) {
					try {
						for (var i = data.length - 1; i >= 0; i--) {
							var iterData = data[i];
							try {
								var iterModel = JSON.parse(iterData.MAP_WORKSPACE_BODY);
								var modelId = window.MAP_WORKSPACE_ID ? window.MAP_WORKSPACE_ID : "16";
								if (iterModel && iterModel.id && iterModel.id.toString() === modelId) {
									window.MapManager.renderMap(iterModel);
									doOnMapInitializedCallbak();
									break;
								}
							} catch (exc) {
								//console.log(exc);
							}
						}
					} catch (exc) {
						//console.log(exc);
						//window.MapManager.renderMap(that.defaultMapModel);
						//that.doOnMapInitializedCallbak();
					}
				}
			},
			function(err) {
				//console.log(err);
				//window.MapManager.renderMap(that.defaultMapModel);
				//that.doOnMapInitializedCallbak();
			}
		);

		function doOnMapInitializedCallbak() {
			if (that.onMapInitializedCallbak && typeof(that.onMapInitializedCallbak) === "function") {
				that.onMapInitializedCallbak();
			}
		}
	};
};MapExpress.Tools.SelectParcelOnMap = {

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



};;function vsmShowLegend() {

	var _floatMapPanel = false;

	var layerGroupModel = new MapExpress.Mapping.LayerModel("Тематические карты", {
		displayName: "Тематические карты"
	});
	window.MapManager.getMapModel().addLayer(layerGroupModel);

	var t1 = createLayerModel("Статус актуальности СУПР", "land_thematic_status_view");
	var t2 = createLayerModel("Дней до завершения по БП", "land_thematic_base_plan_view");
	var t3 = createLayerModel("Дней до завершения", "land_thematic_event_day_control_view");
	var t4 = createLayerModel("Состояние земельного участка", "land_thematic_event_kind_view");
	//var t5 = createLayerModel("Минимальный активный Тип мероприятия", "land_thematic_event_type_view");
	//var t6 = createLayerModel("Тип кадастровых работ", "land_thematic_work_type_view");

	layerGroupModel.addLayer(t1);
	layerGroupModel.addLayer(t2);
	layerGroupModel.addLayer(t3);
	layerGroupModel.addLayer(t4);
	//layerGroupModel.addLayer(t5);
	//layerGroupModel.addLayer(t6);


	function layeradded(e) {
		if (_floatMapPanel) {
			_floatMapPanel.off("mapcontrol:remove:after", removeAllLegendLayers);
			_floatMapPanel.hide();
		}
		var layer = e.target;
		var tLayers = layerGroupModel._layers;
		for (var i = tLayers.length - 1; i >= 0; i--) {
			var titerLayer = tLayers[i];
			if (layer.options.id !== titerLayer.id) {
				window.MapManager.setLayerVisible(titerLayer.id, false);
			}
		}

		switch (layer.options.id) {
			case 'Дней до завершения':
				activateLegend("land-thematic-day-control-view", 'Дней до завершения');
				break;

			case 'Дней до завершения по БП':
				activateLegend("land-thematic-base-plan-view", 'Дней до завершения по БП');
				break;

			case 'Статус актуальности СУПР':
				activateLegend("land-thematic-status-view", 'Статус актуальности СУПР');
				break;

			case 'Тип кадастровых работ':
				activateLegend("land-thematic-work-type-view", 'Тип кадастровых работ');
				break;

			case 'Минимальный активный Тип мероприятия':
				activateLegend("land-thematic-event-type-view", 'Минимальный активный Тип мероприятия');
				break;

			case 'Состояние земельного участка':
				activateLegend("land-thematic-event-kind-view", 'Состояние земельного участка');
				break;
		}
	}

	function activateLegend(legendId, title) {
		if (_floatMapPanel) {
			_floatMapPanel.off("mapcontrol:remove:after", removeAllLegendLayers);
			_floatMapPanel.hide();
		}

		_floatMapPanel = new MapExpress.Controls.MapControl(window.MapManager._map, {
				headerEnabled: true,
				closeButtonEnabled: true,
				resizeable: true
			}).setTitle(title)
			.setContentFromTemplate("templates/mapLegend.html", legendId).setPosition("bottomRight")
			.show();
		_floatMapPanel.on("mapcontrol:remove:after", removeAllLegendLayers);
	}


	function removeAllLegendLayers() {
		var tLayers = layerGroupModel._layers;
		for (var i = tLayers.length - 1; i >= 0; i--) {
			var titerLayer = tLayers[i];
			window.MapManager.setLayerVisible(titerLayer.id, false);
		}
	}

	function createLayerModel(layerName, viewName) {
		var providerUrl = window.VSM_SITE_ROOT + "/Map/Map/GeoJsonData/?schema=vsm&view=" + viewName + "&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}";
		var provider = new MapExpress.Service.GeoJSONProvider(providerUrl);

		var layerClassOptions = {
			useVectorTile: false,
			dynamicData: true,
			maxZoom: 23,
			minZoom: 7,
			queryable: true,
			visible: false,
			visibleIndex: 0,
			id: layerName
		};
		var layerClass = new MapExpress.Layers.GeoJSONServiceLayer(provider, layerClassOptions);
		layerClass.on('add', layeradded, this);
		layerClass.on('remove', function() {
			if (_floatMapPanel) {
				_floatMapPanel.hide();
			}
		}, this);

		var layerModelOptions = {
			displayName: layerName,
			type: "overlay"
		};
		var layerModel = new MapExpress.Mapping.LayerModel(layerName, layerModelOptions);
		layerModel.mapLayer = layerClass;

		return layerModel;
	}
}