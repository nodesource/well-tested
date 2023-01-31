import { test, expect, beforeAll, afterAll } from 'vitest'
import { getServer } from './server.js'

let app

beforeAll(async () => {
  app = await getServer()
})

afterAll(async () => {
  await app.close()
})

test('should return Hello', async () => {
  const response = await app.inject({ url: '/' })
  expect(await response.body).toBe('Hello')
  await app.close()
})
