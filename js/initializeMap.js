function InitializeMap(mapDiv) {
	var map = L.map(mapDiv, {
		zoomControl: false,
		editable: true
	}).setView([56.13, 47.25], 9);

	var mapManager = new MapExpress.Mapping.MapManager(map);
	mapManager.renderMap(defaultMapModel);

	L.control.layers(mapManager._getBaseObj(), mapManager._getOverlayObj()).addTo(map);

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


	map.addControl(toolbar);


	L.control.zoom({
		position: 'topleft'
	}).addTo(map);

	L.control.scale().addTo(map, {
		imperial: true
	});

	return map;
};

MapExpress.Tools.ShowLayerControlMapCommand = MapExpress.Tools.BaseMapCommand.extend({

	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
		this._active = false;
	},

	createContent: function(toolBarContainer) {
		//var a = L.DomUtil.create('a', 'btn btn-primary', toolBarContainer);
		//var span = L.DomUtil.create('span', 'glyphicon glyphicon-info-sign', a);
		//return a;
		//

		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-bars fa-lg fa-fw', button);

		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Управление картой');
		button.setAttribute('id', "showLayerControlMapCommand");

		return button;
	},

	activate: function() {
		MapExpress.Utils.Promise.qAjax("./templates/mapsettings.html", true).then(
			function(data) {
				$('#main-sidebar-wrapper').html = data;
				$(".sidebar.left").trigger("sidebar:open");
			}
		);
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