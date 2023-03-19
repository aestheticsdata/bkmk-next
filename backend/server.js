const cors = require('@fastify/cors');

const fastify = require('fastify')({
  logger: true,
});

fastify.register(cors, {
  origin: 'http://localhost:3000',
});

fastify.get('/hello', function (request, reply) {
  reply.send({ hello: 'hello world and BKMK' })
});

fastify.listen({ port: 5000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});
