
var crdt = require('..')
var assert = require('assert')

exports['test'] = function (t) {
  var next = process.nextTick
  var doc = new (crdt.Doc)
  var set = doc.createSet('type', 'thing')
  var rowRemoveEmitted = false
  var docRemoveEmitted = 0

  var init = {id: 'taonihu', prop: 'key', type: 'thing'}

  var row = doc.add(init)

  row.on('removed', function () {
    rowRemoveEmitted = true
  })

  doc.on('remove', function (removed) {
    assert(removed.id === init.id || removed.id === 'bogus')
    docRemoveEmitted++
  })

  doc.rm(init.id)
  doc.rm(init.id)  // test a double row delete
  doc.rm('bogus')  // test for non-existent

  next(function () {
    assert(rowRemoveEmitted)
    assert(docRemoveEmitted === 3)
    assert(doc.rows[init.id] === undefined)
    assert(set.get(init.id) === undefined)

    t.end()
  })

}

exports['test - with set'] = function (t) {
  var next = process.nextTick
  var doc = new crdt.Doc()
  var hoc = new crdt.Doc()
  var ds = doc.createStream()
  var hs = hoc.createStream()
  ds.pipe(hs).pipe(ds)

  doc.add({id: '1', type: 'thing'})

  var things = doc.createSet('type', 'thing');

  next(function () {
    assert.deepEqual(doc.toJSON(), hoc.toJSON())
    doc.rm('1');
    next(function () {
      assert.deepEqual(doc.toJSON(), hoc.toJSON())

      t.end()
    })
  })

}
