'use strict';
import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    updateRecordPerPage() {
      this.get('customView')
        .save()
        .then(() => this.sendAction('fetchRecords'));
    },
    fetchRecords(olderOrNewer) {
      this.sendAction('fetchRecords', olderOrNewer);
    }
  }
});
