function vsmShowLegend() {

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