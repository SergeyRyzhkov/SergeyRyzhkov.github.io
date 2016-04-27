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
		var printControl = new L.Control.MapPrintControl(this._mapManager._map);
		
		this.printWindow = new MapExpress.Controls.MapControl(this._mapManager._map, {
			position: "top",
			headerEnabled: true,
			footerEnabled: true,
			closeButtonEnabled: true,
			parentContainer: this._mapManager._map._controlContainer
		});
		this.printWindow.createControl();
		this.printWindow.setContent(printControl._createContent());
		this.printWindow.setHeaderContent("Экспорт карты в *.jpg и файл привязки");
		this.printWindow.setFooterContent("Выберите область и укажите масштабный уровень карты");
		this.printWindow.setControlStyle ({"margin-top":"10px"});
				
		printControl._setUpButtonHandlers();
		printControl._activateAreaSelect();
		
		this.printWindow.show();
		//далее вейт дилагог со сменой текста (по событиям)
		//далее октрыть контрол с двумя ссылками		

		this._mapManager._map.on("map-print-control:removed", this.onRemoved, this);
		this.printWindow.on("mapcontrol:remove:after",function(){
			printControl.remove();
			this.onRemoved;
		}, this);

		this._mapManager._map.on("mapexport:html2canvas:end", this.onExportEnd, this);

	},

	deactivate: function() {
		delete this.printWindow;
	},

	onRemoved: function() {
		this.printWindow.hide();
		this.deactivate();
	},
	
	onExportEnd :function(result) {
		
		this.onRemoved();	

		var imageLinkText = this._createLink("export.jpg",result.image,"Результат (export.jpg)");

		var wldHref = MapExpress.Mapping.MapUtils.generateWldFileHref(result.bbox, result.imageSize);
		var wldLinkText = this._createLink("export.wld",wldHref,"Файл привязки (export.wld)");
		
		resultControl = new MapExpress.Controls.MapControl(this._mapManager._map, {
			headerEnabled: true,
			closeButtonEnabled: true
		});
		resultControl.createControl();
		resultControl.setControlStyle ({"min-width":"250px"});
		resultControl.setContent(imageLinkText + "<br>" + wldLinkText);
		resultControl.setHeaderContent("Результат экспорта карты");
		resultControl.show();
		
	},

	_createLink : function (fileName, href, linkText) {
		var temp = document.createElement('div');
		var link = document.createElement('a');
		link.download = fileName;
		link.href = href;
		$(link).html(linkText);
		temp.appendChild(link);
		var text  = $(temp).html();
		$(temp).remove(); 
		return text;
	}	

});