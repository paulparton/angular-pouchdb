'use strict';

var self = this;

describe('Angular-wrapped PouchDB event emitters', function() {
  function shouldNotBeCalled(rejection) {
    self.fail(rejection);
  }

  function rawPut(cb) {
    function put($window) {
      var rawDB = new $window.PouchDB('db');
      var doc = {_id: 'test'};
      rawDB.put(doc, function(err, result) {
        if (err) {
          throw err;
        }
        cb(result);
      });
    }
    inject(put);
  }

  var db;
  beforeEach(function() {
    var $injector = angular.injector(['ng', 'pouchdb']);
    var pouchDB = $injector.get('pouchDB');
    db = pouchDB('db');
  });

  describe('changes', function() {
    it('should resolve on complete', function(done) {
      function success(change) {
        expect(change.results[0].id).toBe('test');
      }

      function changes() {
        db.changes().$promise
          .then(success)
          .catch(shouldNotBeCalled)
          .finally(done);
      }

      rawPut(changes);
    });

    it('should notify on change events', function(done) {
      function notify(change) {
        expect(change.id).toBe('test');
      }

      function changes() {
        db.changes().$promise
          .then(null, null, notify)
          .catch(shouldNotBeCalled)
          .finally(done);
      }

      rawPut(changes);
    });
  });


  afterEach(function(done) {
    function tearDown($window) {
      // Use raw PouchDB (and callback) as a sanity check
      $window.PouchDB.destroy('db', function(err, info) {
        if (err) {
          throw err;
        }
        expect(info.ok).toBe(true);
        done();
      });
    }
    inject(tearDown);
  });
});