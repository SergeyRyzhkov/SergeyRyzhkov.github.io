defaultMapModel = {

	"id": "vsm_map",
	"name": "Скоростные магистрали",
	"displayName": "Скоростные магистрали",
	"description": "Скоростные магистрали",
	"options": {
		"zoom": 4,
		"center": [56.13, 30],
		"zoomControl": false,
		"minZoom": 0,
		"maxZoom": 23
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
		}, {
			"id": "rosreestrGkn",
			"name": "Росреестр РФ ГКН",
			"displayName": "Росреестр РФ ГКН",
			"description": "Росреестр РФ ГКН",
			"type": "overlay",
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
					"attribution": "Росреестр РФ"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.MapServiceAgsProvider",
				"args": [
					"http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer"
				],
				"options": {
					"identifyLayersId": "0,1",
					"identifyUrl": "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer"
				}
			}
		}, {
			"id": "zouit",
			"name": "ЗОУИТ ГКН",
			"displayName": "ЗОУИТ ГКН",
			"description": "ЗОУИТ ГКН",
			"type": "overlay",
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
					"attribution": "Росреестр РФ"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.MapServiceAgsProvider",
				"args": [
					"http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/ZOUIT/MapServer"
				],
				"options": {
					"identifyLayersId": "0",
					"identifyUrl": "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/ZOUIT/MapServer"
				}
			}
		}, {
			"id": "borderGkn",
			"name": "Границы ГКН",
			"displayName": "Границы ГКН",
			"description": "Границы ГКН",
			"type": "overlay",
			"visible": false,
			"visibleIndex": 2,
			"minZoom": 0,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.TileServiceLayer",
				"args": [],
				"options": {
					"attribution": "Росреестр РФ"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.MapServiceAgsProvider",
				"args": [
					"http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/BordersGKNSelected/MapServer"
				],
				"options": {
					"identifyLayersId": "7,8,9,10.11,12,13,14,15,16,17,18",
					"identifyUrl": "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/BordersGKNSelected/MapServer"
				}
			}
		},

		{
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