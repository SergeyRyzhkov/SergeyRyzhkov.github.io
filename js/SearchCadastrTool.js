MapExpress.Tools.SearchCadastrTool = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},


	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
		this._floatMapPanel = new MapExpress.Controls.FloatMapPanel(mapManager,{className:"float-map-panel big"});
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-search fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Поиск');
		return button;
	},

	activate: function() {
		var that = this;
		$("#layerInfoTemplate").empty();
		$("#layerInfoTemplate").load("./templates/search.html", function() {
			if (!that._template) {
				that._template = $.templates("#searchCadastreId");
			}
			var content = that._template.render();
			$("#layerInfoTemplate").empty();
			that._floatMapPanel.show();
			that._floatMapPanel.setContent(content);
		});


	},

	deactivate: function() {
		this._floatMapPanel.hide();
		$("#layerInfoTemplate").empty();
	}

});