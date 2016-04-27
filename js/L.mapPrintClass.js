L.MapPrint = L.Class.extend({

	exportActiveMapView: function(map) {
		var mapSize = map.getSize();
		var width = mapSize.x;
		var height = mapSize.y;
		var size = width * height;
		var zoom = map.getZoom();
		this.export(map, width, height, zoom, size);
	},


	export: function(map, exportMapWidth, exportMapHeight, exportMapZoom, exportMapPixelSize) {
		//
		//exportMapWidth, exportMapHeight - при изменении зума и размера карты необходимо заранее высчитать размер будущей карты
		//exportMapZoom - зум экспортируемой карты
		//exportMapPixelSize - размер экспортируемой карты , необходим для формирования таймера для полной прогрузки тайлов
		//
		this.map = map;
		map.fireEvent('mapexport:export:start', this);
		//запоминаем размер и зум карты для восстановления изначального вида
		var prevHeight = $(map.getContainer()).height();
		var prevWidth = $(map.getContainer()).width();
		var prevZoom = map.getZoom();
		var prevCenter = map.getCenter();
		var prevMinHeight = $(map.getContainer()).css("min-height");
		$(map.getContainer()).css("min-height", "0%");
		$(map.getContainer()).height(exportMapHeight).width(exportMapWidth);

		map.invalidateSize(true);
		map.setView(prevCenter, exportMapZoom);

		var timer;
		if (exportMapPixelSize > 0 && exportMapPixelSize <= 1400000) {
			timer = 6000;
		} else if (exportMapPixelSize > 1400000 && exportMapPixelSize <= 2430000) {
			timer = 8000;
		} else if (exportMapPixelSize > 2430000 && exportMapPixelSize <= 4680000) {
			timer = 11000;
		} else if (exportMapPixelSize > 4680000 && exportMapPixelSize <= 6300000) {
			timer = 14000;
		} else if (exportMapPixelSize > 6300000 && exportMapPixelSize <= 8000000) {
			timer = 16000;
		} else if (exportMapPixelSize > 8000000) {
			timer = 20000;
		}

		var that = this;
		setTimeout(function() {

			that._prepareExport(map);
			setTimeout(function() {
				that._html2Canvas(map, prevHeight, prevWidth, prevZoom, prevCenter, prevMinHeight);
			}, 1000);
		}, timer);
	},

	_prepareExport: function(map) {
		map.fireEvent('mapexport:prepareexport:start', this);
		var exportStorage = {};
		//формирование канваса и свг для передачи в canvg
		var svgE = $(map.getContainer()).find('leaflet-overlay-pane').find('svg');
		var canvas, xml;
		if (svgE && svgE[0]) {
			canvas = document.createElement("canvas");
			canvas.className = "screenShotTempCanvas";
			$(canvas).attr("id", "SvgToCanvas");
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
		
		//запоминаем для пана настройки
		exportStorage.mapPane = mapPane;
		exportStorage.mapX = mapX;
		exportStorage.mapY = mapY;

		//подготовка оверлеев
		if ($("img.leaflet-image-layer")[0] !== undefined) {
			var mapImageOverlay = $("img.leaflet-image-layer");
			var mapImageOverlayLeft = [];
			var mapImageOverlayTop = [];
			var mapImageOverlayMethod = [];
			for (var i = 0; i < mapImageOverlay.length; i++) {
				if (mapImageOverlay[i].style.left !== "") {
					mapImageOverlayLeft.push(parseFloat(mapImageOverlay[i].style.left.replace("px", "")));
					mapImageOverlayTop.push(parseFloat(mapImageOverlay[i].style.top.replace("px", "")));
					mapImageOverlayMethod[i] = "left";
				} else if (mapImageOverlay[i].style.transform !== "") {
					var tileTransform = mapImageOverlay[i].style.transform.split(",");
					mapImageOverlayLeft[i] = parseFloat(tileTransform[0].split("(")[1].replace("px", ""));
					mapImageOverlayTop[i] = parseFloat(tileTransform[1].replace("px", ""));
					mapImageOverlay[i].style.transform = "";
					mapImageOverlayMethod[i] = "transform";
				} else {
					mapImageOverlayLeft[i] = 0;
					mapImageOverlayMethod[i] = "neither";
				}
				mapImageOverlay[i].style.left = (mapImageOverlayLeft[i]) + "px";
				mapImageOverlay[i].style.top = (mapImageOverlayTop[i]) + "px";
			}
			
			//запоминаем настройки для оверлеев
			exportStorage.mapImageOverlay = mapImageOverlay;
			exportStorage.mapImageOverlayLeft = mapImageOverlayLeft;
			exportStorage.mapImageOverlayTop = mapImageOverlayTop;
			exportStorage.mapImageOverlayMethod = mapImageOverlayMethod;
		}

		//подготовка тайлов
		if ($("img.leaflet-tile")[0] !== undefined) {
			var myTiles = $("img.leaflet-tile");
			var tilesLeft = [];
			var tilesTop = [];
			var tileMethod = [];
			for (var j = 0; j < myTiles.length; j++) {
				if (myTiles[j].style.left !== "") {
					tilesLeft.push(parseFloat(myTiles[j].style.left.replace("px", "")));
					tilesTop.push(parseFloat(myTiles[j].style.top.replace("px", "")));
					tileMethod[j] = "left";
				} else if (myTiles[j].style.transform !== "") {
					var tileTransform1 = myTiles[j].style.transform.split(",");
					tilesLeft[j] = parseFloat(tileTransform1[0].split("(")[1].replace("px", ""));
					tilesTop[j] = parseFloat(tileTransform1[1].replace("px", ""));
					myTiles[j].style.transform = "";
					tileMethod[j] = "transform";
				} else {
					tilesLeft[j] = 0;
					tileMethod[j] = "neither";
				}
				myTiles[j].style.left = (tilesLeft[j]) + "px";
				myTiles[j].style.top = (tilesTop[j]) + "px";
			}

			
			//запоминаем настройки для тайлов 
			exportStorage.myTiles = myTiles;
			exportStorage.tilesLeft = tilesLeft;
			exportStorage.tilesTop = tilesTop;
			exportStorage.tileMethod = tileMethod;
		}

		//подготовка Див-иконок
		if ($(".leaflet-marker-icon")[0] !== undefined) {
			var divicons = $(".leaflet-marker-icon");
			var dx = [];
			var dy = [];
			for (var k = 0; k < divicons.length; k++) {
				var curTransform = divicons[k].style.transform;
				var splitTransform = curTransform.split(",");
				dx.push(parseFloat(splitTransform[0].split("(")[1].replace("px", "")));
				dy.push(parseFloat(splitTransform[1].replace("px", "")));
				divicons[k].style.transform = "";
				divicons[k].style.left = dx[k] + "px";
				divicons[k].style.top = dy[k] + "px";
			}
			
			//запоминаем настройки для дивиконок
			exportStorage.divicons = divicons;
			exportStorage.dx = dx;
			exportStorage.dy = dy;
		}

		//подготовка свг
		if (svgE && svgE[0] !== undefined) {
			var svgElements = svgE[0];
			var svgElementsTransform = svgElements.style.transform.split(",");
			var svgElementsX = parseFloat(svgElementsTransform[0].split("(")[1].replace("px", ""));
			var svgElementsY = parseFloat(svgElementsTransform[1].replace("px", ""));
			svgElements.style.transform = "";
			svgElements.style.left = svgElementsX + "px";
			svgElements.style.top = svgElementsY + "px";
			//запоминаем для свг настройки
			exportStorage.svgElements = svgElements;
			exportStorage.svgElementsX = svgElementsX;
			exportStorage.svgElementsY = mapY;
		}

		//создание канваса из свг
		if (svgE && svgE[0] !== undefined) {
			svgE.each(function() {
				if (canvas) {
					L.DomUtil.getPosition(svgE);
					xml = new XMLSerializer().serializeToString(this);
					canvg(canvas, xml);
					$(canvas).insertBefore(this);
					$(this).attr('class', 'tempHide').attr("id", "TempSvgToHide").hide();
				}
			});
		}
		//подготовка канваса
		var findCanvas = $(map.getContainer()).find('canvas');
		if (findCanvas && findCanvas[0]) {
			var canas = findCanvas[0];
			var canasTransform = canas.style.transform.split(",");
			var canasX = parseFloat(canasTransform[0].split("(")[1].replace("px", ""));
			var canasY = parseFloat(canasTransform[1].replace("px", ""));
			canas.style.transform = "";
			canas.style.left = canasX + "px";
			canas.style.top = canasY + "px";
		}
		//запомнинаем настройки
		this.storage = exportStorage;
		map.fireEvent('mapexport:prepareexport:end', this);
	},

	_html2Canvas: function(map, prevHeight, prevWidth, prevZoom, prevCenter, prevMinHeight) {
		var that = this;
		var workMap = map;
		html2canvas($(map.getContainer()), {
			allowTaint: false,
			logging: false,
			taintTest: true,
			useCORS: true,
			onrendered: function(canvas) {
				that.map.fireEvent('mapexport:html2canvas:start', this);
				var extra_canvas = document.createElement("canvas");
				extra_canvas.setAttribute('width', canvas.width);
				extra_canvas.setAttribute('height', canvas.height);
				var ctx = extra_canvas.getContext('2d');
				ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
				var resultImage = extra_canvas.toDataURL("image/jpg");

				that._restoreObjects(workMap, prevHeight, prevWidth, prevZoom, prevCenter, prevMinHeight);
				
				var bbox = [workMap.getBounds()._northEast, workMap.getBounds()._southWest];
				var size = {};
				size.width = canvas.width;
				size.height = canvas.height;

				var result = {
					printer : this,
					image:resultImage,
					bbox:bbox,		
					imageSize:size			
				};
				that.map.fireEvent('mapexport:html2canvas:end', result);
			}
		});
	},

	_restoreObjects: function(map, prevHeight, prevWidth, prevZoom, prevCenter, prevMinHeight) {
		map.fireEvent('mapexport:restorestate:start', this);
		var storage = this.storage;
		//восстанавливаем пан
		storage.mapPane.style.transform = "translate(" + (storage.mapX) + "px," + (storage.mapY) + "px, 0px)";
		storage.mapPane.style.left = "";
		storage.mapPane.style.top = "";
		//восстанавливаем свг 
		if (storage.svgElements !== undefined) {
			storage.svgElements.style.transform = "translate(" + (storage.svgElementsX) + "px," + (storage.svgElementsY) + "px, 0px)";
			storage.svgElements.style.left = "";
			storage.svgElements.style.top = "";
		}
		//восстанавливаем Див-иконки
		if (storage.divicons !== undefined) {
			for (var i = 0; i < storage.divicons.length; i++) {
				storage.divicons[i].style.transform = "translate(" + storage.dx[i] + "px, " + storage.dy[i] + "px)";
				storage.divicons[i].style.left = "0px";
				storage.divicons[i].style.top = "0px";
			}
		}
		//восстанавливаем тайлы
		if (storage.myTiles !== undefined) {
			for (var t = 0; t < storage.myTiles.length; t++) {
				if (storage.tileMethod[t] === "left") {
					storage.myTiles[t].style.left = (storage.tilesLeft[t]) + "px";
					storage.myTiles[t].style.top = (storage.tilesTop[t]) + "px";
				} else if (storage.tileMethod[t] === "transform") {
					storage.myTiles[t].style.left = "";
					storage.myTiles[t].style.top = "";
					storage.myTiles[t].style.transform = "translate(" + storage.tilesLeft[t] + "px, " + storage.tilesTop[t] + "px)";
				} else {
					storage.myTiles[t].style.left = "0px";
					storage.myTiles[t].style.top = "0px";
					storage.myTiles[t].style.transform = "translate(0px, 0px)";
				}
			}
		}

		//восстанавливаем оверлеи
		if (storage.mapImageOverlay !== undefined) {
			for (var m = 0; m < storage.mapImageOverlay.length; m++) {
				if (storage.mapImageOverlayMethod[m] === "left") {
					storage.mapImageOverlay[m].style.left = (storage.mapImageOverlayLeft[m]) + "px";
					storage.mapImageOverlay[m].style.top = (storage.mapImageOverlayTop[m]) + "px";
				} else if (storage.mapImageOverlayMethod[m] === "transform") {
					storage.mapImageOverlay[m].style.left = "";
					storage.mapImageOverlay[m].style.top = "";
					storage.mapImageOverlay[m].style.transform = "translate(" + storage.mapImageOverlayLeft[m] + "px, " + storage.mapImageOverlayTop[m] + "px)";
				} else {
					storage.mapImageOverlay[m].style.left = "0px";
					storage.mapImageOverlay[m].style.top = "0px";
					storage.mapImageOverlay[m].style.transform = "translate(0px, 0px)";
				}
			}
		}
		delete this.storage;

		$(map.getContainer()).height(prevHeight).width(prevWidth);
		$(map.getContainer()).css("min-height", prevMinHeight);
		map.setView(prevCenter, prevZoom);
		map.invalidateSize(true);

		$(map.getContainer()).find("#SvgToCanvas").remove();
		$(map.getContainer()).find('#TempSvgToHide').show().removeClass('tempHide');
		$("[class^='Labels']").remove();
	},

});

L.mapPrint = function() {
	return new L.MapPrint();
};