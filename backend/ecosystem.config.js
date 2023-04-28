const config = {
  CORS_ORIGIN:"http://localhost:3000",
  MYSQL_LOCAL_URL:"mysql://root:Naghammadi1984+@localhost:3306/bkmk",
};

module.exports = {
  apps : [{
    name: 'bkmk',
    // script: 'apiserver/src/server.js',
    script: 'server.js',
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
