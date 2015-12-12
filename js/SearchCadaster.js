 function formatRepo(repo) {
     var markup = repo.PARCEL_ID;
     return markup;
 };

 function formatRepoSelection(repo) {
     return repo.CAD_NUM || repo.text;
 };

 function activateSearchCadastre() {

     $("#searchCadastreTool").select2({
         language: "ru",
         placeholder: "Строка ввода",
         disabled: false,
         selected: true,
         closeOnSelect: true,
         ajax: {
             url: "http://maps.rosreestr.ru/arcgis/rest/services/Cadastre/CadastreSelected/MapServer/exts/GKNServiceExtension/online/okrug/find?&f=json",
             dataType: 'json',
             delay: 250,
             data: function(params) {
                 return {
                     "cadNum": params.term + "%", // search term
                 };
             },
             processResults: function(data) {
                 if (data && data.features && data.features.length > 0) {
                     var resultArray = [];
                     $.each(data.features, function(index, value) {
                         value.attributes.id = value.attributes.OBJECTID;
                         resultArray.push(value.attributes);
                     });
                     return {
                         results: resultArray
                     };
                 } else {
                     return [];
                 }
             },
             cache: false
         },
         escapeMarkup: function(markup) {
             return markup;
         }, // let our custom formatter work
         minimumInputLength: 6,
         templateResult: formatRepo, // omitted for brevity, see the source of this page
         templateSelection: formatRepoSelection // omitted for brevity, see the source of this page

     });

     $("#searchCadastreTool").on("select2:open", function() {

         $(".select2-search__field").attr("placeholder", "Кадастровый номер");
     });

     $("#searchCadastreTool").on("select2:close", function() {

         $(".select2-search__field").attr("placeholder", null);
     });


     $("#searchCadastreTool").on("select2:select", function(e) {
         if (e.params && e.params.data) {
             var latlngMIN = L.Projection.SphericalMercator.unproject(L.point(e.params.data.XMIN, e.params.data.YMIN));
             var latlngMAX = L.Projection.SphericalMercator.unproject(L.point(e.params.data.XMAX, e.params.data.YMAX));
             var bounds = L.latLngBounds(latlngMIN, latlngMAX);
             MapManager._map.fitBounds(bounds);
             if (MapManager._map.getZoom() > 18) {
                 MapManager._map.setZoom(18);
             }
         }

     });

 };