const { poolPromise } = require('../models/db');

async function logEvent({ userId, ip, endpoint, action, success }) {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('userId', userId)
      .input('ip', ip)
      .input('endpoint', endpoint)
      .input('action', action)
      .input('success', success)
      .input('timestamp', new Date())
      .query('INSERT INTO Logs (userId, ip, endpoint, action, success, timestamp) VALUES (@userId, @ip, @endpoint, @action, @success, @timestamp)');
  } catch (err) {
    console.error('Error al guardar log:', err);
  }
}

module.exports = logEvent;
