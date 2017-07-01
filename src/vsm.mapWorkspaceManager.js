function VsmMapWorkspaceManager(onMapInitializedCallbak) {

	this.defaultMapModel = "map_model.json";
	this.getUrl = window.VSM_SITE_ROOT + "/Map/Map/MapWorkspaceList";
	this.updateUrl = window.VSM_SITE_ROOT + "/Map/Map/UpdateMapWorkspace";
	this.onMapInitializedCallbak = onMapInitializedCallbak;


	this.getWorkspaces = function() {
		return MapExpress.Utils.Promise.GetJSON(this.getUrl);
	};

	this.saveWorkspace = function(id, name, content) {
		var _data = {
			MAP_WORKSPACE_ID: id,
			MAP_WORKSPACE_NAME: name,
			MAP_WORKSPACE_BODY: content
		};
		$.ajax({
			type: "POST",
			url: this.updateUrl,
			data: _data
		});
	};

	this.loadWorkspace = function() {
		var that = this;
		this.getWorkspaces().then(
			function(data) {
				if (data && data.length > 0) {
					try {
						for (var i = data.length - 1; i >= 0; i--) {
							var iterData = data[i];
							try {
								var iterModel = JSON.parse(iterData.MAP_WORKSPACE_BODY);
								var modelId = window.MAP_WORKSPACE_ID ? window.MAP_WORKSPACE_ID : "16";
								if (iterModel && iterModel.id && iterModel.id.toString() === modelId) {
									window.MapManager.renderMap(iterModel);
									doOnMapInitializedCallbak();
									break;
								}
							} catch (exc) {
								//console.log(exc);
							}
						}
					} catch (exc) {
						//console.log(exc);
						//window.MapManager.renderMap(that.defaultMapModel);
						//that.doOnMapInitializedCallbak();
					}
				}
			},
			function(err) {
				//console.log(err);
				//window.MapManager.renderMap(that.defaultMapModel);
				//that.doOnMapInitializedCallbak();
			}
		);

		function doOnMapInitializedCallbak() {
			if (that.onMapInitializedCallbak && typeof(that.onMapInitializedCallbak) === "function") {
				that.onMapInitializedCallbak();
			}
		}
	};
}