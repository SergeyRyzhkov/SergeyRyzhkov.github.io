L.Control.MapPrintControl = L.Control.extend({
	options: {
		position: 'topright'
	},

	futureSize: {
		width: 0,
		height: 0,
		size: 0,
		zoom: 0
	},

	initialize: function(map, options) {
		this.map = map;
		L.setOptions(this, options);
		this.active = false;
	},

	addTo: function(map) {
		this.map = map;
		L.Control.prototype.addTo.call(this, map);
		this._setUpButtonHandlers();
		this._activateAreaSelect();
		return this;
	},

	onAdd: function(map) {
		return this._createContent();
	},

	remove: function() {
		L.Control.prototype.remove.call(this);
		if (this.areaSelect) {
			this.areaSelect.off("change", this._areaSelectChanged, this);
			this.areaSelect.remove();
		}
	},

	_areaSelectChanged: function(e) {
		this.updateFutureSize();
		this.alertWarningDiv();
	},

	_createContent: function() {
		this.controlDiv = L.DomUtil.create('div', 'map-print-container');
		this.controlDiv.setAttribute('id', 'map-print-container');
		MapExpress.Controls.MapControlUtils.stopMousePropagation(this.controlDiv);

		$(this.controlDiv).append('<button id="mapprint-zoomDown"  class="btn btn-default btn-sm text-center" title="Уменьшить масштабный коэффициент карты">-</button>');
		$(this.controlDiv).append('<input id="mapprint-zoomInput" class="zoomInput" title="Масштабный коэффициент карты" maxlength="2"/>');
		$(this.controlDiv).append('<button id="mapprint-zoomUp" class="btn btn-default btn-sm text-center" title="Увеличить масштабный коэффициент карты">+</button>');
		$(this.controlDiv).append('<button id="mapprint-print" class="btn btn-default btn-sm text-center" title="Экспорт" value="Экспорт">Экспорт</button>');
		$(this.controlDiv).append('<button id="mapprint-print-activemap" class="btn btn-default btn-sm text-center" title="Экспорт активного вида карты" value="активный вид карты">Активный вид</button>');
		$(this.controlDiv).append('<button id="mapprint-remove" class="btn btn-default btn-sm text-center" title="Cбросить выбор территории" value="Отмена">Отмена</button>');

		return this.controlDiv;
	},

	_activateAreaSelect: function() {
		var mapHeight = $(this.map.getContainer()).height();
		var mapWidth = $(this.map.getContainer()).width();

		this.areaSelect = L.areaSelect({
			width: mapWidth * 0.8,
			height: mapHeight * 0.8
		}).addTo(this.map);
		this.updateFutureSize();
		this.alertWarningDiv();
		this.areaSelect.on("change", this._areaSelectChanged, this);
	},


	_setUpButtonHandlers: function() {
		var that = this;

		$("#mapprint-print-activemap").click(function(e) {
			that.map.fire("map-print-control:export-activemap", this);
			that.exportMap(true);
		});

		$("#mapprint-remove").click(function(e) {
			that.remove();
			that.map.fire("map-print-control:removed", this);
		});

		$("#mapprint-zoomUp").click(function() {
			var value = parseInt(document.getElementById('mapprint-zoomInput').value);
			value = isNaN(value) ? 1 : value;
			value++;
			if (value > 22) {
				value = 22;
			}
			document.getElementById('mapprint-zoomInput').value = value;
			$('#mapprint-zoomInput').trigger('valuechanged');
			that.map.fire("map-print-control:zoomUp", this);
		});

		$("#mapprint-zoomDown").click(function() {
			var value = parseInt(document.getElementById('mapprint-zoomInput').value);
			value = isNaN(value) ? 1 : value;
			value--;
			if (value < 0) {
				value = 0;
			}
			document.getElementById('mapprint-zoomInput').value = value;
			$('#mapprint-zoomInput').trigger('valuechanged');
			that.map.fire("map-print-control:zoomDown", this);
		});

		$('#mapprint-zoomInput').bind('valuechanged', function() {
			that.updateFutureSize();
			that.alertWarningDiv();
		});

		$('#mapprint-print').click(function() {
			that.map.fire("map-print-control:export-click", this);
			that.exportMap();
		});

		var initZoom = this.map ? this.map.getZoom() : 10;
		document.getElementById('mapprint-zoomInput').value = initZoom;
	},


	updateFutureSize: function() {
		var futureCenter = this.map.getCenter();
		var zoom = document.getElementById('mapprint-zoomInput').value;
		var northEastToGetFutureSizeAtCurrentZoom = this.map.getPixelBounds(this.areaSelect.getBounds()._northEast, zoom);
		var southWestToGetFutureSizeAtCurrentZoom = this.map.getPixelBounds(this.areaSelect.getBounds()._southWest, zoom);
		var futureNE = {
			x: null,
			y: null
		};
		var futureSW = {
			x: null,
			y: null
		};
		futureNE.x = northEastToGetFutureSizeAtCurrentZoom.min.x - this.map.getSize().x / 2;
		futureNE.y = northEastToGetFutureSizeAtCurrentZoom.min.y - this.map.getSize().y / 2;
		futureSW.x = southWestToGetFutureSizeAtCurrentZoom.min.x - this.map.getSize().x / 2;
		futureSW.y = southWestToGetFutureSizeAtCurrentZoom.min.y - this.map.getSize().y / 2;

		var futureCanvasHight = futureSW.y - futureNE.y;
		var futureCanvasWidth = futureNE.x - futureSW.x;

		this.futureSize.width = futureCanvasWidth;
		this.futureSize.height = futureCanvasHight;
		this.futureSize.size = futureCanvasWidth * futureCanvasHight;
		this.futureSize.zoom = document.getElementById('mapprint-zoomInput').value;
	},

	alertWarningDiv: function() {
		var colorScheme;
		var size = this.futureSize.size;

		document.getElementById('mapprint-zoomInput').title = size;

		function colorSchemeGrey() {
			$('#mapprint-zoomInput').css("color", "rgba(68,68,68,1)");
			$('#mapprint-zoomInput').css("text-shadow", "1px 1px 0 rgba(255,255,255,0.66)");
		}

		function colorSchemeWhite() {
			$('#mapprint-zoomInput').css("color", "rgba(255,255,255,1)");
			$('#mapprint-zoomInput').css("text-shadow", "1px 1px 0 rgba(68,68,68,0.66)");
		}

		if (size <= 400000) {
			colorScheme = "#3CFF00";
			colorSchemeGrey();
		} else if (size > 400000 && size <= 600000) {
			colorScheme = "#A2FF00";
			colorSchemeGrey();
		} else if (size > 600000 && size <= 1020000) {
			colorScheme = "#CDFF00";
			colorSchemeGrey();
		} else if (size > 1020000 && size <= 1400000) {
			colorScheme = "#E6FF00";
			colorSchemeGrey();
		} else if (size > 1400000 && size <= 2000000) {
			colorScheme = "#E7FF00";
			colorSchemeGrey();
		} else if (size > 2000000 && size <= 2430000) {
			colorScheme = "#FFD500";
			colorSchemeGrey();
		} else if (size > 2430000 && size <= 3500000) {
			colorScheme = "#FFAB00";
			colorSchemeGrey();
		} else if (size > 3500000 && size <= 4680000) {
			colorScheme = "#FF8000";
			colorSchemeWhite();
		} else if (size > 4680000 && size <= 6300000) {
			colorScheme = "#FF4D00";
			colorSchemeWhite();
		} else if (size > 6300000 && size <= 8000000) {
			colorScheme = "#FF3300";
			colorSchemeWhite();
		} else if (size > 8000000) {
			colorScheme = "#FF0000";
			colorSchemeWhite();
		};
		$('#mapprint-zoomInput').css("background-color", colorScheme);
		$('#mapprint-zoomInput:before').css("border-bottom-color", colorScheme);
	},

	exportMap: function(isActiveView) {
		$(".leaflet-control-container, #map-print-container").attr("data-html2canvas-ignore", "true");
		$(".leaflet-control-container").attr("data-html2canvas-ignore", "true");
		this.areaSelect.off("change", this._resetChange, this);
		this.remove();

		if (isActiveView && isActiveView === true) {
			L.mapPrint().exportActiveMapView(this.map);
		} else {
			L.mapPrint().export(this.map, this.futureSize.width, this.futureSize.height, this.futureSize.zoom, this.futureSize.size);
			//MapExpress.Mapping.MapUtils.generateWldFile(bbox, size, "export.wld");
		}
	}

});

L.Control.mapPrintControl = function(options) {
	return new L.Control.MapPrintControl(options);
};