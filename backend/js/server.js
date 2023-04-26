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


const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');

fastify.register(cors, {
  origin: 'http://localhost:3000',
});

fastify.register(require('@fastify/mysql'), {
  connectionString: 'mysql://root:Naghammadi1984+@localhost:3306/bkmk'
});

fastify.get('/', (request, reply) => {
  fastify.mysql.query(
    'DESCRIBE user;',
    null,
    function onResult (err, result) {
      // return err || result;
      reply.send(err || result);
    }
  )
})

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start();
