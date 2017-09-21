import axios from 'axios'

import Base from './base'

export default class Influxdb extends Base {
  constructor({ host, port, database, measurement }) {
    super()

    this.host = host
    this.port = port
    this.database = database || 'nightwatch'
    this.measurement = measurement || 'services'
  }

  async write({ id, duration, health, notes, timestamp }) {
    try {
      const axiosRequestConfig = {
        method: 'POST',
        url: `http://${this.host}:${this.port}/write`,
        params: { db: this.database },
        data: this.buildQueryBody(id, duration, health, notes, timestamp)
      }

      const resp = await axios.request(axiosRequestConfig)

      return resp
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        // console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        // console.log('Error', error.message);
      }
      // console.log(error.config);

      return error
    }
  }

  buildQueryBody(id, duration, health, notes, timestamp) {
    return `${this.measurement},` + // measurement
    `id=${JSON.stringify(new String(id))},duration=${duration} ` + // tags
    `health=${health}` + (notes ? `,notes=${JSON.stringify(notes)} ` : ' ') + // fields
    `${timestamp.getTime() * 1000000}` // timestamp
  }
}
