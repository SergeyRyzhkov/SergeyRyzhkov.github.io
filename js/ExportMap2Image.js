MapExpress.Tools.ExportMapImage = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		mapSelector: VSM_MAP_SELECTOR,
		buttonClassName: 'btn btn-default btn-sm text-center'
	},


	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-file-image-o fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Экспорт');
		return button;
	},

	activate: function() {
		this.print = L.Control.mapPrint({ position:'bottomright'});
		this.print.onAdd(this._mapManager._map);
		this.print.setStateOn();
		this.print.creatButtonAndAreaPackage();
	},
	
	deactivate: function() {
		if (this.print) {
			this.print.setStateOff();
		}
	}

});