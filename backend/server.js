// const cors = require('@fastify/cors');
//
// const fastify = require('fastify')({
//   logger: true,
// });
//
// fastify.register(cors, {
//   origin: 'http://localhost:3000',
// });
//
// fastify.get('/hello', function (request, reply) {
//   reply.send({ hello: 'hello world and BKMK' })
// });
//
// fastify.listen({ port: 5000 }, function (err, address) {
//   if (err) {
//     fastify.log.error(err)
//     process.exit(1)
//   }
// });


// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true });

// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start();
