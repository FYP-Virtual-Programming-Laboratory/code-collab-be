module.exports = {
  apps: [
    {
      name: 'app',
      script: './dist/src/main.js',
      env: {
        PORT: 80,
        NODE_ENV: 'production',
        DATABASE_URL: 'file:./database.db',
      },
    },
    {
      name: 'websocket',
      script: './node_modules/y-websocket/bin/server.cjs',
      env: {
        HOST: 'localhost',
        PORT: 1234,
      },
    },
    {
      name: 'webrtc',
      script: './node_modules/y-webrtc/bin/server.js',
      env: {
        PORT: 4444,
      },
    },
  ],
};
