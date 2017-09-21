import axios from 'axios'

import Base from './base'

export default class Http extends Base {
  async check() {
    const id = `http:${this.service.id}`
    const date = new Date
    const axiosRequestConfig = this.service.config.http

    let result = {
      id: id,
      timestamp: date
    }

    try {
      let resp = await axios.request(axiosRequestConfig)
      result = {
        ...result,
        duration: Date.now() - date.getTime(),
        health: 100,
        timestamp: date,
      }
    } catch (error) {
      result = {
        ...result,
        duration: Date.now() - date.getTime(),
        health: 0,
      }
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        result.notes = JSON.stringify({
          reason: 'status code falls out of the range of 2xx',
          status: error.response.status,
          body: error.response.data,
        })
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        result.notes = JSON.stringify({
          reason: 'no response was received',
        })
      } else {
        // Something happened in setting up the request that triggered an Error
        result.notes = JSON.stringify({
          reason: 'unknown',
          message: error.message,
        })
      }

      this.storage.write(result)

      return result
    }
  }
}
