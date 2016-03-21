var OsmSearchProvider = function(name,map) {
    BaseSearchProvider.call(this,name,map);
};
OsmSearchProvider.prototype = Object.create(BaseSearchProvider.prototype);
OsmSearchProvider.prototype.constructor = OsmSearchProvider;

OsmSearchProvider.prototype.getDataByMask = function(searchValue) {
    BaseSearchProvider.prototype.getDataByMask.apply(this);
    this.map = map;
    var array;
    var urlOptions = {
            q: searchValue+"%",
            format:"json",
            limit:15,
            addressdetails:1,
            polygon_geojson:1
        }
	$.ajax({
        url:"http://nominatim.openstreetmap.org/search.php?",
        type: 'GET',
        data: urlOptions,
        dataType: 'json',
        async: false,
        success: function (data) {
        array = data;
        if (array.type === "Feature") {
            resultCount = 1;
            features[0] = array;
        	featureCollection = array;
        }else{
            features = array;
            resultCount = array.length;
            if (urlOptions.limit === resultCount)
                featureCollection = array.slice(0, array.length - 1);
            else
                featureCollection = array;
            }
               
        },
        complete: function() {
          
        },
        error: function () {
        }
    });
return array; 
}

