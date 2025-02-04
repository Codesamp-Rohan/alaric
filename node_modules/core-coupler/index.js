const safetyCatch = require('safety-catch')

module.exports = class CoreCoupler {
  constructor (target, wakeup) {
    this.target = target
    this.wakeup = wakeup
    this.coupled = new Set()

    this._onpeeraddBound = this._onpeeradd.bind(this)
    this.target.on('peer-add', this._onpeeraddBound)
  }

  add (core) {
    this.coupled.add(core)
    this._couple(core)
  }

  remove (core) {
    this.coupled.delete(core)
  }

  destroy () {
    this.target.off('peer-add', this._onpeeraddBound)
  }

  async _couple (core) {
    try {
      let wakeup = null

      for (const peer of this.target.peers) {
        if (await this._hasPeer(core, peer)) continue
        if (wakeup === null) wakeup = []
        wakeup.push(peer)
      }

      if (wakeup !== null && this.coupled.has(core)) {
        for (const peer of wakeup) this.wakeup(peer, [core])
      }
    } catch (err) {
      safetyCatch(err)
    }
  }

  async _onpeeradd (peer) {
    try {
      let wakeup = null

      for (const core of this.coupled) {
        if (await this._hasPeer(core, peer)) continue
        if (wakeup === null) wakeup = []
        wakeup.push(core)
      }

      if (wakeup !== null) {
        this.wakeup(peer, wakeup)
      }
    } catch (err) {
      safetyCatch(err)
    }
  }

  _hasPeer (core, peer) { // TODO: make proper
    const ch = peer.protomux.getLastChannel({ protocol: 'hypercore', id: core.discoveryKey })
    if (ch) return ch.fullyOpened()
    return Promise.resolve(false)
  }
}
