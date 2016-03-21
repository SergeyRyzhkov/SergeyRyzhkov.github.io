MapExpress.Tools.ParcelEditTool = MapExpress.Tools.BaseMapCommand.extend({

	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);

		this._parcelsLayer = mapManager.getMapModel().getLayerById("6002f5ff-0c9e-4e68-8ab9-2629f4bff5f8");
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-object-group fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Редактировать границу ЗУ');
		return button;
	},

	activate: function() {
		this._parcelStartEdit(true);
	},

	deactivate: function() {
		this._parcelStartEdit(false);
	},

	_parcelStartEdit: function(isactive) {
		var that = this;
		this._mapManager._map.doubleClickZoom.enable();
		this._mapManager._map.dragging.enable();

		if (!this._parcelsLayer) {
			return;
		}

		if (!isactive) {
			this._parcelsLayer.mapLayer.eachLayer(function(layer) {
				layer.off({
					click: _startEdit,
					dblclick: _save
				});
				layer.off('dblclick', L.DomEvent.stop).off('dblclick', layer.toggleEdit);
			});
		}


		if (isactive) {
			this._parcelsLayer.mapLayer.eachLayer(function(layer) {
				layer.on({
					click: _startEdit,
					dblclick: _save
				});
				layer.on('dblclick', L.DomEvent.stop).on('dblclick', layer.toggleEdit);
			});

			this._mapManager._map.on('editable:editing', function(e) {
				e.layer.setStyle({
					color: 'DarkRed'
				});
			});

			this._mapManager._map.doubleClickZoom.disable();
			this._mapManager._map.dragging.disable();
		}



		function _startEdit(e) {
			var layer = e.target;

			var editor = layer.editor === "undefinde" || !layer.editor ? layer.enableEdit() : layer.editor;

			if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && layer.editEnabled() && !editor.alreadyStartHole) {
				editor.newHole(e.latlng);
				editor.alreadyStartHole = true;
			}
		}

		function _save(e) {
			var geoJson = e.target.toGeoJSON();
			var updateUrl = VSM_SITE_ROOT + "/Map/Map/UpdateLandGeo";
			var data = {
				id: geoJson.properties.id,
				json: JSON.stringify(geoJson.geometry)
			};
			$.ajax({
				type: "POST",
				url: updateUrl,
				data: data,
				complete: function(data) {
					if (that._mapManager.layerEnabled("6002f5ff-0c9e-4e68-8ab9-2629f4bff5f8")) {
					//	console.log(that._parcelsLayer.mapLayer)
						that._parcelsLayer.mapLayer.updateStyle();
					}
				}
			});
			that._mapManager._map.dragging.enable();
		}
	}


});



MapExpress.Tools.ParcelCreateTool = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);

		this._parcelsLayer = mapManager.getMapModel().getLayerById("6002f5ff-0c9e-4e68-8ab9-2629f4bff5f8");
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-file-o fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Создать границу ЗУ');
		return button;
	},

	activate: function() {
		this._startCreate(true);
	},

	deactivate: function() {
		this._startCreate(false);
	},

	_startCreate: function(isactive) {

		if (!this._parcelsLayer) {
			return;
		}

		if (isactive) {
			this._mapManager._map.on('editable:editing', this._setEditingStyle, this);
			this._mapManager._map.on('editable:drawing:commit', this._savaPercel, this);
			this._mapManager._map.editTools.startPolygon();
		}

		if (!isactive) {
			this._mapManager._map.off('editable:editing', this._setEditingStyle, this);
			this._mapManager._map.off('editable:drawing:commit', this._savaPercel, this);
		}
	},

	_savaPercel: function(e) {
		var that = this;
		var insertUrl = VSM_SITE_ROOT + "/Map/Map/InsertLandGeo";
		var layer = e.layer;
		var geoJson = layer.toGeoJSON();

		var data = {
			json: JSON.stringify(geoJson.geometry)
		};
		$.ajax({
			type: "POST",
			url: insertUrl,
			data: data,
			complete: function(data) {
				if (that._mapManager.layerEnabled("6002f5ff-0c9e-4e68-8ab9-2629f4bff5f8")) {
					that._parcelsLayer.mapLayer._refreshData();
				}
			}
		});

		this._mapManager._map.removeLayer(layer);
	},

	_setEditingStyle: function(e) {
		e.layer.setStyle({
			color: 'DarkRed'
		});
	}
});

MapExpress.Tools.ParcelDeleteTool = MapExpress.Tools.BaseMapCommand.extend({
	options: {
		buttonClassName: 'btn btn-default btn-sm text-center'
	},

	initialize: function(mapManager, options) {
		MapExpress.Tools.BaseMapCommand.prototype.initialize.call(this, mapManager, options);
		L.setOptions(this, options);
	},

	createContent: function(toolBarContainer) {
		var button = L.DomUtil.create('button', this.options.buttonClassName, toolBarContainer);
		var li = L.DomUtil.create('i', 'fa fa-times-circle fa-lg fa-fw', button);
		button.setAttribute('data-toggle', 'tooltip');
		button.setAttribute('data-placement', 'bottom');
		button.setAttribute('title', 'Удалить границу ЗУ');
		return button;
	},

	activate: function() {
		var that = this;
		var parcelsLayer = this._mapManager.getMapModel().getLayerById("6002f5ff-0c9e-4e68-8ab9-2629f4bff5f8");
		var selection = this._mapManager.getSelection("6002f5ff-0c9e-4e68-8ab9-2629f4bff5f8");
		var selected = selection.getSelections();

		var deleteUrl = VSM_SITE_ROOT + "/Map/Map/DeleteLandGeo";
		for (var j = 0; j < selected.length; j++) {
			var data = {
				id: selected[j].feature.properties.id
			};

			$.ajax({
				type: "POST",
				url: deleteUrl,
				data: data,
				complete: function(data) {
					if (that._mapManager.layerEnabled("6002f5ff-0c9e-4e68-8ab9-2629f4bff5f8")) {
						parcelsLayer.mapLayer._refreshData();
					}
				}
			});
		}

	}
});