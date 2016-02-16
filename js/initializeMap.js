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
	toolbar.addCommand(new MapExpress.Tools.ParcelCreateTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.ParcelEditTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.ParcelDeleteTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.ParcelInteractionTool(mapManager));
	toolbar.addCommand(new MapExpress.Tools.SelectionTool(mapManager, {
		selectionLayerId: "vsmParcels"
	}));


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

	//var treeLayerControl = new MapExpress.Controls.TreeLayerControl(mapManager);	
	//treeLayerControl.addTo(map);
	//treeLayerControl.show();

	map.whenReady(this.MapExpressToolsShowLegend, this);

	//map.whenReady(this._selectParcels, this);

	setTimeout(this._selectParcels.bind(this), 1100);

	this.addUserLayers();
	this.addRasters();

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
			var layerGroupModel = new MapExpress.Mapping.LayerModel("Пользовательские слои", {
				displayName: "Пользовательские слои"
			});
			for (var i = 0; i < data.length; i++) {
				var iterLayerName = data[i];
				var newLayer = createLayerObj(iterLayerName);
				if (newLayer) {
					layerGroupModel.addLayer(newLayer);
				}
			}
			window.MapManager.getMapModel().addLayer(layerGroupModel);
		},
		function(err) {
			console.log(err);
		}
	);

	function createLayerObj(layerName) {
		var providerUrl = VSM_SITE_ROOT + "/Map/Map/GeoJsonData/?view=test1." + layerName + "&geoColumn=wkb_geometry&idColumn=ogc_fid&bbox={xMin},{yMin},{xMax},{yMax}";
		var provider = new MapExpress.Service.GeoJSONProvider(providerUrl);

		var layerClassOptions = {
			useVectorTile: false,
			dynamicData: true,
			maxZoom: 23,
			minZoom: 7,
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

};

function addRasters() {

	var url = VSM_SITE_ROOT + "/Map/Map/RasterFileNames";
	MapExpress.Utils.Promise.qAjax(url).then(
		function(data) {
			var layerGroupModel = new MapExpress.Mapping.LayerModel("Каталог растров", {
				displayName: "Каталог растров"
			});
			window.MapManager.getMapModel().addLayer(layerGroupModel);
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
		var imageInfoUrl = VSM_SITE_ROOT + "/Map/Map/RasterFileInfo?fileName=" + shortName;

		MapExpress.Utils.Promise.qAjax(imageInfoUrl).then(
			function(data) {
				var imageUrl = VSM_SITE_ROOT + "/Content/Raster/" + iterImageName;

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
					queryable: true,
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
				var bounds = evnt.target.getBounds().pad(1);
				MapManager._map.fitBounds(bounds);
			}
		}
	}
}


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

			var model = {};
			model.baseLayers = that._mapManager.getMapModel().getBaseLayers();
			that._mapManager.getMapModel().sortLayersByVisibleIndex(model.baseLayers);

			model.layers = that._mapManager.getMapModel().getOverlayLayers();

			that._mapManager.getMapModel().sortLayersByVisibleIndex(model.layers);

			var rend = that._template.render(model);

			$("#mapSidebarTemplate").html(rend);
			$("#mapSidebarTemplate").trigger("sidebar:open");


			var layerTreeControl = new MapExpress.Controls.TreeLayerControl(MapManager);
			layerTreeControl.renderTree();

			var layerOrderControl = new MapExpress.Controls.LayerOrderControl(MapManager);
			layerOrderControl.render();

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