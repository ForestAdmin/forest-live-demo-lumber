import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import SmartViewMixin from 'client/mixins/smart-view-mixin';

export default Component.extend(SmartViewMixin, {
  didInsertElement() {
    this.setDefaultCurrentRecord();
  },

  onRecordsChange: observer('records.[]', function () {
    this.setDefaultCurrentRecord();
  }),

  setDefaultCurrentRecord() {
    if (!this.currentRecord) {
      this.set('currentRecord', this.records.firstObject);
    }
  },
  status: computed('currentRecord.forest-shipping_status', function () {
    switch(this.get('currentRecord.forest-shipping_status')) {
      case 'Being processed':
        return 'one';
      case 'Ready for shipping':
        return 'two';
      case 'In transit':
        return 'three';
      case 'Shipped':
        return 'four';
      default:
        return null;
    }
  }),
  actions: {
    selectRecord(record) {
      this.set('currentRecord', record);
    },
  },
});
