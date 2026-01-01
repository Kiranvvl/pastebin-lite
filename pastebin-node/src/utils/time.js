// src/utils/time.js
function getNow(req) {
  if (process.env.TEST_MODE === '1') {
    const testTime = req.headers['x-test-now-ms'];
    if (testTime && !isNaN(testTime)) {
      return new Date(parseInt(testTime, 10));
    }
  }
  return new Date();
}

module.exports = { getNow };