'use strict';
import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service('store'),
  loaded: false,
  loadPlugin: function() {
    var that = this;
    Ember.run.scheduleOnce('afterRender', this, function () {
      Ember.$.getScript('//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.1.0/fullcalendar.min.js', function () {
        that.set('loaded', true);

        $('#calendar').fullCalendar({
          allDaySlot: false,
          minTime: '00:00:00',
          eventClick: function (event, jsEvent, view) {
            that.get('router')
              .transitionTo('rendering.data.collection.list.viewEdit.details',
                that.get('collection.id'), event.id);
          },
          viewRender: function(view, element) {
            let params = {
              filter: {
                'start_date': '>' + view.start.toISOString() +
                                ',<' + view.end.toISOString()
              },
              filterType: 'and',
              timezone: 'America/Los_Angeles',
              'page[number]': 1,
              'page[size]': 50
            };

            that.get('store')
              .query('forest_appointment', params)
              .then((appointments) => {
                that.set('appointments', appointments);
              });
          }
        });
      });

      var cssLink = $('<link>');
      $('head').append(cssLink);

      cssLink.attr({
        rel:  'stylesheet',
        type: 'text/css',
        href: '//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.1.0/fullcalendar.min.css'
      });
    });
  }.on('init'),
  setEvent: function () {
    if (!this.get('appointments')) { return; }

    var events = [];
    $('#calendar').fullCalendar('removeEvents');

    this.get('appointments').forEach(function (appointment) {
			var event = {
				id: appointment.get('id'),
				title: appointment.get('forest-name'),
				start: appointment.get('forest-start_date'),
 				end: appointment.get('forest-end_date')

			};

			$('#calendar').fullCalendar('renderEvent', event, true);
		});
  }.observes('loaded', 'appointments.[]')
});


