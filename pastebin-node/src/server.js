// src/server.js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`
  🚀 Server running on port ${PORT}
  📝 Health check: http://localhost:${PORT}/api/healthz
  🌐 App URL: ${process.env.APP_URL || `http://localhost:${PORT}`}
  ⏰ Environment: ${process.env.NODE_ENV || 'development'}
  ⏰ TEST_MODE: ${process.env.TEST_MODE || 'off'}
  ⏰ Started at: ${new Date().toISOString()}
  `);
});