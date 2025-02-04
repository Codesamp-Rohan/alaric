const b4a = require('b4a')

module.exports = class BufferMap {
  constructor (other) {
    this.m = other ? new Map([...other.m]) : new Map()
  }

  get size () {
    return this.m.size
  }

  get (key) {
    if (b4a.isBuffer(key)) key = b4a.toString(key, 'hex')
    return this.m.get(key)
  }

  set (key, value) {
    if (b4a.isBuffer(key)) key = b4a.toString(key, 'hex')
    return this.m.set(key, value)
  }

  delete (key) {
    if (b4a.isBuffer(key)) key = b4a.toString(key, 'hex')
    return this.m.delete(key)
  }

  has (key) {
    if (b4a.isBuffer(key)) key = b4a.toString(key, 'hex')
    return this.m.has(key)
  }

  * [Symbol.iterator] () {
    for (const [key, value] of this.m) {
      yield [b4a.from(key, 'hex'), value]
    }
  }

  * keys () {
    for (const key of this.m.keys()) {
      yield b4a.from(key, 'hex')
    }
  }

  values () {
    return this.m.values()
  }

  clear () {
    return this.m.clear()
  }
}
