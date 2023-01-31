import { test, expect, beforeAll, afterAll } from 'vitest'
import autocannon from 'autocannon'
import { decodeFromCompressedBase64 } from 'hdr-histogram-js'
import { chromium, devices } from 'playwright'
import { getServer } from './server.js'

let app
let port
let base

beforeAll(async () => {
  app = await getServer()
  await app.listen()
  port = app.server.address().port
  base = path => `http://localhost:${port}${path}`
})

afterAll(async () => {
  await app.close()
})

test('should listen and return Hello', async () => {
  const response = await fetch(base('/'))
  expect(await response.text()).toBe('Hello')
})

test('should have good performance', async () => {
  const results = await autocannon({ duration: 5, url: base('/') })
  expect(results.non2xx).toBe(0)
  expect(results.errors).toBe(0)
  const histogram = decodeFromCompressedBase64(results.latencies)
  expect(histogram.getValueAtPercentile(99)).toBeLessThan(50)
  expect(results.totalCompletedRequests).toBeGreaterThan(50000)
}, 7000)

test('should render index in a browser', async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext(devices['Desktop Chrome'])
  const page = await context.newPage()

  await page.goto(base('/'))
  const body = await page.waitForSelector('body')

  expect(await body.innerText()).toBe('Hello')

  await context.close()
  await browser.close()
}, 10000)
