MapExpress.Tools.ParcelInteractionTool = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		buttonClassName: 'btn btn-default btn-sm text-center',
		selectStyle: {
			fillOpacity: 0.65,
			fillColor: 'Green',
			color: 'Red',
			weight: 2,
			opacity: 0.5
		}
	},


	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
		this._floatMapPanel = new MapExpress.Controls.FloatMapPanel(mapManager, {
			className: "float-map-panel"
		});
		this._parcelsLayer = mapManager.getMapModel().getLayerById("6002f5ff-0c9e-4e68-8ab9-2629f4bff5f8");
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-commenting-o fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Подсказка по ЗУ');
		return button;
	},

	activate: function() {
		this._parcelInteract(true);
	},

	deactivate: function() {
		this._parcelInteract(false);
	},


	_parcelInteract: function(act) {
		var that = this;
		this._parcelsLayer.mapLayer.eachLayer(function(layer) {
			if (!act) {
				layer.off('mouseover', that._in, that);
				layer.off('mouseout', that._out, that);
				if (that._floatMapPanel) {
					that._floatMapPanel.hide();
				}
			} else {
				layer.on('mouseover', that._in, that);
				layer.on('mouseout', that._out, that);
			}
		});

	},

	_in: function(e) {
		var layer = e.target;
		if (!layer || layer === "undefined") {
			if (this._floatMapPanel) {
				this._floatMapPanel.hide();
			}
			return;
		}

		var that = this;

		$("#layerInfoTemplate").empty();

		$("#layerInfoTemplate").load("./templates/popupLayerInfo.html", function() {

			if (!that._template) {
				that._template = $.templates("#popupLayerInfoId");
			}
			var content = that._template.render(layer.feature);
			$("#popupLayerInfoId").empty();

			layer.setStyle(that.options.selectStyle);

			that._floatMapPanel.show();
			that._floatMapPanel.setContent(content);

		});
	},

	_out: function(e) {
		var that = this;
		var layer = e.target;
		this._parcelsLayer.mapLayer.updateStyle();
		hidePanel();

		function hidePanel() {
			if (that._floatMapPanel && that._floatMapPanel._visible) {
				that._floatMapPanel.hide();
			}
		}
	}


});