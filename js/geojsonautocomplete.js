;
(function($) {

    var options = {
        placeholderMessage: "Поиск...",
        searchButtonTitle: "Поиск",
        clearButtonTitle: "Сбросить параметры поиска",
        foundRecordsMessage: "Результаты поиска",
        limit: 24,
        notFoundMessage: "Совпадений не найдено",
        notFoundHint: "Удостоверьтесь, что данные введены правильно",
        pointGeometryZoomLevel: -1, //Set zoom level for point geometries -1 means use leaflet default.
        pagingActive: true,
        pokazhiMne: "display_name",
        drawStyleOptions: {
            color: "red",
            weight: 5,
            opacity: 0.65,
            fillColor: "red",
            fillOpacity: 0.2
        },
        delay: 600,
		minLength: 4,
        providers: [],
        startProvider: ""
    };
    var searchDropDown = {}; //метод возвращает выбранный провайдер
    var activeSearchProvider = {}; //активный на данный момент провайдер
    var activeResult = -1;
    var resultCount = 0;
    var lastSearch; //важный элемент при нажатии на лупу
    var features = [];
    var featureCollection = [];
    var offset = 0;
    var collapseOnBlur = true;

    $.fn.GeoJsonAutocomplete = function(userDefinedOptions) {

        var keys = Object.keys(userDefinedOptions);
        for (var i = 0, max = keys.length; i < max; i++) {
            options[keys[i]] = userDefinedOptions[keys[i]];
        }

        $(this).each(function() {
            var element = $(this);
            element.addClass("searchContainer");
            element.append('<input id="searchBox" class="searchBox" placeholder="' + options.placeholderMessage + '"/>');
            element.append('<input id="searchButton" class="searchButton" type="submit" value="" title="' + options.searchButtonTitle + '"/>');
            element.append('<span class="divider"></span>');
            element.append('<input id="clearButton" class="clearButton" type="submit"  value="" title="' + options.clearButtonTitle + '">');
            element.append('<span class="divider"></span>');
            element.append('<span id="searchDropDown" class="searchServices" type="submit"  tabindex="1" title="Сервис поиска">');
            var dd = $('<ul/>').addClass('dropdown').appendTo("#searchDropDown");
            $.each(options.providers, function(i) {
                var li = $('<li/>').appendTo($('.dropdown'))
                var a = $("<a />", {
                    href: "#",
                    text: options.providers[i].getName()
                }).appendTo(li);
            });

            searchDropDown = new DropDown($('#searchDropDown'));
            $("#searchBox")[0].value = "";
            $("#searchBox").delayKeyup(function(event) {
                switch (event.keyCode) {
                    case 13: // enter
                        searchButtonClick();
                        break;
                    default:
                        if ($("#searchBox")[0].value.length > options.minLength) {
                            offset = 0;
                            getValuesAsGeoJson();
                        } else {
                            //clearButtonClick();
                        }
                        break;
                }
            }, options.delay);

            $("#searchBox").focus(function() {
                if ($("#resultsDiv")[0] !== undefined) {
                    $("#resultsDiv")[0].style.visibility = "visible";
                }
            });

            $("#searchBox").blur(function() {
                if ($("#resultsDiv")[0] !== undefined) {
                    if (collapseOnBlur) {
                        $("#resultsDiv")[0].style.visibility = "collapse";
                    } else {
                        collapseOnBlur = true;

                        window.setTimeout(function() {
                            $("#searchBox").focus();
                        }, 0);
                    }
                }

            });

            $("#searchButton").click(function() {
                searchButtonClick();
            });

            $("#clearButton").click(function() {
                clearButtonClick();
            });
        });
    };

    $.fn.delayKeyup = function(callback, ms) {
        var timer = 0;
        $(this).keyup(function(event) {

            if (event.keyCode !== 13 && event.keyCode !== 38 && event.keyCode !== 40) {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    callback(event);
                }, ms);
            } else {
                callback(event);
            }
        });
        return $(this);
    };

    function getValuesAsGeoJson() {
        var searchValue = $("#searchBox")[0].value;
        activeSearchProvider = searchDropDown.getProvider();
        features = activeSearchProvider.getDataByMask(searchValue);
        if (features != false) {
            createDropDown(features);
        } else {
            processNoRecordsFoundOrError()
        }
    };

    function createDropDown(resultData) {
        var parent = $("#searchBox").parent();

        $("#resultsDiv").remove();
        parent.append("<div id='resultsDiv' class='result'><ul id='resultList' class='result-item'></ul><div>");

        var loopCount = resultData.length;
        var hasMorePages = false;
        if (resultData.length === options.limit + 1) { //Has more pages
            loopCount--;
            hasMorePages = true;
            resultCount--;
        };

        for (var i = 0; i < loopCount; i++) {

            var html = "<li id='listElement" + i + "' class='listResult'>";
            html += "<span id='listElementContent" + i + "' class='result-content'>";
            html += "<font size='2' color='#333' class='title'>" + resultData[i][options.pokazhiMne] + "</font></span></li>";

            $("#resultList").append(html);

            $("#listElement" + i).mouseenter(function() {
                listElementMouseEnter(this);
            });

            $("#listElement" + i).mouseleave(function() {
                listElementMouseLeave(this);
            });

            $("#listElement" + i).mousedown(function() {
                listElementMouseDown(this);
            });
        };
    };

    function listElementMouseEnter(listElement) {

        var index = parseInt(listElement.id.substr(11));

        if (index !== activeResult) {
            $('#listElement' + index).toggleClass('mouseover');
        };
    };

    function listElementMouseLeave(listElement) {
        var index = parseInt(listElement.id.substr(11));

        if (index !== activeResult) {
            $('#listElement' + index).removeClass('mouseover');
        };
    };

    function listElementMouseDown(listElement) {
        var index = parseInt(listElement.id.substr(11));

        if (index !== activeResult) {
            if (activeResult !== -1) {
                $('#listElement' + activeResult).removeClass('active');
            }

            $('#listElement' + index).removeClass('mouseover');
            $('#listElement' + index).addClass('active');

            activeResult = index;
            fillSearchBox()

            activeSearchProvider.processResult(features[activeResult], options);
        };
    };

    function fillSearchBox() {
        if (activeResult === -1) {
            $("#searchBox")[0].value = lastSearch;
        } else {
            $("#searchBox")[0].value = features[activeResult][options.pokazhiMne];
        };
    };

    function clearButtonClick() {
        $("#searchBox")[0].value = "";
        lastSearch = "";
        resultCount = 0;
        features = [];
        activeResult = -1;
        $("#resultsDiv").remove();
    };

    function searchButtonClick() {
        getValuesAsGeoJson();

    };

    function processNoRecordsFoundOrError() {
        resultCount = 0;
        features = [];
        activeResult = -1;
        $("#resultsDiv").remove();
        var parent = $("#searchBox").parent();
        $("#resultsDiv").remove();
        parent.append("<div id='resultsDiv' class='result'><i>" + " " + options.notFoundMessage + " <p><small>" + options.notFoundHint + "</small></i><div>");
    };

    function DropDown(elements) {

        this.searchDropDown = elements;

        this.placeholder = this.searchDropDown.children('span');
        this.opts = this.searchDropDown.find('ul.dropdown > li');
        this.val = '';
        this.index = -1;
        this.initEvents();
    };

    DropDown.prototype = {
        initEvents: function() {
            var obj = this;
            obj.searchDropDown.on('click', function(event) {
                $(this).toggleClass('active');
                return false;
            });
            $(".searchServices").on("getObjVal", function(param) {
                $(".searchServices").attr('title', "Сервис поиска " + obj.val);
            });
            obj.opts.on('click', function() {
                var opt = $(this);
                obj.val = opt.text();
                obj.index = opt.index();
                $(".searchServices").trigger("getObjVal", [obj.val]);
            });
        },
        getValue: function() {
            return this.val;
        },
        getIndex: function() {
            return this.index;
        },
        getProvider: function() {
            var a = this.getValue();
            if (a === "") {
                return options.startProvider
            };
            for (var i = 0; i < options.providers.length; i++) {
                if (options.providers[i].getName() === a) {
                    return options.providers[i];
                };
            };
        },
    };
    $(function() {
        $(document).click(function() {
            $('.searchServices').removeClass('active');
        });
    });
})(jQuery);