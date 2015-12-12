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
		$(".leaflet-control-container").attr("data-html2canvas-ignore", "true");
		$(this.options.mapSelector).crossOrigin = 'anonymous';

		html2canvas($(this.options.mapSelector), {
			allowTaint: true,
			logging: false,
			taintTest: false,
			useCORS: true,
			onrendered: function(canvas) {
				canvas.crossOrigin = 'anonymous';
				var myImage = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
				myImage.crossOrigin = 'anonymous';
				var link = document.createElement('a');
				if (link.download !== undefined) {
					link.download = "map.png";
					link.href = myImage;
					document.body.appendChild(link);
					$(link).css("display", "none");
					link.click();
					document.body.removeChild(link);
				} else {
					alert('Экспорт поддерживается только в браузерах Chrome, Firefox и Opera')
				}
			}
		});
	}

});