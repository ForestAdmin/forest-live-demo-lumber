import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { observer } from '@ember/object';
import $ from 'jquery';
import SmartViewMixin from 'client/mixins/smart-view-mixin';

export default Component.extend(SmartViewMixin, {
  store: service(),

  tagName: '',

  map: null,
  loaded: false,

  init(...args) {
    this._super(...args);

    this.loadPlugin();
  },

  didInsertElement() {
    this.displayMap();
  },

  onRecordsChange: observer('records.[]', function () {
    this.displayMap();
  }),

  loadPlugin() {
    scheduleOnce('afterRender', this, () => {
      $.getScript('//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet.js', () => {
        $.getScript('//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.2/leaflet.draw.js', () => {
          this.set('loaded', true);
          this.displayMap();
        });
      });

      const headElement = document.getElementsByTagName('head')[0];
      const cssLeafletLink = document.createElement('link');
      cssLeafletLink.type = 'text/css';
      cssLeafletLink.rel = 'stylesheet';
      cssLeafletLink.href = '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/leaflet.css';

      headElement.appendChild(cssLeafletLink);

      const cssDrawLink = document.createElement('link');
      cssDrawLink.type = 'text/css';
      cssDrawLink.rel = 'stylesheet';
      cssDrawLink.href = '//cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.2/leaflet.draw.css';

      headElement.appendChild(cssDrawLink);
    });
  },

  displayMap() {
    if (!this.loaded) { return; }

    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }

    const markers = [];

    this.records.forEach(function (record) {
      markers.push([
        record.get('forest-lat'),
        record.get('forest-lng'),
        record.get('id'),
      ]);
    });

    this.map = new L.Map('map');

    const osmUrl = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
    const osmAttrib = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
    const osm = new L.TileLayer(osmUrl, { attribution: osmAttrib });
    const drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: true
      },
      edit: {
        featureGroup: drawnItems
      },
    });

    this.map.setView(new L.LatLng(48.8566, 2.3522), 2);
    this.map.addLayer(osm);
    this.map.addControl(drawControl);

    this.map.on(L.Draw.Event.CREATED, (event) => {
      const { layer, layerType: type } = event;

      if (type === 'marker') {
        const coordinates = event.layer.getLatLng();
        const newRecord = this.store.createRecord('forest_delivery', {
          'forest-is_delivered': false,
          'forest-lng': coordinates.lng,
          'forest-lat': coordinates.lat
        });

        newRecord.save()
          .then((savedRecord) => {
            layer.on('click', () => {
              this.router.transitionTo(
                'rendering.data.collection.list.viewEdit.details',
                this.collection.id,
                savedRecord.id,
              );
            });
          });
      }

      this.map.addLayer(layer);
    });

    this.addMarkers(markers);
  },

  addMarker(marker) {
    const lat = parseFloat(marker[0]);
    const long = parseFloat(marker[1]);

    const recordId = marker[2];
    marker = L.marker([lat, long])
      .addTo(this.map);

    marker.on('click', () => {
      this.router.transitionTo(
        'rendering.data.collection.list.viewEdit.details',
        this.get('collection.id'),
        recordId,
      );
    });
  },

  addMarkers(markers) {
    markers.forEach(marker => this.addMarker(marker));
  },
});
