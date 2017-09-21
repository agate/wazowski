import Tcp from '../tcp'

const storage = {
  write: (r) => { }
}

const tcp1 = new Tcp(storage, {
  config: {
    tcp: {
      host: 'www.github.com',
      port: 80,
    }
  }
})

test('tcp 1', async () => {
  let result = await tcp1.check()
  expect(result.health).toBe(100)
})

const tcp2 = new Tcp(storage, {
  config: {
    tcp: {
      host: 'www.taobao.com',
      port: 334,
    }
  }
})

test('tcp 2', async () => {
  let result = await tcp2.check()
  expect(result.health).toBe(0)
})
