module.exports = {
  apps: [
    {
      name: "ers-backend",
      script: "src/server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      // For killout process after 8 seconds
      kill_timeout: 8000,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
