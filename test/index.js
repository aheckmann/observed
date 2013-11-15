
var O = require('../');
var assert = require('assert');

describe('observed', function(){
  it('is a function', function(done){
    assert.equal('function', typeof O);
    done();
  })

  it('returns an event emitter', function(done){
    var ee = O({});
    assert.equal('function', typeof ee.on);
    assert.equal('function', typeof ee.emit);
    assert.equal('function', typeof ee.addListener);
    done();
  })

  it('emits "new" events', function(done){
    var o = {};
    var ee = O(o);

    ee.on('new', function (change) {
      assert.equal('name', change.path);
      assert.equal('observed', change.value);
      done();
    });

    o.name = 'observed';
  })

  it('emits "updated" events', function(done){
    var o = {};
    var ee = O(o);

    ee.on('updated', function (change) {
      assert.equal('name', change.path);
      assert.equal('second', change.value);
      assert.equal(change.value, change.object.name);
      done();
    });

    o.name = 'first';
    o.name = 'second';
  })

  it('emits "updated field" events', function(done){
    var o = {};
    var ee = O(o);

    ee.on('updated name', function (change) {
      assert.equal('second', change.value);
      assert.equal(change.value, change.object.name);
      done();
    });

    o.name = 'first';
    o.name = 'second';
  })

  it('emits "reconfigured" events', function(done){
    var o = {};
    var ee = O(o);

    ee.on('reconfigured', function (change) {
      assert.equal('name', change.path);
      assert.equal('second', change.value);
      assert.equal(change.value, change.object.name);
      done();
    });

    o.name = 'first';
    Object.defineProperty(o, 'name', { get: function(){ return 'second' }});
  })

  it('emits "deleted" events', function(done){
    var o = {};
    var ee = O(o);

    ee.on('deleted', function (change) {
      assert.equal('name', change.path);
      assert.equal(undefined, change.value);
      assert.equal(change.value, change.object.name);
      done();
    });

    o.name = 'first';
    delete o.name;
  })

  it('emits "changed" events', function(done){
    var o = {};
    var ee = O(o);

    ee.on('changed', function (change) {
      if ('name' == change.path) {
        assert.equal('new', change.type);

      } else {
        assert.equal('deleted', change.type);
        assert.equal('first', change.oldValue);
      }

      done();
    });

    o.name = 'first';
    delete o.name;
  })

  describe('supports deeply nested objects', function(){
    var o = {
        nested: {
            tags: ['logic audio', 'native instruments', 'drums']
          , deeper: [{ x: 3 }, { deeperer: [47,108] }]
        }
      , array: [new Date, new Buffer(0)]
    };

    var ee = O(o);

    it('one level deep', function(done){
      ee.once('new', function (o) {
        assert.equal('nested.name', o.path);
        assert.equal('observed', o.value);
        assert.equal(o.value, o.object.name);

        o.object.name = 'changed';
      });

      ee.once('updated nested.name', function (o) {
        assert.equal('changed', o.value);
        assert.equal(o.value, o.object.name);
        done();
      });

      o.nested.name = 'observed';
    })

    it('two levels deep', function(done){
      ee.once('new', function (change) {
        assert.ok(Array.isArray(change.object));
        assert.equal('nested.tags.3', change.path);
        assert.equal('cajon', change.value);
        assert.equal(undefined, change.oldValue);
      });

      ee.once('updated nested.tags.length', function (change) {
        assert.equal('nested.tags.length', change.path);
        assert.equal('length', change.name);
        assert.equal(4, change.value);
        assert.equal(3, change.oldValue);
        done();
      });

      o.nested.tags.push('cajon');
    })

    it('three levels deep', function(done){
      ee.once('new', function (change) {
        assert.equal('name', change.name);
        assert.equal('nested.deeper.0.name', change.path);
        assert.equal('array of objects', change.value);
        assert.equal(undefined, change.oldValue);
        done();
      });

      o.nested.deeper[0].name = 'array of objects';
    })

    /* TODO
    it('emits generic array path changes', function(done){
      ee.once('updated nested.deeper.x', function(change){
        assert.equal(1, change.index);
        done();
      })
      o.nested.deeper[1].x = 5;
    })
    */

    it('begins listening to newly added objects', function(done){
      o.newlyAddedObject = { x: [[{ woot: true }]] };

      ee.once('new', function(change){
        o.newlyAddedObject.x[0][0].woot = false;
      });

      ee.once('updated newlyAddedObject.x.0.0.woot', function(change){
        assert.strictEqual(false, change.value);
        assert.strictEqual(true, change.oldValue);
        done();
      });
    })
  })

  it('stops listening to deleted properties', function(done){
    var o = { nil: null, name: { last: 'h', first: 'a' }};
    var ee = O(o)
    assert.equal(2, ee.observers.length);
    ee.once('deleted', function(change){
      assert.equal(1, ee.observers.length);

      ee.once('deleted', function(change){
        done();
      });

      delete o.nil;
    });
    delete o.name;
  })

  it('listens to array manipulation', function(done){
    var o = [];
    var ee = O(o);
    ee.once('new', function (change) {
      assert.equal(3, change.value);

      var times = 0;

      // update is called once per added element
      var onupdate = function (change) {
        if (++times == 4) {
          assert.deepEqual([3,4,5,6,7], o);
          done();
        }
      }
      ee.on('new', onupdate);
      o.push(4,5,6,7);
    })
    o.push(3);
  })
})
