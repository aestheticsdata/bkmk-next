const config = {
  HOST: "localhost",
  DB: "bkmk",
  DB_USER: "root",
  DB_PASSWORD: "Naghammadi1984+",
  PORT: 3101,
  CORS_ORIGIN: "http://localhost:3100",
  // MYSQL_LOCAL_URL: "mysql://root:Naghammadi1984+@localhost:3306/bkmk",
};

module.exports = {
  apps : [{
    name: 'bkmk',
    // script: 'apiserver/src/server.js',
    script: 'src/server.js',
    env_dev: {
      PROD: false,
      NODE_ENV: "dev",
      watch: true,
      ignore_watch: ["node_modules"],
      ...config,
    },
    env_production: {
      PROD: true,
      NODE_ENV: "production",
      ...config,
    }
  }],
};
