function VsmPresentation() {

	var msk = [55.75222, 37.61556],
		vlad = [56.13655, 40.39658],
		nn = [56.32867, 44.00205],
		cheb = [56.13222, 47.25194],
		kaz = [55.78874, 49.12214];


	var mskM = new MapExpress.Styles.PulseMarker(msk, {
		iconSize: [16, 16],
		color: 'green',
		id:'mskM'
	});

	var vladM = new MapExpress.Styles.PulseMarker(vlad, {
		iconSize: [14, 14],
		color: 'blue',
		id:'vladM'
	});

	var nnM = new MapExpress.Styles.PulseMarker(nn, {
		iconSize: [14, 14],
		color: 'blue',
		id:'nnM'
	});

	var chebM = new MapExpress.Styles.PulseMarker(cheb, {
		iconSize: [14, 14],
		color: 'blue',
		id:'chebM'
	});

	var kazM = new MapExpress.Styles.PulseMarker(kaz, {
		iconSize: [16, 16],
		color: 'red',
		id:'kazM'
	});

	var lineOpt = {
		color: 'red',
		weight: 5
	};

	var route = L.featureGroup([
		mskM,
		L.polyline([msk, vlad], lineOpt),
		vladM,
		L.polyline([vlad, nn], lineOpt),
		nnM,
		L.polyline([nn, cheb], lineOpt),
		chebM,
		L.polyline([cheb, kaz], lineOpt),
		kazM
	]);

	route.setSnakingPause(700);
	route.setMap(MapManager._map);

	var ret = {

		toogle: function() {
			if (this.enabled) {
				MapManager._map.removeLayer(route);
				this.enabled = false;
			} else {
				this.start();
				this.enabled = true;
			}
		},

		start: function() {
			route.setSnakingPause(700);
			route.setMap(MapManager._map);
			MapManager._map.fitBounds(route.getBounds());
			route.snakeIn();
			//route.on('snakemarker', this.snakemarker.bind(this));
		},

		snakemarker: function(evnt) {
			$("#layerInfoTemplate").empty();
			$("#layerInfoTemplate").load("./templates/vsmPresentation.html", function() {
				var template = $.templates("#" + evnt.options.id);
				var content = template.render();
				$("#layerInfoTemplate").empty();
				var popup = L.popup({
						maxWidth: 550.5
							//,maxHeight: 600
					})
					.setLatLng(evnt._latlng)
					.setContent(content);
				//.openOn(MapManager._map);
				MapManager._map.addLayer(popup);
			});

		}
	}

	return ret;
};