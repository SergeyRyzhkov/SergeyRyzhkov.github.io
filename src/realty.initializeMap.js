/* jshint ignore:start */
function InitializeMap(mapDiv) {
	//window.SITE_ROOT = "http://vm2012iis/vdkcr";
	//window.SITE_ROOT = "";
	//MapExpress.Mapping.MapInitializerHelper.initializeFromURL(mapDiv, window.SITE_ROOT + "vdk_map_model.json", onWorkspaceLoaded);
	MapExpress.Mapping.MapInitializerHelper.initializeFromURL(mapDiv,  "map_model.json", onWorkspaceLoaded);
}
/* jshint ignore:end */

function onWorkspaceLoaded() {

	var mapManager = window.MapManager;
	var map = window.MapManager._map;

	map.addControl(createSearchToolbar());
	map.addControl(createStandartToolbar());

	replaceRosreestrIdentifyFunc();

	L.control.zoom({
		position: 'topleft'
	}).addTo(map);

	L.control.scale().addTo(map, {
		imperial: false
	});
}


function createSearchToolbar() {
	var mapManager = window.MapManager;
	var toolbar = new MapExpress.Tools.MapToolbar(mapManager, {
		position: 'topleft'
	});
	toolbar.addCommand(new MapExpress.Tools.ShowLayerControlMapCommandExt(mapManager));
	toolbar.addControlFromTemplate("./templates/realtySearch.html", "searchId");
	return toolbar;
}

function createStandartToolbar() {
	var mapManager = window.MapManager;
	var toolbar = new MapExpress.Tools.MapToolbar(mapManager, {
		position: 'topright'
	});


	toolbar.addCommand(new MapExpress.Tools.IdentifyMapCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.LineMeasureCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.SqrtMeasureCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.ActiveViewMapExportCommand(mapManager));
	toolbar.addCommand(new MapExpress.Tools.SelectorBaseMapsCommand(mapManager));
	return toolbar;
}


MapExpress.Tools.ShowLayerControlMapCommandExt = MapExpress.Tools.ShowLayerControlMapCommand.extend({

	createContent: function(toolBarContainer) {
		var button = MapExpress.Tools.ShowLayerControlMapCommand.prototype.createContent.call(this, toolBarContainer);
		L.DomUtil.create('span', 'divider1', toolBarContainer);
		return button;
	}
});

function replaceRosreestrIdentifyFunc() {
	var rosreestrLayers = window.MapManager.getMapModel().getLayersByOptionValue("displayName", "Публичная кадастровая карта");
	if (rosreestrLayers && rosreestrLayers.length > 0) {
		var allLayers = [];
		window.MapManager.getMapModel()._fillAllLayers(rosreestrLayers[0], allLayers);
		for (var i = 0; i < allLayers.length; i++) {
			var iterLayer = allLayers[i];
			if (iterLayer.mapLayer && iterLayer.mapLayer._dataPovider) {
				if (iterLayer.options.displayName === "Земельные участки") {
					iterLayer.mapLayer._dataPovider.getFeatureInfoAsync = zuIdentitfyFunc;
					continue;
				}
				if (iterLayer.options.displayName === "ОКС") {
					iterLayer.mapLayer._dataPovider.getFeatureInfoAsync = oksIdentitfyFunc;
					continue;
				}
				iterLayer.mapLayer._dataPovider.getFeatureInfoAsync = empyIdentitfyFunc;
			}
		}
	}

	function empyIdentitfyFunc(latlng, layerPoint, mapBounds, mapSize, mapZoom) {
		return null;
	}

	function zuIdentitfyFunc(latlng, layerPoint, mapBounds, mapSize, mapZoom) {
		return MapExpress.Utils.CadastreUtils.getObjectGeoJSONByLatLngAsyn(latlng, MapExpress.Utils.CadastreUtils.cadastreObjectType.PARCEL);
	}

	function oksIdentitfyFunc(latlng, layerPoint, mapBounds, mapSize, mapZoom) {
		return MapExpress.Utils.CadastreUtils.getObjectGeoJSONByLatLngAsyn(latlng, MapExpress.Utils.CadastreUtils.cadastreObjectType.OKS);
	}
}