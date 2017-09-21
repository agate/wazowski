import Marathon from '../marathon'

const marathon = new Marathon(null, {
  config: {
    marathon: {
      domain: 'marathon.domain:8080'
    }
  }
})

test('marathon fetch apps', async () => {
  await marathon.marathonAppsCache.renew()
  const apps = await marathon.marathonAppsCache.get('/development')
  expect(apps.length).toBeGreaterThan(0)
})
