'use strict';
import Ember from 'ember';
import SmartViewMixin from 'client/mixins/smart-view-mixin';

export default Ember.Component.extend(SmartViewMixin.default, {
  setDefaultCurrentRecord: function () {
    if (!this.get('currentRecord')) {
      this.set('currentRecord', this.get('records.firstObject'));
    }
  }.on('didInsertElement').observes('records.[]'),
  status: function () {
    switch(this.get('currentRecord.forest-shipping_status')) {
      case 'Being processed':
        return 'one';
      case 'Ready for shipping':
        return 'two';
      case 'In transit':
        return 'three';
      case 'Shipped':
        return 'four';
    }
  }.property('currentRecord.forest-shipping_status'),
  actions: {
    selectRecord: function (record) {
      this.set('currentRecord', record);
    }
  }
});
