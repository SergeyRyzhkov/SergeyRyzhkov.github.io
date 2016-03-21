var YandexSearchProvider = function(name,map) {
    BaseSearchProvider.call(this,name,map);
};
YandexSearchProvider.prototype = Object.create(BaseSearchProvider.prototype);
YandexSearchProvider.prototype.constructor = YandexSearchProvider;

YandexSearchProvider.prototype.getDataByMask = function(searchValue) {
    BaseSearchProvider.prototype.getDataByMask.apply(this);
    var urlOptions = {
        geocode:searchValue+"%",
        format:"json",
        results: 24
    };
    var array = [];
    $.ajax({
        url:"https://geocode-maps.yandex.ru/1.x/?",
        type: 'GET',
        data: urlOptions,
        async: false,
        dataType: 'json',
        success: function (data) {
            if(data.response.GeoObjectCollection.featureMember.length > 0) {
                for(var i = 0; i < data.response.GeoObjectCollection.featureMember.length; i++) {
                    array.push({
                        id : data.response.GeoObjectCollection.featureMember[i].index,
                        display_name: data.response.GeoObjectCollection.featureMember[i].GeoObject.metaDataProperty.GeocoderMetaData.text,
                        type: "Feature",
                        geojson: {
                            type: "Point",
                            coordinates: data.response.GeoObjectCollection.featureMember[i].GeoObject.Point.pos.split(' ')
                        },
                        properties: {
                            bounds : data.response.GeoObjectCollection.featureMember[i].GeoObject.boundedBy.Envelope,
                            descr: data.response.GeoObjectCollection.featureMember[i].GeoObject.description,
                            metaData:data.response.GeoObjectCollection.featureMember[i].GeoObject.metaDataProperty.GeocoderMetaData,
                            names:data.response.GeoObjectCollection.featureMember[i].GeoObject.name
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
            if (urlOptions.results === resultCount)
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
