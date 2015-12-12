function InitializeMap(mapDiv) {
	var map = L.map(mapDiv, {
		zoomControl: false,
		editable: true
	});

	var mapManager = new MapExpress.Mapping.MapManager(map);
	window.MapManager = mapManager;

	new MapWorkspaceManager().loadWorkspace();
	return map;
};

function onWorkspaceLoaded() {
	var mapManager = window.MapManager;
	var map = window.MapManager._map;
	var toolbar = new MapExpress.Tools.MapToolbar(mapManager);

	toolbar.addCommand(new MapExpress.Tools.ShowLayerControlMapCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.MapWorkspaceManagerTool(mapManager));

	toolbar.addCommand(new MapExpress.Tools.SearchCadastrTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.BoxZoom(mapManager));
	toolbar.addCommand(new MapExpress.Tools.IdentifyMapCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.ParcelCreateTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.ParcelEditTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.ParcelDeleteTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.ParcelInteractionTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.SelectionTool(mapManager, {
		selectionLayerId: "vsmParcels"
	}));

	toolbar.addCommand(new MapExpress.Tools.ParcelFilterTool(mapManager));

	toolbar.addCommand(new MapExpress.Tools.ExportMapImage(mapManager, {
		mapSelector: VSM_MAP_SELECTOR
	}));

	map.addControl(toolbar);

	L.control.zoom({
		position: 'bottomright'
	}).addTo(map);

	L.control.scale().addTo(map, {
		imperial: false
	});


	var measureControl = new L.Control.Measure(mapManager);
	measureControl.addTo(map);


	map.whenReady(this.MapExpressToolsShowLegend, this);

	//map.whenReady(this._selectParcels, this);

	setTimeout(this._selectParcels.bind(this), 1100);

	this.addUserLayers();

	//return map;
};

function _selectParcels() {
	if (window.selectedObjectsId !== undefined && window.selectedObjectsId.length > 0) {
		MapExpress.Tools.SelectParcelOnMap.selectParcelsByIds(VSM_SITE_ROOT + "/Map/Map/GeoJsonById/?view=vsm.land_geo&geoColumn=geom&idColumn=object_id&id={id}", selectedObjectsId);
	}
};


function addUserLayers() {
	var url = VSM_SITE_ROOT + "/Map/Map/UserLayers";
	MapExpress.Utils.Promise.qAjax(url).then(
		function(data) {
			for (var i = 0; i < data.length; i++) {
				var iterLayerName = data[i];
				var newLayer = createLayerObj(iterLayerName);
				if (newLayer) {
					window.MapManager.addLayerObject(newLayer);
				}
			}
		},
		function(err) {
			console.log(err);
		}
	);

	function createLayerObj(layerName) {
		var providerUrl = VSM_SITE_ROOT + "/Map/Map/GeoJsonData/?view=test1." + layerName + "&geoColumn=wkb_geometry&idColumn=ogc_fid&bbox={xMin},{yMin},{xMax},{yMax}";
		var provider = new MapExpress.Service.GeoJSONProvider(providerUrl);
		var layerOptions = {
			useVectorTile: false,
			replaceDataOnReset: true,
			maxZoom: 23,
			minZoom: 0
		};
		var layer = new MapExpress.Layers.GeoJSONServiceLayer(provider, layerOptions);
		layer.id = layerName;
		layer.displayName = layerName;
		layer.visible = false;
		layer.type = 'user';
		return layer;
	}

};


MapExpress.Tools.ShowLayerControlMapCommand = MapExpress.Tools.BaseMapCommand.extend({

	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
	},

	createContent: function(toolBarContainer) {

		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-bars fa-lg fa-fw', button);

		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Управление картой');
		button.setAttribute('id', "showLayerControlMapCommand");

		return button;
	},

	activate: function() {
		var that = this;

		$("#mapSidebarTemplate").empty();

		$("#mapSidebarTemplate").load("./templates/mapSidebar.html", function() {
			if (!that._template) {
				that._template = $.templates("#mapSidebarTemplateId");
			}

			var model = that._mapManager.getMapModel();
			var rend = that._template.render(model);

			$("#mapSidebarTemplate").html(rend);
			$("#mapSidebarTemplate").trigger("sidebar:open");
			$('#side-menu').metisMenu();
		});

	}
});

function MapWorkspaceManager() {
	var getUrl = VSM_SITE_ROOT + "/Map/Map/MapWorkspaceList";
	var updateUrl = VSM_SITE_ROOT + "/Map/Map/UpdateMapWorkspace";

	function loadWorkspace() {
		window.MapManager.renderMap(defaultMapModel);
		onWorkspaceLoaded();
		//getWorkspaces().then(
		//	function(data) {
		//		if (data && data.length > 0) {
		//try {
		//	window.MapManager.renderMap(JSON.parse(data[0].MAP_WORKSPACE_BODY));
		//	onWorkspaceLoaded();
		//} catch (exc) {
		//				window.MapManager.renderMap(defaultMapModel);
		//				onWorkspaceLoaded();
		//}
		//		}
		//	},
		//	function(err) {
		//		console.log(err);
		//		window.MapManager.renderMap(defaultMapModel);
		//		onWorkspaceLoaded();
		//	}
		//);
	};


	function getWorkspaces() {
		return MapExpress.Utils.Promise.qAjax(getUrl);
	};

	function saveWorkspace(id, name, content) {
		var _data = {
			MAP_WORKSPACE_ID: id,
			MAP_WORKSPACE_NAME: name,
			MAP_WORKSPACE_BODY: content
		};
		$.ajax({
			type: "POST",
			url: updateUrl,
			data: _data
		});
	};

	MapWorkspaceManager.prototype.getWorkspaces = getWorkspaces;
	MapWorkspaceManager.prototype.saveWorkspace = saveWorkspace;
	MapWorkspaceManager.prototype.loadWorkspace = loadWorkspace;

	return this;
};


function MapExpressToolsShowLegend() {

	var _floatMapPanel = new MapExpress.Controls.FloatMapPanel(MapManager, {
		className: "float-map-panel big"
	});

	var layers = getThematicLayers();

	for (var m = layers.length - 1; m >= 0; m--) {
		var iterLayer = layers[m];
		iterLayer.visibleIndex = 0;
		iterLayer.on('add', layeradded, this);
		iterLayer.on('remove', function() {
			_floatMapPanel.hide();
		}, this);
	}


	function layeradded(e) {
		_floatMapPanel.hide();
		var tLayers = getThematicLayers();
		for (var i = tLayers.length - 1; i >= 0; i--) {
			var titerLayer = tLayers[i];
			window.MapManager._map.removeLayer(titerLayer);
			titerLayer.visible = false;
		}

		var layer = e.target;
		layer.off('add', layeradded, this);
		layer.visible = true;
		layer.addTo(window.MapManager._map);
		layer.bringToFront();
		layer.on('add', layeradded, this);

		switch (layer.id) {
			case 'land_thematic_day_control_view':
				activateLegend("#land-thematic-day-control-view");
				break;

			case 'land_thematic_base_plan_view':
				activateLegend("#land-thematic-base-plan-view");
				break;

			case 'land_thematic_status_view':
				activateLegend("#land-thematic-status-view");
				break;

			case 'land_thematic_work_type_view':
				activateLegend("#land-thematic-work-type-view");
				break;

			case 'land_thematic_event_type_view':
				activateLegend("#land-thematic-event-type-view");
				break;

			case 'land_thematic_event_kind_view':
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
	}

	function getThematicLayers() {
		var layers = window.MapManager.getMapModel().layers;
		var filtered = layers.filter(function(iter) {
			return iter.type === 'thematic';
		});
		return filtered;
	};
}