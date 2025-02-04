const test = require('brittle')
const b4a = require('b4a')

const BufferMap = require('.')

test('get/set', t => {
  const m = new BufferMap()
  m.set(b4a.from('hello'), 'world')
  t.is(m.get(b4a.from('hello')), 'world')
})

test('delete', t => {
  const m = new BufferMap()
  const key = b4a.from('hello')
  m.set(key, 'world')
  m.delete(key)
  t.absent(m.get(key))
})

test('iteration', t => {
  const m = new BufferMap()
  for (let i = 0; i < 5; i++) {
    m.set(b4a.from('' + i), i)
  }
  t.is(m.size, 5)
  let iterated = 0
  for (const [key, value] of m) {
    iterated++
    t.alike(b4a.toString(key), '' + value)
  }
  t.is(iterated, 5)
})

test('construct from other', t => {
  const m = new BufferMap()
  m.set(b4a.from('hello'), 'world')
  const m2 = new BufferMap(m)
  t.is(m2.get(b4a.from('hello')), 'world')
})
