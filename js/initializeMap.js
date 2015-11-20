function InitializeMap(mapDiv) {
	var map = L.map(mapDiv, {
		zoomControl: false,
		editable: true
	}).setView([56.13, 47.25], 9);

	var mapManager = new MapExpress.Mapping.MapManager(map);
	mapManager.renderMap(defaultMapModel);


	var toolbar = new MapExpress.Tools.MapToolbar(mapManager);
	var layersCommand = new MapExpress.Tools.ShowLayerControlMapCommand(mapManager);
	var idCommand = MapExpress.Service.identifyMapCommand(mapManager);

	var createParcelCommand = new MapExpress.Tools.CreateParcelCommand(mapManager);
	var createLineCommand = new MapExpress.Tools.CreateLineCommand(mapManager);
	var createPointCommand = new MapExpress.Tools.CreatePointCommand(mapManager);


	toolbar.addCommand(layersCommand);
	toolbar.addCommand(idCommand);
	toolbar.addCommand(createParcelCommand);
	toolbar.addCommand(createLineCommand);
	toolbar.addCommand(createPointCommand);
	toolbar.addCommand(new MapExpress.Tools.BoxZoom(mapManager));

	var toolbar2 = new MapExpress.Tools.MapToolbar(mapManager, {
		position: "topright"
	});
	toolbar2.addCommand(new MapExpress.Tools.BaseMapManagerCommand(mapManager));


	map.addControl(toolbar);
	map.addControl(toolbar2);

	L.control.zoom({
		position: 'topleft'
	}).addTo(map);

	L.control.scale().addTo(map, {
		imperial: true
	});

	//mapManager.moveOverlay("Полоса отвода", 0);

	L.control.layers(mapManager._getBaseObj(), mapManager._getOverlayObj()).addTo(map);

	return map;
};

MapExpress.Tools.BaseMapManagerCommand = MapExpress.Tools.BaseMapCommand.extend({

	options: {
		buttonClassName: 'btn btn-default btn-sm text-center',
		_first: true
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('ul', 'nav navbar-top-links navbar-right', toolBarContainer);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Базовые слои');
		button.setAttribute('id', 'baseMapManagerCommand')
			//L.DomUtil.addClass(button, 'dropdown');
			//var a = L.DomUtil.create('a', 'dropdown-toggle', button);
			//a.setAttribute('data-toggle', 'dropdown');
			//a.setAttribute('href', '#');

		//var i = L.DomUtil.create('i', 'fa fa-bars fa-envelope fa-fw', a);

		return button;
	},

	activate: function() {
		if (!this._first) {
			$('#baseMapManagerCommand').load("./templates/mapbasemaps.html");
			this._first = true;
		}

		//var tmpl = $.templates("#myTemplate");
		//document.getElementById("baseMapManagerCommand").innerHTML = tmpl.render(person);

		//$.get('./templates/mapbasemaps.html', function(templ) {
		//	console.log(templ);
		//	var tmpl = $.templates(templ);
		//	console.log(tmpl);
		//document.getElementById("baseMapManagerCommand").innerHTML = tmpl.render(data);
		//});
	}
});

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
			$('#side-menu').metisMenu();
			$("#mapSidebarTemplate").trigger("sidebar:open");
		});

	}
});


MapExpress.Tools.CreateParcelCommand = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
		this._active = false;
		this.editLayer = this._mapManager.getLayerById("Участки ВСМ");
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-object-group fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Создать ЗУ');
		return button;
	},

	activate: function() {
		this._mapManager._map.editTools.startPolygon();
		if (!this._active) {
			//this._mapManager._map.on('editable:drawing:end', this._featureAdded, this)
			//this._mapManager._map.on('editable:editing', function(e) {
			//	e.layer.setStyle({
			//		color: 'DarkRed'
			//	});
			//});
		}
		this._active = true;
	},

	_featureAdded: function(e) {
		e.layer.feature = {
			"properties": {
				"КН": "Кадастровый номер ЗУ",
				"Примечание": "Текст",
				"Идентификатор": e.layer._leaflet_id
			}
		};
		this.editLayer.addLayer(e.layer);
		console.log(e.layer);
	}

});

MapExpress.Tools.CreateLineCommand = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
		this._active = false;
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-arrows-h fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Создать линию');
		return button;
	},

	activate: function() {
		this._mapManager._map.editTools.startPolyline();
		if (!this._active) {
			//this._mapManager._map.on('editable:editing', function(e) {
			//	e.layer.setStyle({
			//		color: 'DarkBlue'
			//	});
			//});
		}
		this._active = true;
	}
});


MapExpress.Tools.CreatePointCommand = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-map-pin fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Создать точку');
		return button;
	},

	activate: function() {
		this._mapManager._map.editTools.startMarker();
	}
});