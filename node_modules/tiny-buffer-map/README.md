# tiny-buffer-map

A very simple Map for Buffers. Has the same API as a JS Map.

## Usage
```js
const BufferMap = require('tiny-buffer-map')
const b4a = require('b4a')

const key = b4a.from('hello')

const m = new BufferMap()
m.set(b4a.from('a'), 'b')
m.set(b4a.from('c'), 'd')
m.get(b4a.from('a')) // 'b'
m.delete(b4a.from('c'))

for (const [key, value] of m) {
  // keys are buffers in the iterators
}
```

## License
MIT

