import axios from 'axios'
import * as consts from '../consts'
import Base from './base'

const TTL = 5 * consts.MINUTE

class MarathonAppsCache {
  constructor(domain, ttl) {
    this.domain = domain;
    this.ttl = ttl;
    this.timestamp = 0;
  }

  async get(appPatterns) {
    await this.renew()

    if (typeof appPatterns === 'string' || appPatterns instanceof String) {
      appPatterns = [appPatterns]
    }

    return this.apps.filter((app) => {
      const matches = appPatterns.filter((pattern) => {
        const regex = new RegExp(pattern)
        return app.id.match(regex)
      })

      return matches.length > 0
    })
  }

  async renew() {
    const url = `http://${this.domain}/v2/apps`
    if ((this.timestamp + this.ttl) < Date.now()) {
      try {
        const resp = await axios.request({
          url: url
        })

        this.apps = resp.data.apps
        this.timestamp = Date.now()
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(`[renew] ${url} failed. response code is not 2xx`)
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(`[renew] ${url} failed. no response`)
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log(`[renew] ${url} failed. unknown`)
        }
        this.apps = []
      }
    }
  }
}

export default class Marathon extends Base {
  constructor(storage, service) {
    super(storage, service)

    this.marathonAppsCache = new MarathonAppsCache(service.config.marathon.domain, TTL)
  }

  async check() {
    const date = new Date
    const appPatterns = this.service.config.marathon.apps
    const matchedApps = await this.marathonAppsCache.get(appPatterns)
    const tasks = await this.fetchTasks()

    return matchedApps.map(app => {
      const matchedTasks = tasks.filter(task => {
        return task.appId === app.id
      })

      const aliveTasks = matchedTasks.filter(task => {
        if (task.healthCheckResults) {
          return true
        } else {
          const alives = task.healthCheckResults.filter(res => { res.alive })
          return alives.length === task.healthCheckResults.length
        }
      })

      let health = aliveTasks.length * 100 / app.instances

      const result = {
        id: `marathon:${this.service.id}:${app.id}`,
        health: health,
        timestamp: date,
        notes: JSON.stringify({
          alive: aliveTasks.length,
          instances: app.instances,
        })
      }

      this.storage.write(result)

      return result
    })
  }

  async fetchTasks() {
    const url = `http://${this.service.config.marathon.domain}/v2/tasks`
    try {
      const resp = await axios.request({
        url: url
      })
      return resp.data.tasks
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(`[renew] ${url} failed. response code is not 2xx`)
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(`[renew] ${url} failed. no response`)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log(`[renew] ${url} failed. unknown`)
      }
      return []
    }
  }
}
