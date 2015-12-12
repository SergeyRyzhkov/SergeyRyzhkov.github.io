MapExpress.Tools.MapWorkspaceManagerTool = MapExpress.Tools.BaseMapCommand.extend({
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
		var li = L.DomUtil.create('i', 'fa fa-map fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Управление РН');
		return button;
	},

	activate: function() {

		var that = this;

		$("#layerInfoTemplate").empty();

		$("#layerInfoTemplate").load("./templates/mapWorkspaceManager.html", function() {
			if (!that._template) {
				that._template = $.templates("#mapWorkspaceManagerId");
			}
			new MapWorkspaceManager().getWorkspaces().then(
				function(data) {
					if (data && data.length > 0) {
						var model = {};
						var content = that._template.render(data);
						$("#layerInfoTemplate").empty();
						that._floatMapPanel.show();
						that._floatMapPanel.setContent(content);
					}
				},
				function(err) {
					console.log(err);
				}
			);
		});
	},

	deactivate: function() {
		this._floatMapPanel.hide();
	}


});