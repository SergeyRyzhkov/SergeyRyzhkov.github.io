MapExpress.Tools.ParcelFilterTool = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},


	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
		this._floatMapPanel = new MapExpress.Controls.FloatMapPanel(this._mapManager, {
			className: "float-map-panel big"
		});
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-filter fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Фильтр по ЗУ');
		return button;
	},

	activate: function() {

		var that = this;

		$("#layerInfoTemplate").empty();

		$("#layerInfoTemplate").load("./templates/parcelFilter.html", function() {
			if (!that._template) {
				that._template = $.templates("#parcelFilterId");
			}
			var content = that._template.render();
			that._floatMapPanel.show();
			that._floatMapPanel.setContent(content);
		});
	},

	deactivate: function() {
		this._floatMapPanel.hide();
	}


});