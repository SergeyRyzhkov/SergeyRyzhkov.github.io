function InitializeMap(mapDiv) {
	//var canvas = L.canvas();

	var map = L.map(mapDiv, {
		zoomControl: false,
		editable: true //,
			//	preferCanvas: true
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
	toolbar.addCommand(new MapExpress.Tools.SearchCadastrTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.BoxZoom(mapManager));
	toolbar.addCommand(new MapExpress.Tools.IdentifyMapCommand(mapManager));
	
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


	var measureControl = new L.Control.Measure(mapManager,{position:'topleft'});
	measureControl.addTo(map);

	
	MapExpressAddBaseLayers();
	//return map;
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

			$("#mapSidebarTemplate").html(that._template.render());

			new MapExpress.Controls.TreeLayerControl(MapManager).renderTree();
			new MapExpress.Controls.LayerOrderControl(MapManager).render();

			openSideBar();

			function openSideBar() {
				var control = $("#mapSidebarTemplate");
				control.trigger("sidebar:open");
				
				L.DomEvent
			.addListener(control, 'mousemove', L.DomEvent.stopPropagation)
			.addListener(control, 'click', L.DomEvent.stopPropagation)
			.addListener(control, 'dblclick', L.DomEvent.stopPropagation)
			.addListener(control, 'mousemove', L.DomEvent.preventDefault)
			.addListener(control, 'click', L.DomEvent.preventDefault)
			.addListener(control, 'dblclick', L.DomEvent.preventDefault)
			.addListener(control, 'onwheel', L.DomEvent.stopPropagation)
			.addListener(control, 'onwheel', L.DomEvent.preventDefault)
			.addListener(control, 'wheel', L.DomEvent.stopPropagation)
			.addListener(control, 'wheel', L.DomEvent.preventDefault)
			.addListener(control, 'mousewheel', L.DomEvent.stopPropagation)
			.addListener(control, 'mousewheel', L.DomEvent.preventDefault);
		
			}
		});
	}
});

function MapWorkspaceManager() {
	var getUrl = VSM_SITE_ROOT + "/Map/Map/MapWorkspaceList";
	var updateUrl = VSM_SITE_ROOT + "/Map/Map/UpdateMapWorkspace";

	function loadWorkspace() {
		//window.MapManager.renderMap(defaultMapModel);
		//onWorkspaceLoaded();
		getWorkspaces().then(
			function(data) {
				if (data && data.length > 0) {
					try {

						for (var i = data.length - 1; i >= 0; i--) {
							var iterData = data[i];
							try {
								var iterModel = JSON.parse(iterData.MAP_WORKSPACE_BODY);
								if (iterModel.id == 16) {
									window.MapManager.renderMap(iterModel);
									onWorkspaceLoaded();
									break;
								}
							} catch (exc) {

							}
						};

					} catch (exc) {
						console.log(exc);
						window.MapManager.renderMap(defaultMapModel);
						onWorkspaceLoaded();
					}
				}
			},
			function(err) {
				console.log(err);
				window.MapManager.renderMap(defaultMapModel);
				onWorkspaceLoaded();
			}
		);
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