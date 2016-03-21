function MapExpressAddBaseLayers() {


	var layerGroupModel = new MapExpress.Mapping.LayerModel("Базовые карты", {
		displayName: "Базовые карты"
	});
	window.MapManager.getMapModel().addLayer(layerGroupModel);

	var bases = window.MapManager.getMapModel().getBaseLayers();

	for (var i = bases.length - 1; i >= 0; i--) {
		var iterBase = bases[i];
		iterBase.allowAddToTree = true;
		layerGroupModel.addLayer(iterBase);
	}

};