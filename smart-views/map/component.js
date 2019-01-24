'use strict';
import Ember from 'ember';

export default Ember.Component.extend({
  tagName: '',
  map: null,
  loaded: false,
  loadPlugin: function() {
    var that = this;
    Ember.run.scheduleOnce('afterRender', this, function () {
      Ember.$.getScript('//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet.js', function () {
        that.set('loaded', true);
      });

      var cssLink = $('<link>');
      $('head').append(cssLink);

      cssLink.attr({
        rel:  'stylesheet',
        type: 'text/css',
        href: '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet.css'
      });
    });
  }.on('init'),
  displayMap: function () {
    if (!this.get('loaded')) { return; }

    var markers = [];
    $('#map_canvas').height($('.l-content').height());

    this.get('records').forEach(function (record) {
      markers.push([record.get('forest-lat'), record.get('forest-lng'), record.get('id')]);
    });

    this.map = new L.Map('map');

    var osmUrl='https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
    var osmAttrib='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
    var osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });

    this.map.setView(new L.LatLng(48.8566, 2.3522), 2);
    this.map.addLayer(osm);

    this.addMarker(markers);
  }.observes('records.[]', 'loaded').on('didInsertElement'),
  addMarker: function (markers) {
    var that = this;

    markers.forEach(function (marker) {
      var lat = parseFloat(marker[0]);
      var lng = parseFloat(marker[1]);

      var recordId = marker[2];
      var record = that.get('records').findBy('id', recordId);
      marker = L.marker([lat, lng]).addTo(that.map);

      marker.on('click', function () {
        that.get('router')
          .transitionTo('rendering.data.collection.list.viewEdit.details',
            that.get('collection.id'), recordId);
      });

      setInterval(function () {
        marker.setLatLng(new L.latLng(lat -= 0.0001, lng -= 0.0001));
      }, Math.floor(Math.random() * 2000) + 300);
    });
  }
});
