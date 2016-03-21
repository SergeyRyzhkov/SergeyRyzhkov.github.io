var GoogleSearchProvider = function(name,map) {
    BaseSearchProvider.call(this,name,map);
};
GoogleSearchProvider.prototype = Object.create(BaseSearchProvider.prototype);
GoogleSearchProvider.prototype.constructor = GoogleSearchProvider;

GoogleSearchProvider.prototype.getDataByMask = function(searchValue) {
    BaseSearchProvider.prototype.getDataByMask.apply(this);
    var urlOptions={
        address: searchValue+"%",
        language: 'ru',
        region: 'ru',
        limit:24
    };
    var array = [];
    $.ajax({
        url:"https://maps.googleapis.com/maps/api/geocode/json?",
        type: 'GET',
        data: urlOptions,
        async: false,
        dataType: 'json',
        success: function (data) {
    	    if(data.results.length > 0) {
                for(var i = 0; i < data.results.length; i++) {
                    array.push({
                        id : data.results[i].index,
                        display_name: data.results[i].formatted_address,
                        type: "Feature",
                        geojson: {
                            type: "Point",
                            coordinates: Object.keys(data.results[i].geometry.location).map(function (key) {return data.results[i].geometry.location[key]}).reverse()
                        },
                        properties: {
                            addresscomponents : data.results[i].addresscomponents,
                            bounds:data.results[i].geometry.bounds,
                            viewport:data.results[i].geometry.viewport,
                            types:data.results[i].types,
                            place_id:data.results[i].place_id
                        }
                    });
                }
            }else{return []};
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
        error: function () {
        }
    });

return array
}
