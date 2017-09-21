export default class Base {
  constructor(storage, service) {
    this.storage = storage
    this.service = service
  }

  check() {
    throw 'check fucntion needs be overwritten!'
  }
}
