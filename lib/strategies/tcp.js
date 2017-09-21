import net from 'net'

import * as consts from '../consts'
import Base from './base'

const DEFAULT_TIMEOUT = 2 * consts.SECOND

export default class Tcp extends Base {
  async check() {
    const id = `tcp:${this.service.id}`
    const date = new Date

    let result = {
      id: id,
      timestamp: date
    }

    try {
      const inUse = await this.portInUse(this.service.config.tcp.port, this.service.config.tcp.host)
      result = {
        ...result,
        health: inUse ? 100 : 0,
      }
    } catch (error) {
      result = {
        ...result,
        health: 0,
        notes: JSON.stringify({
          error: error.message || error
        }),
      }
    }

    this.storage.write(result)
    return result
  }

  portInUse(port, host, timeout=DEFAULT_TIMEOUT) {
    return new Promise((resolve, reject) => {
      let inUse = true
      let client

      const cleanUp = () => {
        if (client) {
          client.removeAllListeners('connect')
          client.removeAllListeners('error')
          client.end()
          client.destroy()
          client.unref()
        }
        //debug('listeners removed from client socket');
      }

      const onConnectCb = () => {
        //debug('check - promise resolved - in use')
        resolve(inUse)
        cleanUp()
      }

      const onErrorCb = (err) => {
        if (err.code !== 'ECONNREFUSED') {
          //debug('check - promise rejected, error: '+err.message);
          reject(err)
        } else {
          //debug('ECONNREFUSED')
          inUse = false
          //debug('check - promise resolved - not in use')
          resolve(inUse)
        }
        cleanUp()
      }

      client = new net.Socket()
      client.once('connect', onConnectCb)
      client.once('error', onErrorCb)
      client.connect({port: port, host: host})

      setTimeout(() => {
        reject({message: "TIMEOUT"})
      }, timeout)
    })
  }
}
