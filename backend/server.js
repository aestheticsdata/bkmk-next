const fastify = require('fastify')({ logger: true });
const fastifyEnv = require('@fastify/env');
const cors = require('@fastify/cors');


const schema = {
  type: 'object',
  required: ['CORS_ORIGIN', 'MYSQL_LOCAL_URL'],
  properties: {
    CORS_ORIGIN: {
      type: 'string'
    },
    MYSQL_LOCAL_URL: {
      type: 'string'
    }
  }
};

const options = {
  dotenv: true, // will read .env in root folder
  schema,
};

const startup = async () => {
  console.log("start");
  await fastify.register(fastifyEnv, options)

  fastify.register(cors, {
    origin: fastify.config.CORS_ORIGIN,
  });

  fastify.register(require('@fastify/mysql'), {
    connectionString: fastify.config.MYSQL_LOCAL_URL,
  });

  fastify.get('/', (request, reply) => {
    fastify.mysql.query(
      'DESCRIBE user;',
      null,
      function onResult (err, result) {
        reply.send(err || result);
      }
    )
  })

  try {
    await fastify.listen({ port: fastify.config.PORT })
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
startup();
