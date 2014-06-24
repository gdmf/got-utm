var map;

$(document).ready(function() {

    map = L.map('map', {worldCopyJump: true}).setView([40, -98], 4);
    var hash = new L.Hash(map);

    // generate utm zones (an array of arrays -- [id, west longitude, east longitude])
    var utmZones = _.zip(_.range(1, 61), _.range(-180, 180, 6), _.range(-174, 186, 6));

      
    // var utmLines = L.graticule({
    //   style: {
    //     color: '#39F',
    //     weight: 1,
    //     opacity: 1
    //   },
    //   interval: 6
    // })
    
    $.getJSON($('link[rel="points"]').attr("href"), function(data) {
      var utm_zone_json = data;
      var utm_layer = L.geoJson(utm_zone_json, {
        style: utm_style,
      });
      utm_layer.addTo(map);

      var baseLayers = [
        'OpenStreetMap.Mapnik',
        'Esri.WorldImagery',
        'Esri.WorldStreetMap',
        'Esri.NatGeoWorldMap',
        'Esri.USATopoMaps'];
      
      // utmLines.addTo(map);
      
      var overlay = {"UTM Zones": utm_layer};
      
      var layerControl = L.control.layers.provided(baseLayers, overlay, {collapsed: false}).addTo(map);

      displayUTMcoords(map, utmZones);

      map.on('move', function() {
        displayUTMcoords(map, utmZones);
      })
    });



    function utm_style(feature) {
      if (parseInt((feature.properties.ZONE).slice(0,-1)) % 2 == 0) {
        return {
          weight: 0.75,
          color: 'blue',
          opacity: 0.2,
          fillColor: 'blue',
          fillOpacity: 0.2,
        }
      } else {
        return {
          weight: 0.75,
          color: 'blue',
          opacity: 0.2,
          fillColor: 'blue',
          fillOpacity: 0.0,
        }
      }
    }



    function displayUTMcoords(map, utmZones) {
      var x = map.getCenter().lng
        , y = map.getCenter().lat
        , wgs_p = new Proj4js.Point(x, y);
//        , nad_p = new Proj4js.Point(x, y);
      var z = getUTMzone(x);

      // zero-pad utm zone
      if (z < 10) {
        var zString = "0" + z.toString();
      } else {
        var zString = z.toString();
      }

      // transform point coordinates
      var wgs_name = "EPSG:326" + zString;
      var wgs_text = "+title=WGS84 / UTM zone " + zString + "N +proj=utm +zone=" + zString + " +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
      Proj4js.defs[wgs_name] = wgs_text;

//      var nad_name = "EPSG:269" + zString;
      //console.log(def_name)
//      var nad_text = "+title=NAD83 / UTM zone " + zString + "N +proj=utm +zone=" + zString + " +ellps=GRS80 +datum=NAD83 +units=m +no_defs";
//      Proj4js.defs[nad_name] = nad_text;

      var source = new Proj4js.Proj("EPSG:4326");    //lat long
      var wgs_dest = new Proj4js.Proj(wgs_name);     //UTM
//      var nad_dest = new Proj4js.Proj(nad_name);
      var wgs_transformed = Proj4js.transform(source, wgs_dest, wgs_p);  //x and y are modified in place
//      var nad_transformed = Proj4js.transform(source, nad_dest, nad_p);  //x and y are modified in place

      // display point coordinates
      latlon_content = "Lon: <span>" + parseFloat(x).toFixed(7) + "</span><br/>Lat: &nbsp;<span>" + parseFloat(y).toFixed(6) + "</span>";
      $("div#latlon > p").html(latlon_content);
      wgsutm_content = "&nbsp;Easting: &nbsp;<span>" + parseFloat(wgs_transformed.x).toFixed(1) + "</span><br/>Northing: <span>" + parseFloat(wgs_transformed.y).toFixed(1) + "</span>"; // + "<br/>UTM zone: " + getUTMzone(x);
      $("div#wgsutm > p").html(wgsutm_content);
      //nadutm_content = "Easting: " + parseFloat(nad_transformed.x).toFixed(1) + "<br/>Northing: " + parseFloat(nad_transformed.y).toFixed(1) + "<br/>UTM zone: " + getUTMzone(x);
      //$("div#nadutm > p").html(nadutm_content);
      $("div#zone > p").html("Zone <span>" + getUTMzone(x) + "</span>");
    }

    function getUTMzone(longitude) {
      var utmZone; 
      _.forEach(utmZones, function(zone) {
        if (longitude > zone[1] && longitude <= zone[2]) {
          utmZone = zone[0];
        }
      });
      return utmZone;
    }

    $("#search-input").keyup(function(e){
      if (e.keyCode == 13 || e.which == 13){
        $("#search-button").click();
      }
    });
    
    $("#search-button").click(function(){
        mapZoom($("#search-input").val(), 8);
    });

    $("#reset-button").click(function() {
        map.setView([40, -98], 4);
    });

    function mapZoom(input_coords, zoomLevel) {
        var coords = input_coords.split(",");
        var lat = parseFloat($.trim(coords[0]));
        var lng = parseFloat($.trim(coords[1]));
        var latlng = L.latLng([lat, lng]);
        map.setView(latlng, zoomLevel, {animate: true});
    }
});

