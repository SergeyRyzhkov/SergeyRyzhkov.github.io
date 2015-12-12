    function formatRepoAddress (repo) {
       var markup = repo.display_name;
        return markup;
    };
    function formatRepoSelectionAddress (repo) {
            return repo.display_name  || repo.text;
    };
   
    function activateSearchAddress (){

        $("#searchAddressTool").select2({
            language:"ru",
            placeholder:"Строка ввода",
            disabled: false,
            selected:true,
            ajax: {
                url: "http://nominatim.openstreetmap.org/search.php?addressdetails=1&polygon_geojson=1&format=json",
                dataType: 'json',
                delay: 350,
                data: function (params) {
                    return {
                        q: params.term+"%", // search term
                    };
                },
                processResults: function (data) {
                    if(data.length > 0) {
                        var resultArray = [];
                        $.each(data, function (index, value) {
                            value.id = value.place_id;
                            resultArray.push(value);
                        });
                        return {
                            results: resultArray
                        };
                    } else{
                        return []
                    };
                },
                cache: true
            },
            escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
            minimumInputLength: 10,
            templateResult: formatRepoAddress, // omitted for brevity, see the source of this page
            templateSelection: formatRepoSelectionAddress // omitted for brevity, see the source of this page
            
        });

        $("#searchAddressTool").on("select2:select", function (e) {;
        var latlngMIN = L.latLng(e.params.data.boundingbox[0],e.params.data.boundingbox[2]);
        var latlngMAX = L.latLng(e.params.data.boundingbox[1],e.params.data.boundingbox[3]);
        var bounds = L.latLngBounds(latlngMIN,latlngMAX);
        MapManager._map.fitBounds(bounds);
        if (MapManager._map.getZoom() > 18) {
            MapManager._map.setZoom(18);
        }
    });
};