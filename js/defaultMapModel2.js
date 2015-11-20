defaultMapModel = {

	"id": "vsm_map",
	"name": "Скоростные магистрали",
	"displayName": "Скоростные магистрали",
	"description": "Скоростные магистрали",
	"options": {
		"zoom": 5,
		"center": [56.13, 30],
		"zoomControl": false
	},

	"layers": [{
			"id": "OpenStreetMap",
			"name": "OpenStreetMap",
			"displayName": "OpenStreetMap",
			"description": "OpenStreetMap",
			"type": "base",
			"visible": true,
			"visibleIndex": 0,
			"minZoom": 0,
			"maxZoom": 23,
			"selectable": false,
			"queryable": false,

			"layerClass": {
				"constructor": "MapExpress.Layers.TileServiceLayer",
				"args": [

				],
				"options": {
					"attribution": "OpenStreetMap"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.TileProvider",
				"args": [
					"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				],
				"options": {}
			}
		}, {
			"id": "2ГИС",
			"name": "2ГИС",
			"displayName": "2ГИС",
			"description": "2ГИС",
			"type": "base",
			"visible": false,
			"visibleIndex": 0,
			"minZoom": 0,
			"maxZoom": 23,
			"selectable": false,
			"queryable": false,

			"layerClass": {
				"constructor": "MapExpress.Layers.TileServiceLayer",
				"args": [],
				"options": {
					"attribution": "2ГИС"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.TileProvider",
				"args": [
					"http://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1"
				],
				"options": {
					"subdomains": "123"
				}
			}
		},
		{
			"id": "Участки ВСМ",
			"name": "Участки ВСМ",
			"displayName": "Участки ВСМ",
			"description": "Участки ВСМ",
			"type": "overlay",
			"visible": true,
			"visibleIndex": 2,
			"minZoom": 0,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.GeoJSONServiceLayer",
				"args": [],
				"options": {
					"style": {
						"color": "blue",
						"weight": 2,
						"opacity": 0.5,
						"fillOpacity": 0.1
					}
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.GeoJSONProvider",
				"args": [
					"./data/geojson-sample.json"
				]
			}
		}, {
			"id": "Полоса отвода",
			"name": "Полоса отвода",
			"displayName": "Полоса отвода",
			"description": "Полоса отвода",
			"type": "overlay",
			"visible": true,
			"visibleIndex": 1,
			"minZoom": 0,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.GeoJSONServiceLayer",
				"args": [],
				"options": {
					"style": {
						"color": "green",
						"weight": 2,
						"opacity": 0.99,
						"fillOpacity": 0.99
					}
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.GeoJSONProvider",
				"args": [
					"./data/boundary_wgs.json"
				]
			}
		}, {
			"id": "Google",
			"name": "Google",
			"displayName": "Google",
			"description": "Google",
			"type": "base",
			"visible": false,
			"visibleIndex": 0,
			"minZoom": 0,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.TileServiceLayer",
				"args": [],
				"options": {
					"attribution": "Google"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.TileProvider",
				"args": [
					"https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
				]
			}
		}, {
			"id": "Bing",
			"name": "Bing",
			"displayName": "Bing",
			"description": "Bing",
			"type": "base",
			"visible": false,
			"visibleIndex": 0,
			"minZoom": 0,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.TileServiceLayer",
				"args": [],
				"options": {
					"attribution": "Bing"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.TileProvider",
				"args": [
					"http://ecn.t3.tiles.virtualearth.net/tiles/a{q}.jpeg?g=0&dir=dir_n"
				],
				"options": {
					"useQuadkey": true
				}
			}
		}

	]
}