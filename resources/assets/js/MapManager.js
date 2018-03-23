//Create an event node
var Event = (function($) { return function(properties) {
      this.className = properties.event_type.replace(/[^\w]/ig,"-").toLowerCase();

      this.props = {}
      this.props.title = properties.title
      this.props.browser_url = 'https://www.resistancecalendar.org/event/' + properties['_id'];
      this.props.start_date = properties.start_date
      this.props.address = properties['location']['venue']
      this.props.supergroup = properties.supergroup
      this.props.start_time = properties.event_type=='Group' ? new Date(2100,01,01): moment(properties.start_date)._d;

      // Remove the timezone issue from
      this.props.start_time = new Date(this.props.start_time.valueOf() + this.props.start_time.getTimezoneOffset() * 60000);
      this.props.group = properties.group
      this.props.event_type = properties.event_type
      this.props.lat = properties.location.location.latitude.toString()
      this.props.lng = properties.location.location.longitude.toString()
      this.props.LatLng = [this.props.lat, this.props.lng]
      this.props.filters = properties.filters
      this.props.total_accepted = properties.total_accepted

      this.props.social = {
        facebook: properties.facebook,
        email: properties.email,
        phone: properties.phone,
        twitter: properties.twitter
      };

      this.render = function (distance, zipcode) {
        var that = this;

        // var endtime = that.endTime ? moment(that.endTime).format("h:mma") : null;
        if ( this.props.event_type === 'Group' ) {
          return that.render_group(distance, zipcode)
        } else {
          return that.render_event(distance, zipcode)
        }
      }

      this.render_group = function(distance, zipcode) {
        var that = this;

        var lat = that.props.lat
        var lon = that.props.lng

        var social_html = '';

        if (that.props.social) {
          if (that.props.social.facebook !== '') { social_html += `<a href='${that.props.social.facebook}' target='_blank'><img src='/images/icon/facebook.png' /></a>`; }
          if (that.props.social.twitter !== '') { social_html += `<a href='${that.props.social.twitter}' target='_blank'><img src='/images/icon/twitter.png' /></a>`; }
          if (that.props.social.email !== '') { social_html += `<a href='mailto:${that.props.social.email}' ><img src='/images/icon/mailchimp.png' /></a>`; }
          if (that.props.social.phone !== '') { social_html += `&nbsp;<img src='/images/icon/phone.png' /><span>${that.props.social.phone}</span>`; }
        }

        var new_window = true;
        if ( that.props.browser_url.match(/^mailto/g) ) {
          new_window = false;
        }

        var rendered = $("<div class=montserrat/>")
          .addClass('event-item ' + that.className)
          .html(`
            <div class="event-item lato ${that.className}" lat="${lat}" lon="${lon}">
              <h5 class="time-info">
                <span class="time-info-dist">${distance ?  distance + "mi&nbsp;&nbsp;" : ""}</span>
              </h5>
              <h3>
                <a ${new_window ? 'target="_blank"' : ''} href="${that.props.browser_url}">${that.props.title}</a>
              </h3>
              <span class="label-icon"></span>
              <h5 class="event-type">${that.props.event_type}</h5>
              <div class='event-social'>
                ${social_html}
              </div>
            </div>
            `);

        return rendered.html();
      };

      this.render_event = function(distance, zipcode) {
        var that = this;

        var weekDay = moment(that.props.start_time).format("ddd");
        var monthDate = moment(that.props.start_time).format("MMM DD");
        var time = moment(that.props.start_time).format("h:mma");
        var lat = that.props.lat
        var lon = that.props.lng

        var attendingText = typeof that.props.total_accepted != 'undefined' && that.props.total_accepted > 0 ? "- " + that.props.total_accepted + " RSVPs" : ""

        var rendered = $("<div class=montserrat/>")
          .addClass('event-item ' + that.className)
          .html(`
            <div class="event-item lato ${that.className}" lat="${lat}" lon="${lon}">
              <h5 class="time-info">
                <div class="dateblock">
                  <span class="left" style="text-transform: uppercase">${weekDay}</span>
                  <span class="right">${monthDate}</span>
                </div>
              </h5>
              <h3>
                <a target="_blank" href="${that.props.browser_url}" class="event-title">${that.props.title}</a>
              </h3>
              <span class="label-icon"></span>
              <h5 class="event-type">${that.props.event_type} ${attendingText}</h5>
              <p>${that.props.address}</p>
              <div>
                <a class="rsvp-link" href="${that.props.browser_url}" target="_blank" onclick="ga('send', 'event', 'Event', 'visited', '${that.props.browser_url}');">DETAILS</a>
                <span class="time-info-dist" style="float: right; padding-top: 10px">${distance ?  distance + "mi&nbsp;&nbsp;" : ""}</span>
              </div>
            </div>
            `);

        return rendered.html();
      };
    }
  })(jQuery); //End of events

/****
 *  MapManager proper
 */
var MapManager = (function($, d3, leaflet) {
  return (
    function(osdiEvents, campaignOffices, zipcodes, options) {
      var allFilters = window.eventTypeFilters.map(function(i) { return i.id; });

      const eventData = osdiEvents['_embedded']['osdi:events']
        .filter(function (d) {
          return d['location']
            && d['location']['location']
            && d['location']['location']['latitude']
            && d['location']['location']['longitude'];
        });

      // Fix some non-OSDI compliant dependencies
      eventData.forEach(function (d) {
        d.event_type = "Event";
      });

      var popup = L.popup();
      var options = options;
      var zipcodes = zipcodes.reduce(function(zips, item) { zips[item.zip] = item; return zips; }, {});

      var current_filters = [], current_zipcode = "", current_distance = "", current_sort = "";

      var originalEventList = eventData.map(function(d) { return new Event(d); });
      var eventsList = originalEventList.slice(0);

      // var officeList = campaignOffices.map(function(d) { return new CampaignOffices(d); });

      // var mapboxTiles = leaflet.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + leaflet.mapbox.accessToken, { attribution: '<a href="http://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'});

      var mapboxTiles = leaflet.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
              maxZoom: 18,
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
            });

      var CAMPAIGN_OFFICE_ICON = L.icon({
          iconUrl: '/images/icon/star.png',
          iconSize:     [17, 14], // size of the icon
          // shadowSize:   [50, 64], // size of the shadow
          // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
          // shadowAnchor: [4, 62],  // the same for the shadow
          // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
      });
      var GOTV_CENTER_ICON = L.icon({
          iconUrl: '/images/icon/gotv-star.png',
          iconSize:     [13, 10], // size of the icon
      });
      var defaultCoord = options&&options.defaultCoord ? options.defaultCoord : {center: [37.8, -96.9], zoom: 4};

      var centralMap =  new leaflet
                            .Map("map-container", window.customMapCoord ? window.customMapCoord : defaultCoord)
                            .addLayer(mapboxTiles);
      if(centralMap) {}

      var overlays = L.layerGroup().addTo(centralMap);
      var offices = L.layerGroup().addTo(centralMap);
      var gotvCenter = L.layerGroup().addTo(centralMap);

      var campaignOfficeLayer = L.layerGroup().addTo(centralMap);

      //initialize map
      var filteredEvents = [];
      var module = {};


      var _popupEvents = function(event) {
        var target = event.target._latlng;


        var filtered = eventsList.filter(function(d) {

          return target.lat == d.props.LatLng[0] &&
                 target.lng == d.props.LatLng[1] &&
                 (!current_filters || current_filters.length == 0
                    || $(d.props.filters).not(current_filters).length != d.props.filters.length);
        }).sort(function(a, b) { return b.props.total_accepted - a.props.total_accepted; });

        var div = $("<div />")
          .append(filtered.length > 1 ? "<h3 class='sched-count'>" + filtered.length + " Results</h3>" : "")
          .append(
          $("<div class='popup-list-container'/>")
            .append($("<ul class='popup-list'>")
              .append(
                filtered.map(function(d) {
                  return $("<li class=montserrat/>")
                            .attr('data-attending', (function(prop) {
                                var email = Cookies.get('map.bernie.email');
                                var events_attended_raw = Cookies.get('map.bernie.eventsJoined.' + email);
                                var events_attended = events_attended_raw ? JSON.parse(events_attended_raw) : [];
                                return $.inArray(prop.id_obfuscated, events_attended) > -1;

                              })(d.props))
                            .addClass(d.isFull?"is-full":"not-full")
                            .addClass(d.visible ? "is-visible" : "not-visible")
                            .append(d.render());
                })
              )
            )
          );

        setTimeout(
          function() { L.popup()
            .setLatLng(event.target._latlng)
            .setContent(div.html())
            .openOn(centralMap);
          }
        , 100);
      };

    /***
     * Initialization
     */
    var initialize = function() {
      var uniqueLocs = eventsList.reduce(function(arr, item){
        var className = item.props.filters.join(" ");
        if ( arr.indexOf(item.props.lat + "||" + item.props.lng + "||" + className + '||' + item.props.total_accepted) >= 0 ) {
          return arr;
        } else {
          arr.push(item.props.lat  + "||" +  item.props.lng + "||" + className + '||' + item.props.total_accepted);
          return arr;
        }
      }, []);

      uniqueLocs = uniqueLocs.map(function(d) {
        var split = d.split("||");
        return { latLng: [ parseFloat(split[0]), parseFloat(split[1])],
                 className: split[2], total_accepted: split[3] };
      });

      uniqueLocs.forEach(function(item) {
          if(item.total_accepted > 2000 && item.className == 'event' ) {
            L.marker(item.latLng, {icon: new L.Icon({
              iconUrl: '/images/pin.png',
              iconRetinaUrl: '/images/pin-2x.png',
              iconSize: [25, 41],
              className: item.className
            })})
              .on('click', function(e) { _popupEvents(e); })
              .addTo(overlays);
          } else if (item.className == 'event') {
            L.circleMarker(item.latLng, { radius: 5, className: item.className, color: 'white', fillColor: '#ec3659', opacity: 0.8, fillOpacity: 0.7, weight: 2 })
              .on('click', function(e) { _popupEvents(e); })
              .addTo(overlays);
          } else if (item.className == 'group-meeting') {
            L.circleMarker(item.latLng, { radius: 5, className: item.className, color: 'white', fillColor: 'black', opacity: 0.8, fillOpacity: 0.7, weight: 2 })
              .on('click', function(e) { _popupEvents(e); })
              .addTo(overlays);
          }
          else if (item.className == 'group') {
            L.circleMarker(item.latLng, { radius: 4, className: item.className, color: 'white', fillColor: 'lightgray', opacity: 0.6, fillOpacity: 0.9, weight: 2 })
            .on('click', function(e) { _popupEvents(e); })
            .addTo(overlays);
          } else {
            L.circleMarker(item.latLng, { radius: 5, className: item.className, color: 'white', fillColor: '#a00003', opacity: 0.8, fillOpacity: 0.7, weight: 2 })
              .on('click', function(e) { _popupEvents(e); })
              .addTo(overlays);
          }
        // }, 10);
      });



      // $(".leaflet-overlay-pane").find(".bernie-event").parent().prependTo('.leaflet-zoom-animated');

    }; // End of initialize

    var toMile = function(meter) { return meter * 0.00062137; };

    var filterEventsByCoords = function (center, distance, filterTypes) {

      var zipLatLng = leaflet.latLng(center);

      var filtered = eventsList.filter(function(d) {
        var dist = toMile(zipLatLng.distanceTo(d.props.LatLng));

        if (dist < distance) {

          d.distance = Math.round(dist*10)/10;

          //If no filter was a match on the current filter
          if (options && options.defaultCoord && !filterTypes) {
            return true;
          }

          if($(d.props.filters).not(filterTypes).length == d.props.filters.length) {
            return false;
          }

          return true;
        }
        return false;
      });

      return filtered;
    };

    var filterEvents = function (zipcode, distance, filterTypes) {
      return filterEventsByCoords([parseFloat(zipcode.lat), parseFloat(zipcode.lon)], distance, filterTypes)
    };

    var sortEvents = function(filteredEvents, sortType) {
      switch (sortType) {
        case 'distance':
          ga('send', 'event', 'Sort', 'type', 'distance');
          filteredEvents = filteredEvents.sort(function(a,b) { return a.distance - b.distance; });
          break;
        case 'attendance':
          ga('send', 'event', 'Sort', 'type', 'attendance');
          filteredEvents = filteredEvents.sort(function(a,b) { return b.props.total_accepted - a.props.total_accepted; });
          break;
        default:
          ga('send', 'event', 'Sort', 'type', 'time');
          filteredEvents = filteredEvents.sort(function(a,b) { return a.props.start_time - b.props.start_time; });
          break;
      }

      // filteredEvents = filteredEvents.sort(function(a, b) {
      //   var aFull = a.isFull();
      //   var bFull = b.isFull();

      //   if (aFull && bFull) { return 0; }
      //   else if (aFull && !bFull) { return 1; }
      //   else if (!aFull && bFull) { return -1; }
      // });
      //sort by fullness;
      //..
      return filteredEvents;
    };

    setTimeout(function(){
       initialize();
    }, 10);


    module._eventsList = eventsList;
    module._zipcodes = zipcodes;
    module._options = options;

    /*
    * Refresh map with new events map
    */
    var _refreshMap = function() {
      overlays.clearLayers();
      initialize();

    };

    module.filterByType = function(type) {
      if ($(filters).not(type).length != 0 || $(type).not(filters).length != 0) {
        current_filters = type;

        //Filter only items in the list
        // eventsList = originalEventList.filter(function(eventItem) {
        //   var unmatch = $(eventItem.properties.filters).not(filters);
        //   return unmatch.length != eventItem.properties.filters.length;
        // });



      // var target = type.map(function(i) { return "." + i }).join(",");
      // $(".leaflet-overlay-pane").find("path:not("+type.map(function(i) { return "." + i }).join(",") + ")")

      var toHide = $(allFilters).not(type);

      if (toHide && toHide.length > 0) {
        toHide = toHide.splice(0,toHide.length);
        $(".leaflet-overlay-pane").find("." + toHide.join(",.")).hide();
        $(".leaflet-marker-pane").find("." + toHide.join(",.")).hide();
      }

      if (type && type.length > 0) {
        $(".leaflet-overlay-pane").find("." + type.join(",.")).show();
        $(".leaflet-marker-pane").find("." + type.join(",.")).show();
        // _refreshMap();
      }

      //Specifically for campaign office
      if (!type) {
        centralMap.removeLayer(offices);
      } else if (type &&  type.indexOf('campaign-office') < 0) {
        centralMap.removeLayer(offices);
      } else {
        centralMap.addLayer(offices);
      }

      //For gotv-centers
      if (!type) {
        centralMap.removeLayer(gotvCenter);
      } else if (type &&  type.indexOf('gotv-center') < 0) {
        centralMap.removeLayer(gotvCenter);
      } else {
        centralMap.addLayer(gotvCenter);
      }
    }
    return;
  };

    module.filterByCoords = function(coords, distance, sort, filterTypes) {
      //Remove list
      d3.select("#event-list")
        .selectAll("li").remove();

      var filtered = filterEventsByCoords(coords, parseInt(distance), filterTypes);
      //Sort event
      filtered = sortEvents(filtered, sort, filterTypes);

      //Check cookies
      var email = Cookies.get('map.bernie.email');
      var events_attended_raw = Cookies.get('map.bernie.eventsJoined.' + email);
      var events_attended = events_attended_raw ? JSON.parse(events_attended_raw) : [];

      //Render event
      var eventList = d3.select("#event-list")
        .selectAll("li")
        .data(filtered, function(d){ return d.props.browser_url; });

        eventList.enter()
          .append("li")
          .attr("data-attending", function(d, id) {  return $.inArray(d.props.id_obfuscated, events_attended) > -1;  })
          .attr("class", function(d) { return (d.isFull ? 'is-full' : 'not-full') + " " + (this.visible ? "is-visible" : "not-visible")})
          .classed("lato", true)
          .html(function(d){ return d.render(d.distance); });

        eventList.exit().remove();

      //add a highlighted marker
      function addhighlightedMarker(lat,lon){
        var highlightedMarker = new L.circleMarker([lat,lon],{radius: 5, color: '#ea504e', fillColor: '#1462A2', opacity: 0.8, fillOpacity: 0.7, weight: 2}).addTo(centralMap);
        // event listener to remove highlighted markers
        $(".not-full").mouseout(function(){
          centralMap.removeLayer(highlightedMarker)
        })
      }

      // event listener to get the mouseover
      $(".not-full" ).mouseover(function(){
            $(this).toggleClass("highlight")
            var cMarkerLat = $(this).children('div').attr('lat')
            var cMarkerLon = $(this).children('div').attr('lon')
            // function call to add highlighted marker
            addhighlightedMarker(cMarkerLat,cMarkerLon);
        })

      //Push all full items to end of list
      $("div#event-list-container ul#event-list li.is-full").appendTo("div#event-list-container ul#event-list");

      //Move campaign offices to

      var officeCount = $("div#event-list-container ul#event-list li .campaign-office").length;
      $("#hide-show-office").attr("data-count", officeCount);
      $("#campaign-off-count").text(officeCount);
      $("section#campaign-offices ul#campaign-office-list *").remove();
      $("div#event-list-container ul#event-list li .campaign-office").parent().appendTo("section#campaign-offices ul#campaign-office-list");

    }

    /***
     * FILTER()  -- When the user submits query, we will look at this.
     */
    module.filter = function(zipcode, distance, sort, filterTypes) {
      //Check type filter

      if (!zipcode || zipcode == "") { return; };

      //Start if other filters changed
      var targetZipcode = zipcodes[zipcode];

      //Remove list
      d3.select("#event-list")
        .selectAll("li").remove();

      if (targetZipcode == undefined || !targetZipcode) {
        $("#event-list").append("<li class='error lato'>Zipcode does not exist. <a href=\"https://go.berniesanders.com/page/event/search_results?orderby=zip_radius&zip_radius%5b0%5d=" + zipcode + "&zip_radius%5b1%5d=100&country=US&radius_unit=mi\">Try our events page</a></li>");
        return;
      }

      //Calibrate map
      var zoom = 4;
      switch(parseInt(distance))
      {
        case 5 : zoom = 12; break;
        case 10: zoom = 11; break;
        case 20: zoom = 10; break;
        case 50: zoom = 9; break;
        case 100: zoom = 8; break;
        case 250: zoom = 7; break;
        case 500: zoom = 5; break;
        case 750: zoom = 5; break;
        case 1000: zoom = 4; break;
        case 2000: zoom = 4; break;
        case 3000: zoom = 3; break;
      }
      if (!(targetZipcode.lat && targetZipcode.lat != "")) {
        return;
      }

      if (current_zipcode != zipcode || current_distance != distance) {
        current_zipcode = zipcode;
        current_distance = distance;
        centralMap.setView([parseFloat(targetZipcode.lat), parseFloat(targetZipcode.lon)], zoom);
      }

      ga('send', 'event', 'Range', 'distance', parseInt(distance));

      var filtered = filterEvents(targetZipcode, parseInt(distance), filterTypes);


      //Sort event
      filtered = sortEvents(filtered, sort, filterTypes);

      //Check cookies
      var email = Cookies.get('map.bernie.email');
      var events_attended_raw = Cookies.get('map.bernie.eventsJoined.' + email);
      var events_attended = events_attended_raw ? JSON.parse(events_attended_raw) : [];

      //Render event
      var eventList = d3.select("#event-list")
        .selectAll("li")
        .data(filtered, function(d){ return d.props.browser_url; });

        eventList.enter()
          .append("li")
          .attr("data-attending", function(d, id) {  return $.inArray(d.props.address + ' ' + d.props.start_date, events_attended) > -1;  })
          .attr("class", function(d) { return (d.isFull ? 'is-full' : 'not-full') + " " + (this.visible ? "is-visible" : "not-visible")})
          .classed("lato", true)
          .html(function(d){ return d.render(d.distance); });

        eventList.exit().remove();

			//add a highlighted marker
    	function addhighlightedMarker(lat,lon){
    		var highlightedMarker = new L.circleMarker([lat,lon],{radius: 5, color: '#ea504e', fillColor: '#1462A2', opacity: 0.8, fillOpacity: 0.7, weight: 2}).addTo(centralMap);
    		// event listener to remove highlighted markers
    		$(".not-full").mouseout(function(){
    			centralMap.removeLayer(highlightedMarker)
    		})
    	}

    	// event listener to get the mouseover
  		$(".not-full" ).mouseover(function(){
  					$(this).toggleClass("highlight")
  					var cMarkerLat = $(this).children('div').attr('lat')
  					var cMarkerLon = $(this).children('div').attr('lon')
  					// function call to add highlighted marker
  					addhighlightedMarker(cMarkerLat,cMarkerLon);
        })

      //Push all full items to end of list
      $("div#event-list-container ul#event-list li.is-full").appendTo("div#event-list-container ul#event-list");

      //Move campaign offices to

      var officeCount = $("div#event-list-container ul#event-list li .campaign-office").length;
      $("#hide-show-office").attr("data-count", officeCount);
      $("#campaign-off-count").text(officeCount);
      $("section#campaign-offices ul#campaign-office-list *").remove();
      $("div#event-list-container ul#event-list li .campaign-office").parent().appendTo("section#campaign-offices ul#campaign-office-list");

    };

    module.toMapView = function () {
      $("body").removeClass("list-view").addClass("map-view");
      centralMap.invalidateSize();
      centralMap._onResize();
    }
    module.toListView = function () {
      $("body").removeClass("map-view").addClass("list-view");
    }

    module.getMap = function() {
      return centralMap;
    }

    return module;
  });

})(jQuery, d3, L);

var VotingInfoManager = (function($) {
  return (function(votingInfo) {
    var votingInfo = votingInfo;
    var module = {};

    function buildRegistrationMessage(state) {
      var $msg = $("<div class='registration-msg'/>").append($("<h3/>").text("Registration deadline: " + moment(new Date(state.registration_deadline)).format("MMM D")))
                    .append($("<p />").html(state.name + " has <strong>" + state.is_open + " " + state.type + "</strong>. " + state.you_must))
                    .append($("<p />").html("Find out where and how to register at <a target='_blank' href='https://vote.berniesanders.com/" + state.state + "'>vote.berniesanders.com</a>"))

      return $msg;
    }

    function buildPrimaryInfo(state) {

      var $msg = $("<div class='registration-msg'/>").append($("<h3/>").text("Primary day: " + moment(new Date(state.voting_day)).format("MMM D")))
                    .append($("<p />").html(state.name + " has <strong>" + state.is_open + " " + state.type + "</strong>. "  + state.you_must))
                    .append($("<p />").html("Find out where and how to vote at <a target='_blank' href='https://vote.berniesanders.com/" + state.state + "'>vote.berniesanders.com</a>"))

      return $msg;

    }

    function buildCaucusInfo(state) {
      var $msg = $("<div class='registration-msg'/>").append($("<h3/>").text("Caucus day: " + moment(new Date(state.voting_day)).format("MMM D")))
                    .append($("<p />").html(state.name + " has <strong>" + state.is_open + " " + state.type + "</strong>. " + state.you_must))
                    .append($("<p />").html("Find out where and how to caucus at <a target='_blank' href='https://vote.berniesanders.com/" + state.state + "'>vote.berniesanders.com</a>"))

      return $msg;
    }

    module.getInfo = function(state) {
      var targetState = votingInfo.filter(function(d) { return d.state == state })[0]; //return first
      if(!targetState) return null;

      var today = new Date();
      today.setDate(today.getDate() - 1);

      if(today <= new Date(targetState.registration_deadline)) {
        return buildRegistrationMessage(targetState);
      } else if (today <= new Date(targetState.voting_day)) {
        if (targetState.type == "primaries") {
          return buildPrimaryInfo(targetState);
        } else { //
          return buildCaucusInfo(targetState);
        }
      } else {
        return null;
      }
    }

    return module;
  });
})(jQuery);

// More events
(function($) {
  $(document).on("click", function(event, params) {
    $(".event-rsvp-activity").hide();
  });

  $(document).on("click", ".rsvp-link, .event-rsvp-activity", function(event, params) {
    event.stopPropagation();
  });

  //Show email
  $(document).on("show-event-form", function(events, target) {
    var form = $(target).closest(".event-item").find(".event-rsvp-activity");
      if (Cookies.get('map.bernie.email')) {
        form.find("input[name=email]").val(Cookies.get('map.bernie.email'));
      }

      if (Cookies.get('map.bernie.phone')) {
        form.find("input[name=phone]").val(Cookies.get('map.bernie.phone'));
      }

      // var params =  $.deparam(window.location.hash.substring(1) || "");
      // form.find("input[name=zipcode]").val(params.zipcode ? params.zipcode : Cookies.get('map.bernie.zipcode'));

      form.fadeIn(100);
  });

  $(document).on("submit", "form.event-form", function() {
    var query = $.deparam($(this).serialize());
    var params = $.deparam(window.location.hash.substring(1) || "");
    query['zipcode'] = params['zipcode'] || query['zipcode'];



    var $error = $(this).find(".event-error");
    var $container = $(this).closest(".event-rsvp-activity");

    if (query['has_shift'] == 'true' && (!query['shift_id'] || query['shift_id'].length == 0)) {
      $error.text("You must pick a shift").show();
      return false;
    }

    var shifts = null;
    var guests = 0;
    if (query['shift_id']) {
      shifts = query['shift_id'].join();
    }

    if (!query['phone'] || query['phone'] == '') {
      $error.text("Phone number is required").show();
      return false;
    }

    if (!query['email'] || query['email'] == '') {
      $error.text("Email is required").show();
      return false;
    }

    if (!query['email'].toUpperCase().match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/)) {
      $error.text("Please input valid email").show();
      return false;
    }

    // if (!query['name'] || query['name'] == "") {
    //   $error.text("Please include your name").show();
    //   return false;
    // }

    $(this).find(".event-error").hide();
    var $this = $(this)
    $.ajax({
      type: 'POST',
      url: 'https://organize.berniesanders.com/events/add-rsvp',
      // url: 'https://bernie-ground-control-staging.herokuapp.com/events/add-rsvp',
      crossDomain: true,
      dataType: 'json',
      data: {
        // name: query['name'],
        phone: query['phone'],
        email: query['email'],
        zip: query['zipcode'],
        shift_ids: shifts,
        event_id_obfuscated: query['id_obfuscated']
      },
      success: function(data) {
        Cookies.set('map.bernie.zipcode', query['zipcode'], {expires: 7});
        Cookies.set('map.bernie.email', query['email'], {expires: 7});
        Cookies.set('map.bernie.name', query['name'], {expires: 7});

        if (query['phone'] != '') {
          Cookies.set('map.bernie.phone', query['phone'], {expires: 7});
        }

        //Storing the events joined
        var events_joined = JSON.parse(Cookies.get('map.bernie.eventsJoined.' + query['email']) || "[]") || [];

        events_joined.push(query['id_obfuscated']);
        Cookies.set('map.bernie.eventsJoined.' + query['email'], events_joined, {expires: 7});


        $this.closest("li").attr("data-attending", true);

        $this.html("<h4 style='border-bottom: none'>RSVP Successful! Thank you for joining to this event!</h4>");
        $container.delay(1000).fadeOut('fast')
      }
    })


    return false;
  });
})(jQuery);
