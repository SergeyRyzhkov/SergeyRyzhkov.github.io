L.AreaSelect = L.Class.extend({
	includes: L.Mixin.Events,

	options: {
		width: 200,
		height: 300,
		keepAspectRatio: false,
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);

		this._width = this.options.width;
		this._height = this.options.height;
	},

	addTo: function(map) {
		this.map = map;
		this._createElements();
		this._render();
		return this;
	},

	getBounds: function() {
		var size = this.map.getSize();
		var topRight = new L.Point();
		var bottomLeft = new L.Point();

		bottomLeft.x = Math.round((size.x - this._width) / 2);
		topRight.y = Math.round((size.y - this._height) / 2);
		topRight.x = size.x - bottomLeft.x;
		bottomLeft.y = size.y - topRight.y;

		var sw = this.map.containerPointToLatLng(bottomLeft);
		var ne = this.map.containerPointToLatLng(topRight);

		return new L.LatLngBounds(sw, ne);
	},
	
	getPixelBounds: function() {
		var size = this.map.getSize();
		var topLef = new L.Point();
		var bottomRig = new L.Point();

		topLef.x = Math.round((size.x - this._width) / 2);
		topLef.y = Math.round((size.y - this._height) / 2);
		bottomRig.x = size.x - topLef.x;
		bottomRig.y = size.y - topLef.y;
	
		return [topLef, bottomRig];
	},

	remove: function() {
		this.map.off("moveend", this._onMapChange);
		this.map.off("zoomend", this._onMapChange);
		this.map.off("resize", this._onMapResize);

		this._container.parentNode.removeChild(this._container);
	},

	_createElements: function() {
		if (!!this._container)
			return;

		this._container = L.DomUtil.create("div", "leaflet-areaselect-container", this.map._controlContainer)
		this._topShade = L.DomUtil.create("div", "leaflet-areaselect-shade", this._container);
		this._bottomShade = L.DomUtil.create("div", "leaflet-areaselect-shade", this._container);
		this._leftShade = L.DomUtil.create("div", "leaflet-areaselect-shade", this._container);
		this._rightShade = L.DomUtil.create("div", "leaflet-areaselect-shade", this._container);

		this._nwHandle = L.DomUtil.create("div", "leaflet-areaselect-handle", this._container);
		this._swHandle = L.DomUtil.create("div", "leaflet-areaselect-handle", this._container);
		this._neHandle = L.DomUtil.create("div", "leaflet-areaselect-handle", this._container);
		this._seHandle = L.DomUtil.create("div", "leaflet-areaselect-handle", this._container);

		this._setUpHandlerEvents(this._nwHandle);
		this._setUpHandlerEvents(this._neHandle, -1, 1);
		this._setUpHandlerEvents(this._swHandle, 1, -1);
		this._setUpHandlerEvents(this._seHandle, -1, -1);

		this.map.on("moveend", this._onMapChange, this);
		this.map.on("zoomend", this._onMapChange, this);
		this.map.on("resize", this._onMapResize, this);

		this.fire("change");
	},

	_setUpHandlerEvents: function(handle, xMod, yMod) {
		xMod = xMod || 1;
		yMod = yMod || 1;

		var self = this;

		function onMouseDown(event) {
			event.stopPropagation();
			L.DomEvent.removeListener(this, "mousedown", onMouseDown);
			var curX = event.pageX;
			var curY = event.pageY;
			var ratio = self._width / self._height;
			var size = self.map.getSize();

			function onMouseMove(event) {
				if (self.options.keepAspectRatio) {
					var maxHeight = (self._height >= self._width ? size.y : size.y * (1 / ratio)) - 30;
					self._height += (curY - event.originalEvent.pageY) * 2 * yMod;
					self._height = Math.max(30, self._height);
					self._height = Math.min(maxHeight, self._height);
					self._width = self._height * ratio;
				} else {
					self._width += (curX - event.originalEvent.pageX) * 2 * xMod;
					self._height += (curY - event.originalEvent.pageY) * 2 * yMod;
					self._width = Math.max(30, self._width);
					self._height = Math.max(30, self._height);
					self._width = Math.min(size.x - 30, self._width);
					self._height = Math.min(size.y - 30, self._height);

				}

				curX = event.originalEvent.pageX;
				curY = event.originalEvent.pageY;
				self._render();
			}

			function onMouseUp(event) {
				L.DomEvent.removeListener(self.map, "mouseup", onMouseUp);
				L.DomEvent.removeListener(self.map, "mousemove", onMouseMove);
				L.DomEvent.addListener(handle, "mousedown", onMouseDown);
				self.fire("change");
			}

			L.DomEvent.addListener(self.map, "mousemove", onMouseMove);
			L.DomEvent.addListener(self.map, "mouseup", onMouseUp);
		}
		L.DomEvent.addListener(handle, "mousedown", onMouseDown);
	},

	_onMapResize: function() {
		this._render();
	},

	_onMapChange: function() {
		this.fire("change");
	},

	_render: function() {
		var size = this.map.getSize();
		var handleOffset = Math.round(this._nwHandle.offsetWidth / 2);

		var topBottomHeight = Math.round((size.y - this._height) / 2);
		var leftRightWidth = Math.round((size.x - this._width) / 2);

		function setDimensions(element, dimension) {
			element.style.width = dimension.width + "px";
			element.style.height = dimension.height + "px";
			element.style.top = dimension.top + "px";
			element.style.left = dimension.left + "px";
			element.style.bottom = dimension.bottom + "px";
			element.style.right = dimension.right + "px";
		}

		setDimensions(this._topShade, {
			width: size.x,
			height: topBottomHeight,
			top: 0,
			left: 0
		});
		setDimensions(this._bottomShade, {
			width: size.x,
			height: topBottomHeight,
			bottom: 0,
			left: 0
		});
		setDimensions(this._leftShade, {
			width: leftRightWidth,
			height: size.y - (topBottomHeight * 2),
			top: topBottomHeight,
			left: 0
		});
		setDimensions(this._rightShade, {
			width: leftRightWidth,
			height: size.y - (topBottomHeight * 2),
			top: topBottomHeight,
			right: 0
		});

		setDimensions(this._nwHandle, {
			left: leftRightWidth - handleOffset,
			top: topBottomHeight - 7
		});
		setDimensions(this._neHandle, {
			right: leftRightWidth - handleOffset,
			top: topBottomHeight - 7
		});
		setDimensions(this._swHandle, {
			left: leftRightWidth - handleOffset,
			bottom: topBottomHeight - 7
		});
		setDimensions(this._seHandle, {
			right: leftRightWidth - handleOffset,
			bottom: topBottomHeight - 7
		});
	}
});

L.areaSelect = function(options) {
	return new L.AreaSelect(options);
};

L.Control.MapPrint = L.Control.extend({
	options: {
		position: 'topright'
	},
	initialize: function(options) {
		L.setOptions(this, options);
		this.map = null;
		this.active = false;
	},

	onAdd: function(map) {

		this.map = map;
		this.active = false;

		this.controlDiv = L.DomUtil.create('div', 'leaflet-control-mapPrint');
		this.controlDiv.control = this;
		this.controlDiv.title = 'Click here then draw a square on the map, to zoom in to an area';
		this.controlDiv.innerHTML = ' ';
		L.DomEvent
			.addListener(this.controlDiv, 'mousedown', L.DomEvent.stopPropagation)
			.addListener(this.controlDiv, 'click', L.DomEvent.stopPropagation)
			.addListener(this.controlDiv, 'click', L.DomEvent.preventDefault)
			.addListener(this.controlDiv, 'click', function() {
				this.control.toggleState();
			});

		this.setStateOff();

		return this.controlDiv;
	},

	toggleState: function() {
		this.active ? this.setStateOff() : this.setStateOn();
	},

	setStateOn: function() {
		L.DomUtil.addClass(this.controlDiv, 'leaflet-control-mapPrint-active');
		this.active = true;
		this.map.dragging.disable();
		this.map.boxZoom.addHooks();
		this.map.on('mousedown', this.handleMouseDown, this);
		this.map.on('boxzoomend', this.setStateOff, this);
		this.map.on('mousedown', this.getCoordinatesToAddAreaX, this);
		this.map.on('mouseup', this.getCoordinatesToAddAreaY, this);

	},

	setStateOff: function() {
		L.DomUtil.removeClass(this.controlDiv, 'leaflet-control-mapPrint-active');
		this.active = false;
		this.map.off('mousedown', this.handleMouseDown, this);
		this.map.off('mousedown', this.getCoordinatesToAddAreaX, this);
		this.map.off('mouseup', this.getCoordinatesToAddAreaY, this);

		this.map.dragging.enable();
	},

	handleMouseDown: function(event) {

		this.map.boxZoom._onMouseDown.call(this.map.boxZoom, {
			clientX: event.originalEvent.clientX,
			clientY: event.originalEvent.clientY,
			which: 1,
			shiftKey: true
		});
	},

	getCoordinatesToAddAreaX: function(e) {
		this.corsOne = {
			lone: null,
			pone: null
		};
		this.corsOne.lone = e.latlng;
		this.corsOne.pone = e.layerPoint;
	},

	getCoordinatesToAddAreaY: function(e) {
		this.corsTwo = {
			ltwo: null,
			ptwo: null
		};
		this.corsTwo.ltwo = e.latlng;
		this.corsTwo.ptwo = e.layerPoint;
		this.drawPNGFile();
	},

	creatButtonAndAreaPackage: function() {
		var d = document.createElement('div');
		d.id = "map-print-container";
		d.setAttribute('class', 'map-print-container');
		document.body.appendChild(d);

		$(d).append('<button id="zoomDown"  class="btn btn-default btn-sm text-center" title="Уменьшить коэффициент масштабирования карты">-</button>');
		$(d).append('<input id="zoomInput" class="zoomInput" title="Коэффициент масштабирования карты" maxlength="2" value="10"/>');
		$(d).append('<button id="zoomUp" class="btn btn-default btn-sm text-center" title="Увеличить коэффициент масштабирования карты">+</button>');
		$(d).append('<button id="currentZoom" class="btn btn-default btn-sm text-center" title="Установить видимый коэффициент масштабирования карты">!</button>');
		$(d).append('<button id="print" class="btn btn-default btn-sm text-center" title="Экспорт" value="Экспорт">Экспорт</button>');
		$(d).append('<button id="remove" class="btn btn-default btn-sm text-center" title="Cбросить выбор территории" value="Отмена">Отмена</button>');

		var that = this;
		$("#remove").click(function(e) {
			d.remove();
			that.map.areaSelect.off("change", that._resetChange, that);
			that.map.off('zoomend', that._zoomBack, that);
			that.map.areaSelect.remove();
		});

		$("#zoomUp").click(function() {
			var value = parseInt(document.getElementById('zoomInput').value);
			value = isNaN(value) ? 1 : value;
			value++;
			if (value > 18) {
				return value = 18
			}
			document.getElementById('zoomInput').value = value;
			$('#zoomInput').trigger('valuechanged');
		});
		$("#zoomDown").click(function() {
			var value = parseInt(document.getElementById('zoomInput').value);
			value = isNaN(value) ? 1 : value;
			value--;
			if (value < 0) {
				return value = 0
			}
			document.getElementById('zoomInput').value = value;
			$('#zoomInput').trigger('valuechanged');
		});
		$("#currentZoom").click(function() {
			document.getElementById('zoomInput').value = that.map.getZoom();
			$('#zoomInput').trigger('valuechanged');
		});
		$('#zoomInput').bind('valuechanged', function() {
			that.getFutureSize();
			that.alertDiv();
		});
		return d;
	},
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	getFutureSize: function() {
		var futureCenter = this.map.getCenter();
		var northEastToGetFutureSizeAtCurrentZoom = this.map.getPixelBounds(this.map.areaSelect.getBounds()._northEast, document.getElementById('zoomInput').value);
		var southWestToGetFutureSizeAtCurrentZoom = this.map.getPixelBounds(this.map.areaSelect.getBounds()._southWest, document.getElementById('zoomInput').value);
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
		this.map.areaSelect.futureSize = {
			width: futureCanvasWidth,
			height: futureCanvasHight,
			center: futureCenter
		};
	},

	alertDiv: function() {
		var colorScheme;
		this.map.areaSelect.size = this.map.areaSelect.futureSize.width * this.map.areaSelect.futureSize.height;

		function colorSchemeGrey() {
			$('#zoomInput').css("color", "rgba(68,68,68,1)");
			$('#zoomInput').css("text-shadow", "1px 1px 0 rgba(255,255,255,0.66)");
		};

		function colorSchemeWhite() {
			$('#zoomInput').css("color", "rgba(255,255,255,1)");
			$('#zoomInput').css("text-shadow", "1px 1px 0 rgba(68,68,68,0.66)");
		};

		if (this.map.areaSelect.size <= 400000) {
			colorScheme = "#3CFF00";
			colorSchemeGrey()
		} else if (this.map.areaSelect.size > 400000 && this.map.areaSelect.size <= 600000) {
			colorScheme = "#A2FF00";
			colorSchemeGrey()
		} else if (this.map.areaSelect.size > 600000 && this.map.areaSelect.size <= 1020000) {
			colorScheme = "#CDFF00";
			colorSchemeGrey()
		} else if (this.map.areaSelect.size > 1020000 && this.map.areaSelect.size <= 1400000) {
			colorScheme = "#E6FF00";
			colorSchemeGrey()
		} else if (this.map.areaSelect.size > 1400000 && this.map.areaSelect.size <= 2000000) {
			colorScheme = "#E7FF00";
			colorSchemeGrey()
		} else if (this.map.areaSelect.size > 2000000 && this.map.areaSelect.size <= 2430000) {
			colorScheme = "#FFD500";
			colorSchemeGrey()
		} else if (this.map.areaSelect.size > 2430000 && this.map.areaSelect.size <= 3500000) {
			colorScheme = "#FFAB00";
			colorSchemeGrey()
		} else if (this.map.areaSelect.size > 3500000 && this.map.areaSelect.size <= 4680000) {
			colorScheme = "#FF8000";
			colorSchemeWhite()
		} else if (this.map.areaSelect.size > 4680000 && this.map.areaSelect.size <= 6300000) {
			colorScheme = "#FF4D00";
			colorSchemeWhite()
		} else if (this.map.areaSelect.size > 6300000 && this.map.areaSelect.size <= 8000000) {
			colorScheme = "#FF3300";
			colorSchemeWhite()
		} else if (this.map.areaSelect.size > 8000000) {
			colorScheme = "#FF0000";
			colorSchemeWhite()
		};
		$('#zoomInput').css("background-color", colorScheme);
		$('#zoomInput:before').css("border-bottom-color", colorScheme);
	},
	_zoomBack: function(e) {
		this.map.setView(this.map.getCenter(), this.ZZoom);
	},
	_resetChange: function(e) {
		this.getFutureSize();
		this.alertDiv();
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	drawPNGFile: function() {
		var corsOne = this.corsOne;
		var corsTwo = this.corsTwo;
		var cords = {
			lone: corsOne.lone,
			pone: corsOne.pone,
			ltwo: corsTwo.ltwo,
			ptwo: corsTwo.ptwo
		};
		var bounds = [];
		//перестраивание координат для формирование BBox
		if (cords.pone.x < cords.ptwo.x && cords.pone.y > cords.ptwo.y) {
			bounds = [
				[cords.pone.x, cords.ptwo.y],
				[cords.ptwo.x, cords.pone.y]
			];
		} else if (cords.pone.x < cords.ptwo.x && cords.pone.y < cords.ptwo.y) {
			bounds = [
				[cords.pone.x, cords.pone.y],
				[cords.ptwo.x, cords.ptwo.y]
			];
		} else if (cords.pone.x > cords.ptwo.x && cords.pone.y < cords.ptwo.y) {
			bounds = [
				[cords.ptwo.x, cords.pone.y],
				[cords.pone.x, cords.ptwo.y]
			];
		} else if (cords.pone.x > cords.ptwo.x && cords.pone.y > cords.ptwo.y) {
			bounds = [
				[cords.ptwo.x, cords.ptwo.y],
				[cords.pone.x, cords.pone.y]
			];
		};
		var areaWidth = bounds[1][0] - bounds[0][0];
		var areaHight = bounds[1][1] - bounds[0][1];

		this.map.areaSelect = L.areaSelect({
			width: areaWidth,
			height: areaHight
		}).addTo(this.map);
		//запоминаем размер и зум карты для восстановления изначального вида
		this.ZZoom = this.map.getZoom();
		//создаем панель с кнопками
		//this.creatButtonAndAreaPackage();
		//восстанавливаем зум первоначальный из-за использования выбора территории путем аналога Shift+мышь
		//(он же зум через выбор территории)
		this.map.once('zoomend', this._zoomBack, this);
		this.map.areaSelect.on("change", this._resetChange, this);
		var that = this;

		$("#print").click(function() {
			$("#map-print-container").append('<div id="loader-wrapper"/>');
			$("#loader-wrapper").append('<div id="loader"/>');
			$(".leaflet-control-container, #map-print-container").attr("data-html2canvas-ignore", "true");
			that.map.areaSelect.off("change", that._resetChange, that);
			$(that.map.getContainer()).height(that.map.areaSelect.futureSize.height).width(that.map.areaSelect.futureSize.width);
			that.map.setView(that.map.areaSelect.futureSize.center, document.getElementById('zoomInput').value);
			that.map.areaSelect.remove();
			that.map.invalidateSize(true);

			var timer, backTimer;
			if (that.map.areaSelect.size > 0 && that.map.areaSelect.size <= 1400000) {
				timer = 6000;
				backTimer = 12000
			} else if (that.map.areaSelect.size > 1400000 && that.map.areaSelect.size <= 2430000) {
				timer = 8000;
				backTimer = 15000
			} else if (that.map.areaSelect.size > 2430000 && that.map.areaSelect.size <= 4680000) {
				timer = 11000;
				backTimer = 19000
			} else if (that.map.areaSelect.size > 4680000 && that.map.areaSelect.size <= 6300000) {
				timer = 14000;
				backTimer = 21000
			} else if (that.map.areaSelect.size > 6300000 && that.map.areaSelect.size <= 8000000) {
				timer = 16000;
				backTimer = 24000
			} else if (that.map.areaSelect.size > 8000000) {
				timer = 20000;
				backTimer = 40000
			};

			setTimeout(function() {
				$(".leaflet-control-container").attr("data-html2canvas-ignore", "true");
				//подготовка зума
				//формирование канваса и свг для передачи в canvg
				
				var svgE = $(that.map.getContainer()).find('svg');
												
				if (svgE.length > 0) {
					var canvas, xml;
					canvas = document.createElement("canvas");
					canvas.className = "screenShotTempCanvas";
					$(canvas).attr("id", "canvas1");
					var translate = svgE[0].getAttribute("style");
					$(canvas).attr("style", translate);
					var viewBox = svgE[0].getAttribute("viewBox");
					$(canvas).attr("viewBox", viewBox);
					canvas.style.position = "absolute";
				}


				//подготовка пана карты
				var mapPane = $(".leaflet-map-pane")[0];
				var mapTransform = mapPane.style.transform.split(",");
				var mapX = parseFloat(mapTransform[0].split("(")[1].replace("px", ""));
				var mapY = parseFloat(mapTransform[1].replace("px", ""));
				mapPane.style.transform = "";
				mapPane.style.left = mapX + "px";
				mapPane.style.top = mapY + "px";
				//подготовка тайлов
				var myTiles = $("img.leaflet-tile");
				var tilesLeft = [];
				var tilesTop = [];
				var tileMethod = [];
				for (var i = 0; i < myTiles.length; i++) {
					if (myTiles[i].style.left != "") {
						tilesLeft.push(parseFloat(myTiles[i].style.left.replace("px", "")));
						tilesTop.push(parseFloat(myTiles[i].style.top.replace("px", "")));
						tileMethod[i] = "left";
					} else if (myTiles[i].style.transform != "") {
						var tileTransform = myTiles[i].style.transform.split(",");
						tilesLeft[i] = parseFloat(tileTransform[0].split("(")[1].replace("px", ""));
						tilesTop[i] = parseFloat(tileTransform[1].replace("px", ""));
						myTiles[i].style.transform = "";
						tileMethod[i] = "transform";
					} else {
						tilesLeft[i] = 0;
						tilesRight[i] = 0;
						tileMethod[i] = "neither";
					};
					myTiles[i].style.left = (tilesLeft[i]) + "px";
					myTiles[i].style.top = (tilesTop[i]) + "px";
				};

				if (svgE.length > 0) {
					//подготовка свг
					var svgElements = $(that.map.getContainer()).find('svg')[0];
					var svgElementsTransform = svgElements.style.transform.split(",");
					var svgElementsX = parseFloat(svgElementsTransform[0].split("(")[1].replace("px", ""));
					var svgElementsY = parseFloat(svgElementsTransform[1].replace("px", ""));
					svgElements.style.transform = "";
					svgElements.style.left = svgElementsX + "px";
					svgElements.style.top = svgElementsY + "px";

					//создание канваса из свг
					svgE.each(function() {
						L.DomUtil.getPosition(svgE);
						xml = new XMLSerializer().serializeToString(this);
						canvg(canvas, xml);
						$(canvas).insertBefore(this);
						$(this).attr('class', 'tempHide').attr("id", "chtoto").hide();
					});
					//подготовка канваса
					var canas =$(that.map.getContainer()).find('canvas')[0];
					var canasTransform = canas.style.transform.split(",");
					var canasX = parseFloat(canasTransform[0].split("(")[1].replace("px", ""));
					var canasY = parseFloat(canasTransform[1].replace("px", ""));
					canas.style.transform = "";
					canas.style.left = canasX + "px";
					canas.style.top = canasY + "px";
				}
				//в пнг
				html2canvas(that.map.getContainer(), {
					allowTaint: false,
					logging: false,
					taintTest: false,
					useCORS: true,
					onrendered: function(canvas) {
						var myImage = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
						var link = document.createElement('a');
						if (link.download !== undefined) {
							link.download = "mapexport.png";
							link.href = myImage;
							document.body.appendChild(link);
							$(link).css("display", "none");
							link.click();
							document.body.removeChild(link);
						} else {
							alert('Скачивание поддерживается только в браузерах Chrome, Firefox и Opera')
						};
					}
				});
				//возвращение настроек карты
				for (var i = 0; i < myTiles.length; i++) {
					if (tileMethod[i] == "left") {
						myTiles[i].style.left = (tilesLeft[i]) + "px";
						myTiles[i].style.top = (tilesTop[i]) + "px";
					} else if (tileMethod[i] == "transform") {
						myTiles[i].style.left = "";
						myTiles[i].style.top = "";
						myTiles[i].style.transform = "translate(" + tilesLeft[i] + "px, " + tilesTop[i] + "px)";
					} else {
						myTiles[i].style.left = "0px";
						myTiles[i].style.top = "0px";
						myTiles[i].style.transform = "translate(0px, 0px)";
					};
				};
				if (svgE.length > 0) {
					svgElements.style.transform = "translate(" + (svgElementsX) + "px," + (svgElementsY) + "px, 0px)";
					svgElements.style.left = "";
					svgElements.style.top = "";
				}
				mapPane.style.transform = "translate(" + (mapX) + "px," + (mapY) + "px, 0px)";
				mapPane.style.left = "";
				mapPane.style.top = "";

			}, timer);
			setTimeout(function() {
				$(that.map.getContainer()).find("#canvas1").remove();
				$("#loader-wrapper").remove();
				$(that.map.getContainer()).find('#chtoto').show().removeClass('tempHide');
				$("[class^='Labels']").remove();
				$("#map-print-container").remove();
				$(that.map.getContainer()).height("100%").width("100%");
				that.map.setView(that.map.areaSelect.futureSize.center, that.ZZoom);
				that.map.invalidateSize(true);
			}, backTimer)

		});
	},
});
L.Control.mapPrint = function(options) {
	return new L.Control.MapPrint(options);
}