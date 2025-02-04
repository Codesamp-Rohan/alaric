import Corestore from 'corestore'
import CoreCoupler from './index.js'

const store1 = new Corestore('/tmp/coupler/store1')
const store2 = new Corestore('/tmp/coupler/store2')

const target = store1.get({ name: 'target' })
const other = store1.get({ name: 'other' })

await target.ready()
await other.ready()

store2.get(target.key)

const s1 = store1.replicate(true)
const s2 = store2.replicate(false)

s1.pipe(s2).pipe(s1)

await new Promise(resolve => setTimeout(resolve, 200))

const a = new CoreCoupler(target, function (peer, cores) {
  console.log('a: should wakeup', cores.length)
})

a.add(other)
