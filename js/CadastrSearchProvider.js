var CadastrSearchProvider = function(name,map) {
    BaseSearchProvider.call(this,name,map);
};
CadastrSearchProvider.prototype = Object.create(BaseSearchProvider.prototype);
CadastrSearchProvider.prototype.constructor = CadastrSearchProvider;
CadastrSearchProvider.prototype.getDataByMask = function(searchValue) {
    BaseSearchProvider.prototype.getDataByMask.apply();
    var urlOptions = {
        where: "CAD_NUM LIKE '"+searchValue+"%'",
        text:"",
        objectIds:"",
        time:"",
        geometry:"",
        geometryType:"esriGeometryEnvelope",
        inSR:"",
        spatialRel:"esriSpatialRelIntersects",
        relationParam:"",
        outFields:"CAD_NUM,XC,YC",
        returnGeometry:false,
        returnTrueCurves:true,
        maxAllowableOffset:"",
        geometryPrecision:"",
        outSR:"",
        returnIdsOnly:false,
        returnCountOnly:false,
        orderByFields:"CAD_NUM",
        groupByFieldsForStatistics:"",
        outStatistics:"",
        returnZ:false,
        returnM:false,
        gdbVersion:"",
        returnDistinctValues:false,
        resultOffset:"",
        resultRecordCount:24,
        f:"json"
    };
    var array = [];
	$.ajax({
	    url:"http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/1/query?",
	    type: 'GET',
	    data: urlOptions,
	    dataType: 'json',
	    async: false,
	    success: function (data) {
			if(data.features.length > 0) {
		        $.each(data.features, function (index, value) {
		        	var cords = L.Projection.SphericalMercator.unproject(L.point(value.attributes.XC,value.attributes.YC));
		            array.push({
		                display_name: value.attributes.CAD_NUM,
		                type: "Feature",
		                geojson: {
		                    type: "Point",
		                    coordinates: [cords[Object.keys(cords)[1]],cords[Object.keys(cords)[0]]]
		                },
		                properties: {
		                	CAD_NUM: value.attributes.CAD_NUM
		                }
		            });

		        });
		    }else{return []};
	        if (array.type === "Feature") {
	            resultCount = 1;
	            features[0] = array;
	            featureCollection = array;
	        }else{
	            features = array;
	            resultCount = array.length;
	        if (urlOptions.resultRecordCount === resultCount)
	            featureCollection = array.slice(0, array.length - 1);
	        else
	            featureCollection = array;
	        }  
        },
        error: function () {
        }
    });
return array
}
