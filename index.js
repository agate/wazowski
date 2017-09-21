import yaml from 'js-yaml'
import fs from 'fs'
import _ from 'lodash'

import * as consts from './lib/consts'
import Service from './lib/service'
import storages from './lib/storages'

try {
  let app = yaml.safeLoad(fs.readFileSync('./config/app.yml', 'utf8'))
  let Storage = storages[_.capitalize(app.storage)]
  let storage = new Storage(app[app.storage])

  var doc = yaml.safeLoad(fs.readFileSync('./config/services.yml', 'utf8'))
  doc.services.map((c) => new Service(storage, c))
} catch (e) {
  console.log(e);
}
