import { test, expect, beforeAll, afterAll, vi } from 'vitest'
import { getServer } from './server.js'

let app
let spy

beforeAll(async () => {
  app = await getServer()
  spy = vi.spyOn(app.db, 'connect')
  await app.ready()
  spy.mockImplementation(() => {
    console.log('Safely executed db.connect()')
  })
})

afterAll(async () => {
  await app.close()
})

test('should connect to database', async () => {
  expect(spy).toHaveBeenCalledTimes(1)
})
