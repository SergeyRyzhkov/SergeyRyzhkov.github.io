defaultMapModel = {

	"id": "vsm_map",
	"name": "Скоростные магистрали",
	"displayName": "Скоростные магистрали",
	"description": "Скоростные магистрали",
	"options": {
		"zoom": 8,
		"center": [55.75222, 37.61556],
		"zoomControl": false,
		"minZoom": 0,
		"maxZoom": 21
	},

	"layersGroup" :[
		
	],


	"layers": [{
			"id": "OpenStreetMap",
			"name": "OpenStreetMap",
			"displayName": "OpenStreetMap",
			"description": "OpenStreetMap",
			"type": "base",
			"visible": true,
			"visibleIndex": 0,
			"minZoom": 0,
			"maxZoom": 21,
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
		},

		{
			"id": "2ГИС",
			"name": "2ГИС",
			"displayName": "2ГИС",
			"description": "Данные предоставлены 2ГИС",
			"type": "base",
			"visible": false,
			"visibleIndex": 0,
			"minZoom": 0,
			"maxZoom": 21,
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
			"id": "rosreestrBaseMap",
			"name": "rosreestrBaseMap",
			"displayName": "Росреестр",
			"description": "rosreestrBaseMap",
			"type": "base",
			"visible": false,
			"visibleIndex": 2,
			"minZoom": 0,
			"maxZoom": 21,
			"selectable": false,
			"queryable": false,

			"layerClass": {
				"constructor": "MapExpress.Layers.TileServiceLayer",
				"args": [

				],
				"options": {
					"attribution": "Росреестр"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.MapServiceAgsProvider",
				"args": [
					"http://maps.rosreestr.ru/arcgis/rest/services/BaseMaps/BaseMap/MapServer"
				],
				"options": {}
			}
		}, {
			"id": "navioniks",
			"name": "navioniks",
			"displayName": "Навионикс",
			"description": "navioniks",
			"type": "base",
			"visible": false,
			"visibleIndex": 2,
			"minZoom": 0,
			"maxZoom": 21,
			"selectable": false,
			"queryable": false,

			"layerClass": {
				"constructor": "MapExpress.Layers.TileServiceLayer",
				"args": [

				],
				"options": {
					"attribution": "navioniks"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.TileProvider",
				"args": [
					"http://backend.navionics.io/tile/{z}/{x}/{y}?LAYERS=config_1_1_0&TRANSPARENT=TRUE&navtoken=TmF2aW9uaWNzX2ludGVybmFscHVycG9zZV8wMDAwMSt3ZWJhcGl2Mi5uYXZpb25pY3MuY29t"
				],
				"options": {}
			}
		},

		{
			"id": "mapBox",
			"name": "MapBox",
			"displayName": "MapBox",
			"description": "MapBox",
			"type": "base",
			"visible": false,
			"visibleIndex": 2,
			"minZoom": 0,
			"maxZoom": 21,
			"selectable": false,
			"queryable": false,

			"layerClass": {
				"constructor": "MapExpress.Layers.TileServiceLayer",
				"args": [

				],
				"options": {
					"attribution": "MapBox"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.TileProvider",
				"args": [
					"http://{s}.tiles.mapbox.com/v4/unepwcmc.l8gj1ihl/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidW5lcHdjbWMiLCJhIjoiRXg1RERWRSJ9.taTsSWwtAfFX_HMVGo2Cug"
				],
				"options": {}
			}
		},

		{
			"id": "wpda",
			"name": "DB on Protected Areas",
			"displayName": "DB on Protected Areas",
			"description": "DB on Protected Areas",
			"type": "overlay",
			"visible": false,
			"visibleIndex": 5,
			"minZoom": 0,
			"maxZoom": 21,
			"selectable": true,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.TileServiceLayer",
				"args": [

				],
				"options": {
					"attribution": "WPDA"
				}
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.MapServiceAgsProvider",
				"args": [
					"http://ec2-54-204-216-109.compute-1.amazonaws.com:6080/arcgis/rest/services/wdpa/wdpa/MapServer"
				],
				"options": {}
			}
		},


		{
			"id": "rosreestrGkn",
			"name": "Росреестр РФ ГКН",
			"displayName": "Росреестр РФ ГКН",
			"description": "Росреестр РФ ГКН",
			"type": "overlay",
			"visible": false,
			"visibleIndex": 1,
			"minZoom": 0,
			"maxZoom": 21,
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
			"visibleIndex": 1,
			"minZoom": 0,
			"maxZoom": 21,
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
			"id": "terrzone",
			"name": "Тер.зоны ГКН",
			"displayName": "Тер.зоны ГКН",
			"description": "Тер.зоны ГКН",
			"type": "overlay",
			"visible": false,
			"visibleIndex": 1,
			"minZoom": 0,
			"maxZoom": 21,
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
					"http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/TERRSelected/MapServer"
				],
				"options": {
					"identifyLayersId": "0",
					"identifyUrl": "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/TERRSelected/MapServer"
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
			"maxZoom": 21,
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
		}, {
			"id": "borderRf",
			"name": "Адм.деление РФ",
			"displayName": "Адм.деление РФ",
			"description": "Адм.деление РФ",
			"type": "overlay",
			"visible": false,
			"visibleIndex": 1,
			"minZoom": 0,
			"maxZoom": 21,
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
					"http://maps.rosreestr.ru/arcgis/rest/services/Address/AddressSelected/MapServer"
				],
				"options": {
					"identifyLayersId": "0,1,2,3",
					"identifyUrl": "http://maps.rosreestr.ru/arcgis/rest/services/Address/AddressSelected/MapServer"
				}
			}
		}, {
			"id": "vsmParcels",
			"name": "Участки ВСМ",
			"displayName": "Участки ВСМ",
			"description": "Участки ВСМ",
			"type": "overlay",
			"visible": true,
			"visibleIndex": 0,
			"minZoom": 6,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.GeoJSONServiceLayer",
				"args": [{
					"useVectorTile": false,
					"replaceDataOnReset": true,
					"style": {
						"weight": 2,
						"color": "#009999",
						"fillOpacity": 0.2,
						"fillColor": "#006633"
					}
				}]
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.GeoJSONProvider",
				"args": [
					"http://vm2012iis/vsm_site/Map/Map/GeoJsonData/?view=vsm.land_geo_object_view_1&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}"
				]
			}
		},

		{
			"id": "land_thematic_event_kind_view",
			"name": "Дней до завершения",
			"displayName": "Наличие мероприятий",
			"description": "Наличие мероприятий",
			"type": "thematic",
			"visible": false,
			"visibleIndex": 1,
			"minZoom": 6,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.GeoJSONServiceLayer",
				"args": [{
					"useVectorTile": false,
					"replaceDataOnReset": true
				}]
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.GeoJSONProvider",
				"args": [
					"http://vm2012iis/vsm_site/Map/Map/GeoJsonData/?view=vsm.land_thematic_event_kind_view&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}"
				]
			}
		}, {
			"id": "land_thematic_day_control_view",
			"name": "Дней до завершения",
			"displayName": "Дней до завершения",
			"description": "Дней до завершения",
			"type": "thematic",
			"visible": false,
			"visibleIndex": 1,
			"minZoom": 6,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.GeoJSONServiceLayer",
				"args": [{
					"useVectorTile": false,
					"replaceDataOnReset": true
				}]
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.GeoJSONProvider",
				"args": [
					"http://vm2012iis/vsm_site/Map/Map/GeoJsonData/?view=vsm.land_thematic_day_control_view&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}"
				]
			}
		},

		{
			"id": "land_thematic_base_plan_view",
			"name": "Сроки исполнения (БП)",
			"displayName": "Сроки исполнения (БП)",
			"description": "Сроки исполнения (БП)",
			"type": "thematic",
			"visible": false,
			"visibleIndex": 1,
			"minZoom": 6,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.GeoJSONServiceLayer",
				"args": [{
					"useVectorTile": false,
					"replaceDataOnReset": true
				}]
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.GeoJSONProvider",
				"args": [
					"http://vm2012iis/vsm_site/Map/Map/GeoJsonData/?view=vsm.land_thematic_base_plan_view&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}"
				]
			}
		},

		{
			"id": "land_thematic_status_view",
			"name": "Статус участка",
			"displayName": "Статус участка",
			"description": "Статус участка",
			"type": "thematic",
			"visible": false,
			"visibleIndex": 1,
			"minZoom": 6,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.GeoJSONServiceLayer",
				"args": [{
					"useVectorTile": false,
					"replaceDataOnReset": true
				}]
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.GeoJSONProvider",
				"args": [
					"http://vm2012iis/vsm_site/Map/Map/GeoJsonData/?view=vsm.land_thematic_status_view&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}"
				]
			}
		},

		{
			"id": "land_thematic_work_type_view",
			"name": "Тип работ",
			"displayName": "Тип работ",
			"description": "Тип работ",
			"type": "thematic",
			"visible": false,
			"visibleIndex": 1,
			"minZoom": 6,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.GeoJSONServiceLayer",
				"args": [{
					"useVectorTile": false,
					"replaceDataOnReset": true
				}]
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.GeoJSONProvider",
				"args": [
					"http://vm2012iis/vsm_site/Map/Map/GeoJsonData/?view=vsm.land_thematic_work_type_view&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}"
				]
			}
		},

		{
			"id": "land_thematic_event_type_view",
			"name": "Тип мероприятий",
			"displayName": "Тип мероприятий",
			"description": "Тип мероприятий",
			"type": "thematic",
			"visible": false,
			"visibleIndex": 1,
			"minZoom": 6,
			"maxZoom": 23,
			"selectable": false,
			"queryable": true,

			"layerClass": {
				"constructor": "MapExpress.Layers.GeoJSONServiceLayer",
				"args": [{
					"useVectorTile": false,
					"replaceDataOnReset": true
				}]
			},

			"dataProviderClass": {
				"constructor": "MapExpress.Service.GeoJSONProvider",
				"args": [
					"http://vm2012iis/vsm_site/Map/Map/GeoJsonData/?view=vsm.land_thematic_event_type_view&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}"
				]
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
			"maxZoom": 21,
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
			"maxZoom": 21,
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