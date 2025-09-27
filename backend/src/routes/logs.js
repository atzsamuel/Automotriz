const express = require('express');
const router = express.Router();
const { poolPromise } = require('../models/db');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');

// Dashboard de logs y auditoría solo para super-administrador
router.get('/', authenticateToken, authorizeRoles('super-administrador'), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Logs');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
