defaultMapModel = 

{
    "id" : "vsm_map",
    "options" : {
        "name" : "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u043D\u044B\u0435 \u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u0438",
        "displayName" : "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u043D\u044B\u0435 \u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u0438",
        "description" : "\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u043D\u044B\u0435 \u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u0438",
        "zoom"        : 7,
        "center"      : [
            55.75222,
            37.61556
        ],
        "zoomControl" : false,
        "minZoom"     : 0,
        "maxZoom"     : 23
    },
    "layers"  : [
        {
            "id" : "1ds",
            "options" : {
                "name" : "rrrrrrr",
                "displayName" : "\u0421\u043B\u043E\u0438 \u0412\u0421\u041C \u0420\u0416\u0414",
                "description" : null,
                "type"        : null
            },
            "layers"  : [
                {
                    "id" : "vsmParcels",
                    "options" : {
                        "name" : "\u0423\u0447\u0430\u0441\u0442\u043A\u0438 \u0412\u0421\u041C",
                        "displayName" : "\u0423\u0447\u0430\u0441\u0442\u043A\u0438 \u0412\u0421\u041C",
                        "description" : "\u0423\u0447\u0430\u0441\u0442\u043A\u0438 \u0412\u0421\u041C",
                        "type"        : "overlay"
                    },
                    "layers"  : [
                    ],
                    "layerClass" : {
                        "constructor" : "MapExpress.Layers.GeoJSONServiceLayer",
                        "options"     : {
                            "dynamicData" : true,
                            "useVectorTile" : false,
                            "pane"          : "overlayPane",
                            "visible"       : false,
                            "visibleIndex"  : 1,
                            "minZoom"       : 8,
                            "maxZoom"       : 23,
                            "selectable"    : true,
                            "queryable"     : true,
                            "attribution"   : "\u041E\u0410\u041E \u0420\u0416\u0414"
                        },
                        "styles"      : [
                            {
                                "name" : "170ce46a-a6fa-44e9-aab9-cc5d764b2b83",
                                "minZoom" : 9,
                                "maxZoom" : 12,
                                "stroke"  : true,
                                "color"   : "#008000",
                                "weight"  : 3,
                                "opacity" : 1.0,
                                "transparent" : 0.0,
                                "fill"        : true,
                                "fillColor"   : "#80FF80",
                                "fillOpacity" : 1.0,
                                "fillTransparent" : 0.0,
                                "fillRule"        : "evenodd",
                                "dashArray"       : "",
                                "lineCap"         : "round",
                                "lineJoin"        : "round"
                            },
                            {
                                "name" : "0cea901e-11af-4d5a-a734-9dcc6d326629",
                                "minZoom" : 13,
                                "maxZoom" : 16,
                                "stroke"  : true,
                                "color"   : "#008000",
                                "weight"  : 2,
                                "opacity" : 1.0,
                                "transparent" : 0.0,
                                "fill"        : true,
                                "fillColor"   : "#FF8000",
                                "fillOpacity" : 0.14,
                                "fillTransparent" : 86.0,
                                "fillRule"        : "evenodd",
                                "dashArray"       : "",
                                "lineCap"         : "round",
                                "lineJoin"        : "round"
                            },
                            {
                                "name" : "681abefd-3c12-4658-81e2-82f1848ed986",
                                "minZoom" : 17,
                                "maxZoom" : 23,
                                "stroke"  : true,
                                "color"   : "#008000",
                                "weight"  : 5,
                                "opacity" : 1.0,
                                "transparent" : 0.0,
                                "fill"        : true,
                                "fillColor"   : "LightGrey",
                                "fillOpacity" : 0.48,
                                "fillTransparent" : 52.0,
                                "fillRule"        : "evenodd",
                                "dashArray"       : "15,10",
                                "lineCap"         : "square",
                                "lineJoin"        : "miter"
                            }
                        ]
                    },
                    "dataProviderClass" : {
                        "constructor" : "MapExpress.Service.GeoJSONProvider",
                        "args"        : [
                            "http://188.43.2.57/vsm_site/Map/Map/GeoJsonData/?view=vsm.land_geo_object_view_1&geoColumn=geom&idColumn=id&bbox={xMin},{yMin},{xMax},{yMax}"
                        ],
                        "options"     : {
                            "useTileIndex" : false,
                            "preloadData"  : false,
                            "identifyFormat" : "json",
                            "tileSize"       : 256,
                            "subdomains"     : "abc",
                            "uppercase"      : false,
                            "identifyLayersId" : ""
                        }
                    }
                },
                {
                    "id" : "a4197d61-45b7-464d-bc48-012f09820a97",
                    "options" : {
                        "name" : "\u0413\u0438\u0434\u0440\u043E\u0422\u0435\u043F\u043B\u043E\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u0421\u0442\u0430\u0446\u0438\u0438",
                        "displayName" : "\u0413\u0438\u0434\u0440\u043E\u0422\u0435\u043F\u043B\u043E\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u0421\u0442\u0430\u0446\u0438\u0438",
                        "description" : null,
                        "type"        : "overlay"
                    },
                    "layers"  : [
                    ],
                    "layerClass" : {
                        "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                        "options"     : {
                            "visible" : false,
                            "visibleIndex" : 3,
                            "minZoom"      : 6,
                            "maxZoom"      : 23,
                            "selectable"   : false,
                            "queryable"    : false,
                            "attribution"  : ""
                        },
                        "styles"      : [
                        ]
                    },
                    "dataProviderClass" : {
                        "constructor" : "MapExpress.Service.WmsProvider",
                        "args"        : [
                            "http://gisserver.info/GISWebServiceSE/service.php"
                        ],
                        "options"     : {
                            "service" : "WMS",
                            "request" : "GetMap",
                            "version" : "1.3.0",
                            "layers"  : "hydroelectric_power,thermoelectric_power,substation,boiler",
                            "styles"  : "",
                            "format"  : "image/png",
                            "dpi"     : 96,
                            "transparent" : true,
                            "tileSize"    : 256,
                            "subdomains"  : "abc",
                            "uppercase"   : false,
                            "identifyFormat" : "text/html",
                            "identifyLayersId" : ""
                        }
                    }
                },
                {
                    "id" : "ab904491-4f64-4313-89cd-c0f5737b9099",
                    "options" : {
                        "name" : "\u0421\u0442\u0430\u043D\u0446\u0438\u0438 \u0420\u0416\u0414",
                        "displayName" : "\u0421\u0442\u0430\u043D\u0446\u0438\u0438 \u0420\u0416\u0414",
                        "description" : null,
                        "type"        : "overlay"
                    },
                    "layers"  : [
                    ],
                    "layerClass" : {
                        "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                        "options"     : {
                            "visible" : false,
                            "visibleIndex" : 2,
                            "minZoom"      : 8,
                            "maxZoom"      : 23,
                            "selectable"   : false,
                            "queryable"    : false,
                            "attribution"  : ""
                        },
                        "styles"      : [
                        ]
                    },
                    "dataProviderClass" : {
                        "constructor" : "MapExpress.Service.WmsProvider",
                        "args"        : [
                            "http://gisserver.info/GISWebServiceSE/service.php"
                        ],
                        "options"     : {
                            "service" : "WMS",
                            "request" : "GetMap",
                            "version" : "1.3.0",
                            "layers"  : "rzd",
                            "styles"  : "",
                            "format"  : "image/png",
                            "dpi"     : 96,
                            "transparent" : true,
                            "tileSize"    : 256,
                            "subdomains"  : "abc",
                            "uppercase"   : false,
                            "identifyFormat" : "text/html",
                            "identifyLayersId" : ""
                        }
                    }
                }
            ],
            "layerClass" : null,
            "dataProviderClass" : null
        },
        {
            "id" : "OpenStreetMap",
            "options" : {
                "name" : "OpenStreetMap",
                "displayName" : "OpenStreetMap",
                "description" : "OpenStreetMap",
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 200,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : true,
                    "visibleIndex"         : 0,
                    "minZoom"              : 0,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "abc",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "2\u0413\u0418\u0421",
            "options" : {
                "name" : "2\u0413\u0418\u0421",
                "displayName" : "2\u0413\u0418\u0421",
                "description" : "\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u044B 2\u0413\u0418\u0421",
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 10,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 0,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "http://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "abc",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "cartocdn",
            "options" : {
                "name" : "cartocdn",
                "displayName" : "cartocdn",
                "description" : "\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u044B cartocdn",
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 200,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 0,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "abc",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "rosreestrBaseMap",
            "options" : {
                "name" : "rosreestrBaseMap",
                "displayName" : "\u0420\u043E\u0441\u0440\u0435\u0435\u0441\u0442\u0440",
                "description" : "rosreestrBaseMap",
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 200,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 0,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                "args"        : [
                    "http://maps.rosreestr.ru/arcgis/rest/services/BaseMaps/BaseMap/MapServer"
                ],
                "options"     : {
                    "identifyFormat" : "json",
                    "identifyUrl"    : "",
                    "identifyTolerance" : 1,
                    "dpi"               : 96,
                    "format"            : "png32",
                    "transparent"       : true,
                    "layersId"          : "",
                    "tileSize"          : 256,
                    "subdomains"        : "abc",
                    "uppercase"         : false,
                    "identifyLayersId"  : ""
                }
            }
        },
        {
            "id" : "navioniks",
            "options" : {
                "name" : "navioniks",
                "displayName" : "\u041D\u0430\u0432\u0438\u043E\u043D\u0438\u043A\u0441",
                "description" : "navioniks",
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 200,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 0,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "http://backend.navionics.io/tile/{z}/{x}/{y}?LAYERS=config_1_1_0&TRANSPARENT=TRUE&navtoken=TmF2aW9uaWNzX2ludGVybmFscHVycG9zZV8wMDAwMSt3ZWJhcGl2Mi5uYXZpb25pY3MuY29t"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "abc",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "mapBox",
            "options" : {
                "name" : "MapBox",
                "displayName" : "MapBox",
                "description" : "MapBox",
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 10,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 0,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "http://{s}.tiles.mapbox.com/v4/unepwcmc.l8gj1ihl/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidW5lcHdjbWMiLCJhIjoiRXg1RERWRSJ9.taTsSWwtAfFX_HMVGo2Cug"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "abc",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "1",
            "options" : {
                "name" : "\u0420\u043E\u0441\u0440\u0435\u0435\u0441\u0442\u0440 \u0420\u0424 \u0413\u041A\u041D",
                "displayName" : "\u041F\u0443\u0431\u043B\u0438\u0447\u043D\u0430\u044F \u043A\u0430\u0434\u0430\u0441\u0442\u0440\u043E\u0432\u0430\u044F \u043A\u0430\u0440\u0442\u0430 \u0420\u0424",
                "description" : "\u0422\u0435\u0441\u0442\u043E\u0432\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u0430. \u0414\u043B\u044F \u0442\u0435\u0441\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F",
                "type"        : null
            },
            "layers"  : [
                {
                    "id" : "zouit",
                    "options" : {
                        "name" : "\u0417\u041E\u0423\u0418\u0422 \u0413\u041A\u041D",
                        "displayName" : "\u0417\u041E\u0423\u0418\u0422",
                        "description" : "\u0417\u041E\u0423\u0418\u0422 \u0413\u041A\u041D",
                        "type"        : "overlay"
                    },
                    "layers"  : [
                    ],
                    "layerClass" : {
                        "constructor" : "MapExpress.Layers.TileServiceLayer",
                        "options"     : {
                            "maxNativeZoom" : null,
                            "tileSize"      : 256,
                            "errorTileUrl"  : "",
                            "continuousWorld" : false,
                            "noWrap"          : false,
                            "zoomOffset"      : 0,
                            "zoomReverse"     : false,
                            "opacity"         : 1.0,
                            "updateInterval"  : 200,
                            "unloadInvisibleTiles" : true,
                            "updateWhenIdle"       : false,
                            "reuseTiles"           : false,
                            "crossOrigin"          : false,
                            "visible"              : false,
                            "visibleIndex"         : 13,
                            "minZoom"              : 9,
                            "maxZoom"              : 23,
                            "selectable"           : false,
                            "queryable"            : false,
                            "attribution"          : ""
                        },
                        "styles"      : [
                        ]
                    },
                    "dataProviderClass" : {
                        "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                        "args"        : [
                            "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/ZOUIT/MapServer"
                        ],
                        "options"     : {
                            "identifyFormat" : "json",
                            "identifyUrl"    : "",
                            "identifyTolerance" : 1,
                            "dpi"               : 96,
                            "format"            : "png32",
                            "transparent"       : true,
                            "layersId"          : "0",
                            "tileSize"          : 256,
                            "subdomains"        : "abc",
                            "uppercase"         : false,
                            "identifyLayersId"  : ""
                        }
                    }
                },
                {
                    "id" : "terrzone",
                    "options" : {
                        "name" : "\u0422\u0435\u0440.\u0437\u043E\u043D\u044B \u0413\u041A\u041D",
                        "displayName" : "\u0422\u0435\u0440\u0440\u0438\u0442\u043E\u0440\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0437\u043E\u043D\u044B",
                        "description" : "\u0422\u0435\u0440.\u0437\u043E\u043D\u044B \u0413\u041A\u041D",
                        "type"        : "overlay"
                    },
                    "layers"  : [
                    ],
                    "layerClass" : {
                        "constructor" : "MapExpress.Layers.TileServiceLayer",
                        "options"     : {
                            "maxNativeZoom" : null,
                            "tileSize"      : 256,
                            "errorTileUrl"  : "",
                            "continuousWorld" : false,
                            "noWrap"          : false,
                            "zoomOffset"      : 0,
                            "zoomReverse"     : false,
                            "opacity"         : 1.0,
                            "updateInterval"  : 200,
                            "unloadInvisibleTiles" : true,
                            "updateWhenIdle"       : false,
                            "reuseTiles"           : false,
                            "crossOrigin"          : false,
                            "visible"              : false,
                            "visibleIndex"         : 14,
                            "minZoom"              : 9,
                            "maxZoom"              : 23,
                            "selectable"           : false,
                            "queryable"            : false,
                            "attribution"          : ""
                        },
                        "styles"      : [
                        ]
                    },
                    "dataProviderClass" : {
                        "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                        "args"        : [
                            "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/TERRSelected/MapServer"
                        ],
                        "options"     : {
                            "identifyFormat" : "json",
                            "identifyUrl"    : "",
                            "identifyTolerance" : 1,
                            "dpi"               : 96,
                            "format"            : "png32",
                            "transparent"       : true,
                            "layersId"          : "0",
                            "tileSize"          : 256,
                            "subdomains"        : "abc",
                            "uppercase"         : false,
                            "identifyLayersId"  : ""
                        }
                    }
                },
                {
                    "id" : "06100861-e098-4144-ab93-3ca6a4f9c9f1",
                    "options" : {
                        "name" : "\u041D\u043E\u0432\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u0430 \u0441\u043B\u043E\u0435\u0432",
                        "displayName" : "\u041A\u0430\u0434\u0430\u0441\u0442\u0440\u043E\u0432\u043E\u0435 \u0434\u0435\u043B\u0435\u043D\u0438\u0435",
                        "description" : null,
                        "type"        : "group"
                    },
                    "layers"  : [
                        {
                            "id" : "67dd9596-b51f-4b51-a288-9de1c22a27dd",
                            "options" : {
                                "name" : "\u041A\u0430\u0434\u0430\u0441\u0442\u0440\u043E\u0432\u044B\u0435 \u043E\u043A\u0440\u0443\u0433\u0430",
                                "displayName" : "\u041A\u0430\u0434\u0430\u0441\u0442\u0440\u043E\u0432\u044B\u0435 \u043E\u043A\u0440\u0443\u0433\u0430",
                                "description" : null,
                                "type"        : "overlay"
                            },
                            "layers"  : [
                            ],
                            "layerClass" : {
                                "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                                "options"     : {
                                    "visible" : false,
                                    "visibleIndex" : 6,
                                    "minZoom"      : 9,
                                    "maxZoom"      : 23,
                                    "selectable"   : false,
                                    "queryable"    : false,
                                    "attribution"  : ""
                                },
                                "styles"      : [
                                ]
                            },
                            "dataProviderClass" : {
                                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                                "args"        : [
                                    "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer"
                                ],
                                "options"     : {
                                    "identifyFormat" : "json",
                                    "identifyUrl"    : "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer",
                                    "identifyTolerance" : 1,
                                    "dpi"               : 96,
                                    "format"            : "png32",
                                    "transparent"       : true,
                                    "layersId"          : "1,2,3,4,5,6,7",
                                    "tileSize"          : 256,
                                    "subdomains"        : "abc",
                                    "uppercase"         : false,
                                    "identifyLayersId"  : "1,2,3,4,5,6,7"
                                }
                            }
                        },
                        {
                            "id" : "9070db57-79b8-4711-93cb-2cac2047fc15",
                            "options" : {
                                "name" : "\u041A\u0430\u0434\u0430\u0441\u0442\u0440\u043E\u0432\u044B\u0435 \u0440\u0430\u0439\u043E\u043D\u044B",
                                "displayName" : "\u041A\u0430\u0434\u0430\u0441\u0442\u0440\u043E\u0432\u044B\u0435 \u0440\u0430\u0439\u043E\u043D\u044B",
                                "description" : null,
                                "type"        : "overlay"
                            },
                            "layers"  : [
                            ],
                            "layerClass" : {
                                "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                                "options"     : {
                                    "visible" : false,
                                    "visibleIndex" : 8,
                                    "minZoom"      : 9,
                                    "maxZoom"      : 23,
                                    "selectable"   : false,
                                    "queryable"    : false,
                                    "attribution"  : ""
                                },
                                "styles"      : [
                                ]
                            },
                            "dataProviderClass" : {
                                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                                "args"        : [
                                    "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer"
                                ],
                                "options"     : {
                                    "identifyFormat" : "json",
                                    "identifyUrl"    : "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer",
                                    "identifyTolerance" : 1,
                                    "dpi"               : 96,
                                    "format"            : "png32",
                                    "transparent"       : true,
                                    "layersId"          : "9,10,11,12,13,14,15,16",
                                    "tileSize"          : 256,
                                    "subdomains"        : "abc",
                                    "uppercase"         : false,
                                    "identifyLayersId"  : "9,10,11,12,13,14,15,16"
                                }
                            }
                        },
                        {
                            "id" : "fe85230d-a204-4fd2-b051-a718576b6c90",
                            "options" : {
                                "name" : "\u041A\u0430\u0434\u0430\u0441\u0442\u0440\u043E\u0432\u044B\u0435 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u044B",
                                "displayName" : "\u041A\u0430\u0434\u0430\u0441\u0442\u0440\u043E\u0432\u044B\u0435 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u044B",
                                "description" : null,
                                "type"        : "overlay"
                            },
                            "layers"  : [
                            ],
                            "layerClass" : {
                                "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                                "options"     : {
                                    "visible" : false,
                                    "visibleIndex" : 7,
                                    "minZoom"      : 9,
                                    "maxZoom"      : 23,
                                    "selectable"   : false,
                                    "queryable"    : false,
                                    "attribution"  : ""
                                },
                                "styles"      : [
                                ]
                            },
                            "dataProviderClass" : {
                                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                                "args"        : [
                                    "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer"
                                ],
                                "options"     : {
                                    "identifyFormat" : "json",
                                    "identifyUrl"    : "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer",
                                    "identifyTolerance" : 1,
                                    "dpi"               : 96,
                                    "format"            : "png32",
                                    "transparent"       : true,
                                    "layersId"          : "18,19,20",
                                    "tileSize"          : 256,
                                    "subdomains"        : "abc",
                                    "uppercase"         : false,
                                    "identifyLayersId"  : "18,19,20"
                                }
                            }
                        },
                        {
                            "id" : "179fa65e-ca4f-4baf-9f18-4cce68578589",
                            "options" : {
                                "name" : "\u041E\u0431\u044A\u0435\u043A\u0442\u044B \u043D\u0435\u0434\u0432\u0438\u0436\u0438\u043C\u043E\u0441\u0442\u0438",
                                "displayName" : "\u041E\u0431\u044A\u0435\u043A\u0442\u044B \u043D\u0435\u0434\u0432\u0438\u0436\u0438\u043C\u043E\u0441\u0442\u0438",
                                "description" : null,
                                "type"        : "overlay"
                            },
                            "layers"  : [
                            ],
                            "layerClass" : {
                                "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                                "options"     : {
                                    "visible" : false,
                                    "visibleIndex" : 4,
                                    "minZoom"      : 9,
                                    "maxZoom"      : 23,
                                    "selectable"   : false,
                                    "queryable"    : false,
                                    "attribution"  : ""
                                },
                                "styles"      : [
                                ]
                            },
                            "dataProviderClass" : {
                                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                                "args"        : [
                                    "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer"
                                ],
                                "options"     : {
                                    "identifyFormat" : "json",
                                    "identifyUrl"    : "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer",
                                    "identifyTolerance" : 1,
                                    "dpi"               : 96,
                                    "format"            : "png32",
                                    "transparent"       : true,
                                    "layersId"          : "22",
                                    "tileSize"          : 256,
                                    "subdomains"        : "abc",
                                    "uppercase"         : false,
                                    "identifyLayersId"  : "22"
                                }
                            }
                        },
                        {
                            "id" : "3523aac1-7115-4102-b875-7dbbc6682a36",
                            "options" : {
                                "name" : "\u0417\u0435\u043C\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0447\u0430\u0441\u0442\u043A\u0438",
                                "displayName" : "\u0417\u0435\u043C\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0447\u0430\u0441\u0442\u043A\u0438",
                                "description" : null,
                                "type"        : "overlay"
                            },
                            "layers"  : [
                            ],
                            "layerClass" : {
                                "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                                "options"     : {
                                    "visible" : false,
                                    "visibleIndex" : 5,
                                    "minZoom"      : 9,
                                    "maxZoom"      : 23,
                                    "selectable"   : false,
                                    "queryable"    : false,
                                    "attribution"  : ""
                                },
                                "styles"      : [
                                ]
                            },
                            "dataProviderClass" : {
                                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                                "args"        : [
                                    "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer"
                                ],
                                "options"     : {
                                    "identifyFormat" : "json",
                                    "identifyUrl"    : "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer",
                                    "identifyTolerance" : 1,
                                    "dpi"               : 96,
                                    "format"            : "png32",
                                    "transparent"       : true,
                                    "layersId"          : "23,24",
                                    "tileSize"          : 256,
                                    "subdomains"        : "abc",
                                    "uppercase"         : false,
                                    "identifyLayersId"  : "23,24"
                                }
                            }
                        }
                    ],
                    "layerClass" : null,
                    "dataProviderClass" : null
                },
                {
                    "id" : "f1301e22-3c2f-4b1b-85ae-7b551f0f26fd",
                    "options" : {
                        "name" : "\u041D\u043E\u0432\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u0430 \u0441\u043B\u043E\u0435\u0432",
                        "displayName" : "\u0413\u0440\u0430\u043D\u0438\u0446\u044B",
                        "description" : null,
                        "type"        : "group"
                    },
                    "layers"  : [
                        {
                            "id" : "e251df95-a9e7-4b39-82a5-4b3d803be61d",
                            "options" : {
                                "name" : "\u0413\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u0433\u0440\u0430\u043D\u0438\u0446\u0430 \u0420\u0424",
                                "displayName" : "\u0413\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u0433\u0440\u0430\u043D\u0438\u0446\u0430 \u0420\u0424",
                                "description" : null,
                                "type"        : "overlay"
                            },
                            "layers"  : [
                            ],
                            "layerClass" : {
                                "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                                "options"     : {
                                    "visible" : false,
                                    "visibleIndex" : 12,
                                    "minZoom"      : 9,
                                    "maxZoom"      : 23,
                                    "selectable"   : false,
                                    "queryable"    : false,
                                    "attribution"  : ""
                                },
                                "styles"      : [
                                ]
                            },
                            "dataProviderClass" : {
                                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                                "args"        : [
                                    "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/BordersGKNSelected/MapServer"
                                ],
                                "options"     : {
                                    "identifyFormat" : "json",
                                    "identifyUrl"    : "",
                                    "identifyTolerance" : 1,
                                    "dpi"               : 96,
                                    "format"            : "png",
                                    "transparent"       : true,
                                    "layersId"          : "2,3,4,5",
                                    "tileSize"          : 256,
                                    "subdomains"        : "abc",
                                    "uppercase"         : false,
                                    "identifyLayersId"  : ""
                                }
                            }
                        },
                        {
                            "id" : "e4ea5e0c-6a5a-4049-85ef-49a012df1552",
                            "options" : {
                                "name" : "\u0413\u0440\u0430\u043D\u0438\u0446\u044B \u0441\u0443\u0431\u044A\u0435\u043A\u0442\u043E\u0432 \u0444\u0435\u0434\u0435\u0440\u0430\u0446\u0438\u0438",
                                "displayName" : "\u0413\u0440\u0430\u043D\u0438\u0446\u044B \u0441\u0443\u0431\u044A\u0435\u043A\u0442\u043E\u0432 \u0444\u0435\u0434\u0435\u0440\u0430\u0446\u0438\u0439",
                                "description" : null,
                                "type"        : "overlay"
                            },
                            "layers"  : [
                            ],
                            "layerClass" : {
                                "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                                "options"     : {
                                    "visible" : false,
                                    "visibleIndex" : 11,
                                    "minZoom"      : 9,
                                    "maxZoom"      : 23,
                                    "selectable"   : false,
                                    "queryable"    : false,
                                    "attribution"  : ""
                                },
                                "styles"      : [
                                ]
                            },
                            "dataProviderClass" : {
                                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                                "args"        : [
                                    "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/BordersGKNSelected/MapServer"
                                ],
                                "options"     : {
                                    "identifyFormat" : "json",
                                    "identifyUrl"    : "",
                                    "identifyTolerance" : 1,
                                    "dpi"               : 96,
                                    "format"            : "png",
                                    "transparent"       : true,
                                    "layersId"          : "7,8,9,10,11",
                                    "tileSize"          : 256,
                                    "subdomains"        : "abc",
                                    "uppercase"         : false,
                                    "identifyLayersId"  : ""
                                }
                            }
                        },
                        {
                            "id" : "ab707c69-0b1e-44d9-8570-96386ccdd98e",
                            "options" : {
                                "name" : "\u0413\u0440\u0430\u043D\u0438\u0446\u044B \u043C\u0443\u043D\u0438\u0446\u0438\u043F\u0430\u043B\u044C\u043D\u044B\u0445 \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0439",
                                "displayName" : "\u0413\u0440\u0430\u043D\u0438\u0446\u044B \u041C\u041E",
                                "description" : null,
                                "type"        : "overlay"
                            },
                            "layers"  : [
                            ],
                            "layerClass" : {
                                "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                                "options"     : {
                                    "visible" : false,
                                    "visibleIndex" : 10,
                                    "minZoom"      : 9,
                                    "maxZoom"      : 23,
                                    "selectable"   : false,
                                    "queryable"    : false,
                                    "attribution"  : ""
                                },
                                "styles"      : [
                                ]
                            },
                            "dataProviderClass" : {
                                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                                "args"        : [
                                    "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/BordersGKNSelected/MapServer"
                                ],
                                "options"     : {
                                    "identifyFormat" : "json",
                                    "identifyUrl"    : "",
                                    "identifyTolerance" : 1,
                                    "dpi"               : 96,
                                    "format"            : "png",
                                    "transparent"       : true,
                                    "layersId"          : "13,14,15",
                                    "tileSize"          : 256,
                                    "subdomains"        : "abc",
                                    "uppercase"         : false,
                                    "identifyLayersId"  : ""
                                }
                            }
                        },
                        {
                            "id" : "863780ee-413b-4d5f-8424-6a4049ed67cc",
                            "options" : {
                                "name" : "\u0413\u0440\u0430\u043D\u0438\u0446\u044B \u043D\u0430\u0441\u0435\u043B\u0435\u043D\u043D\u044B\u0445 \u043F\u0443\u043D\u043A\u0442\u043E\u0432",
                                "displayName" : "\u0413\u0440\u0430\u043D\u0438\u0446\u044B \u043D\u0430\u0441\u0435\u043B\u0435\u043D\u043D\u044B\u0445 \u043F\u0443\u043D\u043A\u0442\u043E\u0432",
                                "description" : null,
                                "type"        : "overlay"
                            },
                            "layers"  : [
                            ],
                            "layerClass" : {
                                "constructor" : "MapExpress.Layers.ImageOverlayLayer",
                                "options"     : {
                                    "visible" : false,
                                    "visibleIndex" : 9,
                                    "minZoom"      : 9,
                                    "maxZoom"      : 23,
                                    "selectable"   : false,
                                    "queryable"    : false,
                                    "attribution"  : ""
                                },
                                "styles"      : [
                                ]
                            },
                            "dataProviderClass" : {
                                "constructor" : "MapExpress.Service.MapServiceAgsProvider",
                                "args"        : [
                                    "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/BordersGKNSelected/MapServer"
                                ],
                                "options"     : {
                                    "identifyFormat" : "json",
                                    "identifyUrl"    : "",
                                    "identifyTolerance" : 1,
                                    "dpi"               : 96,
                                    "format"            : "png",
                                    "transparent"       : true,
                                    "layersId"          : "17,18",
                                    "tileSize"          : 256,
                                    "subdomains"        : "abc",
                                    "uppercase"         : false,
                                    "identifyLayersId"  : ""
                                }
                            }
                        }
                    ],
                    "layerClass" : null,
                    "dataProviderClass" : null
                }
            ],
            "layerClass" : null,
            "dataProviderClass" : null
        },
        {
            "id" : "dc9f1fe3-9c09-40d8-bd9a-64bbeb0080f7",
            "options" : {
                "name" : "\"\u0421\u043F\u0443\u0442\u043D\u0438\u043A\"",
                "displayName" : "\"\u0421\u043F\u0443\u0442\u043D\u0438\u043A\"",
                "description" : null,
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 100,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 9,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "http://d.tiles.maps.sputnik.ru/{z}/{x}/{y}.png"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "abc",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "61ea4214-c987-4ea2-9437-917d8e8b8e12",
            "options" : {
                "name" : "\u0422\u043E\u043F\u043E\u043A\u0430\u0440\u0442\u044B (\u041C\u0430\u0440\u0448\u0440\u0443\u0442\u044B \u0420\u0423)",
                "displayName" : "\u0422\u043E\u043F\u043E\u043A\u0430\u0440\u0442\u044B (\u041C\u0430\u0440\u0448\u0440\u0443\u0442\u044B \u0420\u0423)",
                "description" : null,
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 100,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 9,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "http://maps.marshruty.ru/ml.ashx?al={s}&x={x}&y={y}&z={z}"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "123",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "3b25287c-0c8a-4357-9833-0dbff7395e37",
            "options" : {
                "name" : "Bing Maps",
                "displayName" : "Bing Maps",
                "description" : null,
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 100,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 9,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "http://ecn.t{s}.tiles.virtualearth.net/tiles/a{q}.jpeg?g=0&dir=dir_n"
                ],
                "options"     : {
                    "useQuadkey" : true,
                    "tileSize"   : 256,
                    "subdomains" : "123",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "ecf6f4ab-092c-4d7d-8273-2c462cae7432",
            "options" : {
                "name" : "Google.\u0421\u043F\u0443\u0442\u043D\u0438\u043A",
                "displayName" : "Google.\u0421\u043F\u0443\u0442\u043D\u0438\u043A",
                "description" : null,
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 100,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 3,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "123",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "373e5477-8a88-4ccc-9f68-f45056de3fc5",
            "options" : {
                "name" : "\u042F\u043D\u0434\u0435\u043A\u0441.\u041A\u0430\u0440\u0442\u044B",
                "displayName" : "\u042F\u043D\u0434\u0435\u043A\u0441.\u041A\u0430\u0440\u0442\u044B",
                "description" : null,
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 100,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 3,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "https://vec0{s}.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}lang=ru_RU"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "123",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        },
        {
            "id" : "222084b7-bb3c-4bf2-aec1-b6c919a67c8b",
            "options" : {
                "name" : "\u042F\u043D\u0434\u0435\u043A\u0441.\u0421\u043F\u0443\u0442\u043D\u0438\u043A",
                "displayName" : "\u042F\u043D\u0434\u0435\u043A\u0441.\u0421\u043F\u0443\u0442\u043D\u0438\u043A",
                "description" : null,
                "type"        : "base"
            },
            "layers"  : [
            ],
            "layerClass" : {
                "constructor" : "MapExpress.Layers.TileServiceLayer",
                "options"     : {
                    "maxNativeZoom" : null,
                    "tileSize"      : 256,
                    "errorTileUrl"  : "",
                    "continuousWorld" : false,
                    "noWrap"          : false,
                    "zoomOffset"      : 0,
                    "zoomReverse"     : false,
                    "opacity"         : 1.0,
                    "updateInterval"  : 100,
                    "unloadInvisibleTiles" : true,
                    "updateWhenIdle"       : false,
                    "reuseTiles"           : false,
                    "crossOrigin"          : false,
                    "visible"              : false,
                    "visibleIndex"         : 0,
                    "minZoom"              : 1,
                    "maxZoom"              : 23,
                    "selectable"           : false,
                    "queryable"            : false,
                    "attribution"          : ""
                },
                "styles"      : [
                ]
            },
            "dataProviderClass" : {
                "constructor" : "MapExpress.Service.TileProvider",
                "args"        : [
                    "https://sat0{s}.maps.yandex.net/tiles?l=sat&v=3.259.0&x={x}&y={y}&z={z}&lang=ru_RU"
                ],
                "options"     : {
                    "useQuadkey" : false,
                    "tileSize"   : 256,
                    "subdomains" : "123",
                    "uppercase"  : false,
                    "identifyFormat" : "text/html",
                    "identifyLayersId" : ""
                }
            }
        }
    ]
}