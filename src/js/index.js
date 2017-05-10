import '../sass/pplsmap/events-map.scss';
import jQuery from 'jquery';
import deparam from 'deparam';
import * as d3 from 'd3';
import MapManager from './MapManager';
import * as Cookies from 'js-cookie';
import Api from './api';
jQuery.deparam = deparam;
var $ = jQuery;
import ReactDOM from 'react-dom'
import React from 'react'
import NewEventForm from './NewEventForm'
window.$ = jQuery;


$(() => {
  const $modalPortal = $('<div id="modalPortal"></div>')
  $('body').append($modalPortal)
  const onClose = () => setTimeout(() => ReactDOM.unmountComponentAtNode($modalPortal[0]))
  $('#newEvent').on('click', () => {
    ReactDOM.render(<NewEventForm candidate="Test Candidate" onRequestClose={onClose} />, $modalPortal[0])
  })
})

var date = new Date();
$("#loading-icon").show();
Api.get.events().then((data) => {
  window.EVENT_DATA = data;
  console.log(data);
  d3.csv('//d1y0otadi3knf6.cloudfront.net/d/us_postal_codes.gz',
   function(zipcodes) {
     $("#loading-icon").hide();
    //Clean data
    window.EVENT_DATA.forEach(function(d) {
      d.filters = [];
      //Set filter info
      switch(d.event_type) {
        case "Facebook Event": d.filters.push('facebook-event'); break;
        case "Event": d.filters.push('event'); break;
        case "Group Meeting": d.filters.push('group-meeting'); break;
        case "Group": d.filters.push("group"); break;
        default: d.filters.push('other'); break;
      }

      d.is_official = d.is_official == "1";
      if (d.is_official) { d.filters.push("official-event"); }
    });

    var oldDate = new Date();

    /* Extract default lat lon */
    var m = /.*\?c=(.+?),(.+?),(\d+)z#?.*/g.exec(window.location.href)
    if (m && m[1] && m[2] && m[3]) {
      var defaultCoord = {
        center: [parseFloat(m[1]), parseFloat(m[2])],
        zoom: parseInt(m[3])
      };
      window.mapManager = MapManager(window.EVENT_DATA, campaignOffices, zipcodes, { defaultCoord: defaultCoord });
      var params = $.deparam
      window.mapManager.filterByCoords(defaultCoord.center, 50, params.sort, params.f);
    } else {
      window.mapManager = MapManager(window.EVENT_DATA, null, zipcodes);
    }

    if($("input[name='zipcode']").val() == '' && Cookies.get('map.bnc.zipcode') && window.location.hash == '') {
      $("input[name='zipcode']").val(Cookies.get('map.bnc.zipcode'));
      window.location.hash = $("#filter-form").serialize();
    } else {
      $(window).trigger("hashchange");
    }
  });
});


 /** initial loading before activating listeners...
  */

 var params = $.deparam(window.location.hash.substring(1));
  if (params.zipcode) {
    $("input[name='zipcode']").val(params.zipcode);
  }

  if (params.distance) { $("select[name='distance']").val(params.distance);}
  if (params.sort) { $("select[name='sort']").val(params.sort);}

/* Prepare filters */
$("#filter-list").append(
  window.eventTypeFilters.map(function(d) {
    return $("<li />")
              .append(
                $("<input type='checkbox' class='filter-type' />")
                    .attr('name', 'f[]')
                    .attr("value", d.id)
                    .attr("id", d.id)
                    .prop("checked", !params.f ? true : $.inArray(d.id, params.f) >= 0)
              )
              .append($("<label />").attr('for', d.id).append($("<span />").addClass('filter-on')
                        .append(d.onItem ? d.onItem : $("<span>").addClass('circle-button default-on')))
              .append($("<span />").addClass('filter-off')
                        .append(d.offItem ? d.offItem : $("<span>").addClass('circle-button default-off')))
                        .append($("<span>").text(d.name)));
  })
);
/***
 *  define events
 */
 //only numbers
 $("input[name='zipcode']").on('keyup keydown', function(e) {
  if (e.type == 'keydown' && (e.keyCode < 48 || e.keyCode > 57)
      && e.keyCode != 8 && !(e.keyCode >= 37 || e.keyCode <= 40)) {
    return false;
  }

  if (e.type == 'keyup' && $(this).val().length == 5) {
    if (! (e.keyCode >= 37 && e.keyCode <= 40) ) {
      $(this).closest("form#filter-form").submit();
      $("#hidden-button").focus();
    }
  }
 });

 /***
  *  onchange of select
  */
  $("select[name='distance'],select[name='sort']").on('change', function(e) {
    $(this).closest("form#filter-form").submit();
  });

  /**
  * On filter type change
  */
  $(".filter-type").on('change', function(e) {
    $(this).closest("form#filter-form").submit();
  })

  $("#search").on('change', function(e) {
    $(this).closest("form#filter-form").submit();
  })

 //On submit
 $("form#filter-form").on('submit', function(e) {
  var serial = $(this).serialize();
  window.location.hash = serial;
  e.preventDefault();
  return false;
 });

 $(window).on('hashchange', function(e) {

  var hash = window.location.hash;
  if (hash.length == 0 || hash.substring(1) == 0) { $("#loading-icon").hide(); return false; }

  var params = $.deparam(hash.substring(1));

  //Custom feature for specific default lat/lon
  //lat=40.7415479&lon=-73.8239609&zoom=17

  setTimeout(function() {
    $("#loading-icon").show();

    if ( window.mapManager._options && window.mapManager._options.defaultCoord && params.zipcode.length != 5) {
      window.mapManager.filterByType(params.f);
      window.mapManager.filterByCoords(window.mapManager._options.defaultCoord.center, params.distance, params.sort, params.f);
    } else {
      window.mapManager.filterByType(params.f);
      window.mapManager.filter(params.zipcode, params.distance, params.sort, params.f);
      ga('send', 'event', 'Filter', 'zipcode', params.zipcode);
    }
    $("#loading-icon").hide();

    // var $info = window.votingInfoManager.getInfo(window.mapManager._zipcodes[params.zipcode].state);
    // $(".registration-msg").remove();
    // if ($info) {
    //   $info.prependTo("#event-list-container");
    // }

  }, 10);
  // $("#loading-icon").hide();
  if (params.zipcode.length == 5 && $("body").hasClass("initial-view")) {
    $("#events").removeClass("show-type-filter");
    $("body").removeClass("initial-view");
  }
 });

  var pre = $.deparam(window.location.hash.substring(1));
  if ($("body").hasClass("initial-view")) {
    if ($(window).width() >= 600 && (!pre.zipcode || pre && pre.zipcode.length != 5)) {
      $("#events").addClass("show-type-filter");
    }
  }
