import _ from 'lodash'
import * as consts from './consts'
import strategies from './strategies'

export default class Service {
  constructor(storage, config) {
    this.storage = storage

    this.id = config.id
    this.type = config.type
    this.config = config

    let Strategy = strategies[_.capitalize(this.type)]
    this.strategy = new Strategy(storage, this)

    this.interval = setInterval(() => {
      this.strategy.check()
    }, this.config.interval * consts.SECOND)
  }
}
