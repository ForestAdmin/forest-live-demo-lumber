import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { observer } from '@ember/object';
import $ from 'jquery';
import SmartViewMixin from 'client/mixins/smart-view-mixin';

export default Component.extend(SmartViewMixin, {
  store: service(),

  conditionAfter: null,
  conditionBefore: null,
  loaded: false,
  calendarId: null,

  init(...args) {
    this._super(...args);

    this.loadPlugin();
  },

  onRecordsChange: observer('records.[]', function () {
    this.setEvent();
  }),

  loadPlugin() {
    scheduleOnce('afterRender', this, function () {
      this.set('calendarId', `${this.elementId}-calendar`);

      $.getScript('//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.1.0/fullcalendar.min.js', () => {
        this.set('loaded', true);
        this.setEvent();

        $(`#${this.calendarId}`).fullCalendar({
          allDaySlot: false,
          minTime: '00:00:00',
          defaultDate: new Date(2018, 2, 1),
          eventClick: (event, jsEvent, view) => {
            this.router.transitionTo(
              'rendering.data.collection.list.viewEdit.details',
              this.get('collection.id'),
              event.id,
            );
          },
          viewRender: (view) => {
            const field = this.get('collection.fields').findBy('field', 'start_date');

            if (this.conditionAfter) {
              this.removeCondition(this.conditionAfter, true);
              this.conditionAfter.destroyRecord();
            }
            if (this.conditionBefore) {
              this.removeCondition(this.conditionBefore, true);
              this.conditionBefore.destroyRecord();
            }

            const conditionAfter = this.store.createRecord('condition');
            conditionAfter.set('field', field);
            conditionAfter.set('operator', 'is after');
            conditionAfter.set('value', view.start);
            conditionAfter.set('smartView', this.viewList);
            this.set('conditionAfter', conditionAfter);

            const conditionBefore = this.store.createRecord('condition');
            conditionBefore.set('field', field);
            conditionBefore.set('operator', 'is before');
            conditionBefore.set('value', view.end);
            conditionBefore.set('smartView', this.viewList);
            this.set('conditionBefore', conditionBefore);

            this.addCondition(conditionAfter, true);
            this.addCondition(conditionBefore, true);

            this.fetchRecords({ page: 1 });
          }
        });
      });

      const headElement = document.getElementsByTagName('head')[0];

      const cssLink = document.createElement('link');
      cssLink.type = 'text/css';
      cssLink.rel = 'stylesheet';
      cssLink.href = '//cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.1.0/fullcalendar.min.css';

      headElement.appendChild(cssLink);
    });
  },

  setEvent() {
    if (!this.records) { return; }

    const calendar = $(`#${this.calendarId}`);
    calendar.fullCalendar('removeEvents');

    this.records.forEach((appointment) => {
      const event = {
          id: appointment.get('id'),
          title: appointment.get('forest-name'),
          start: appointment.get('forest-start_date'),
          end: appointment.get('forest-end_date')
      };

      calendar.fullCalendar('renderEvent', event, true);
    });
  },
});
