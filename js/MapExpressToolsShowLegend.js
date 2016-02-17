function MapExpressToolsShowLegend() {

	var _floatMapPanel = new MapExpress.Controls.FloatMapPanel(MapManager, {
		className: "float-map-panel big"
	});

	var layerGroupModel = new MapExpress.Mapping.LayerModel("Тематические карты", {
		displayName: "Тематические карты"
	});
	window.MapManager.getMapModel().addLayer(layerGroupModel);

	var t1 = createLayerModel("Статус актуальности СУПР", "land_thematic_status_view");
	var t2 = createLayerModel("Дней до завершения по БП", "land_thematic_base_plan_view");
	var t3 = createLayerModel("Дней до завершения", "land_thematic_event_day_control_view");
	var t4 = createLayerModel("Наличие мероприятий", "land_thematic_event_kind_view");
	//var t5 = createLayerModel("Минимальный активный Тип мероприятия", "land_thematic_event_type_view");
	//var t6 = createLayerModel("Тип кадастровых работ", "land_thematic_work_type_view");

	layerGroupModel.addLayer(t1);
	layerGroupModel.addLayer(t2);
	layerGroupModel.addLayer(t3);
	layerGroupModel.addLayer(t4);
	//layerGroupModel.addLayer(t5);
	//layerGroupModel.addLayer(t6);


	function layeradded(e) {
		_floatMapPanel.hide();

		var layer = e.target;
		var tLayers = layerGroupModel._layers;
		for (var i = tLayers.length - 1; i >= 0; i--) {
			var titerLayer = tLayers[i];
			if (layer.options.id !== titerLayer.id) {
				window.MapManager.setLayerVisible(titerLayer.id, false);
			}
		}

		//layer.off('add', layeradded, this);
		//window.MapManager.setLayerVisible(layer.options.id, true);
		layer.bringToFront();
		//layer.on('add', layeradded, this);


		switch (layer.options.id) {
			case 'Дней до завершения':
				activateLegend("#land-thematic-day-control-view");
				break;

			case 'Дней до завершения по БП':
				activateLegend("#land-thematic-base-plan-view");
				break;

			case 'Статус актуальности СУПР':
				activateLegend("#land-thematic-status-view");
				break;

			case 'Тип кадастровых работ':
				activateLegend("#land-thematic-work-type-view");
				break;

			case 'Минимальный активный Тип мероприятия':
				activateLegend("#land-thematic-event-type-view");
				break;

			case 'Наличие мероприятий':
				activateLegend("#land-thematic-event-kind-view");
				break;
		}
	};

	function activateLegend(legendId) {
		_floatMapPanel.hide();

		var that = this;
		$("#layerInfoTemplate").empty();

		$("#layerInfoTemplate").load("./templates/mapLegend.html", function() {
			var template = $.templates(legendId);
			var content = template.render();
			$("#layerInfoTemplate").empty();
			if (legendId !== content) {
				_floatMapPanel.show();
				_floatMapPanel.setContent(content);
			}
		});
	};



	function createLayerModel(layerName, viewName) {
		var providerUrl = VSM_SITE_ROOT + "/Map/Map/GeoJsonData/?view=vsm." + viewName + "&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}";
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
			_floatMapPanel.hide();
		}, this);

		var layerModelOptions = {
			displayName: layerName,
			type: "overlay"
		};
		var layerModel = new MapExpress.Mapping.LayerModel(layerName, layerModelOptions);
		layerModel.mapLayer = layerClass;

		return layerModel;
	};
};