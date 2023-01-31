import Fastify from 'fastify'
import fp from 'fastify-plugin'

export async function getServer () {
  const server = Fastify()
  await server.register(fp(function (scope, _, done) {
    scope.decorate('db', {
      connect () {
        console.log('This shouldn\'t run in a testing environment')
      },
    })
    scope.addHook('onReady', () => {
      scope.db.connect()
    })
    done()
  }))
  server.get('/', (_, reply) => reply.send('Hello'))
  return server
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = await getServer()
  await server.listen({ port: 3000 })
}
