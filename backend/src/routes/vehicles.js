const express = require('express');
const router = express.Router();
const { poolPromise } = require('../models/db');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');
const logEvent = require('../middleware/logging');

// Consulta pública de vehículos
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Vehicles WHERE deleted = 0');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// CRUD para administrador/super-administrador
router.post('/', authenticateToken, authorizeRoles('administrador', 'super-administrador'), async (req, res) => {
  const { marca, modelo, anio, precio } = req.body;
  const ip = req.ip;
  if (!marca || !modelo || !anio || !precio) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('marca', marca)
      .input('modelo', modelo)
      .input('anio', anio)
      .input('precio', precio)
      .query('INSERT INTO Vehicles (marca, modelo, anio, precio, deleted) VALUES (@marca, @modelo, @anio, @precio, 0)');
    await logEvent({ userId: req.user.id, ip, endpoint: '/vehicles', action: 'create', success: true });
    res.status(201).json({ message: 'Vehículo creado' });
  } catch (err) {
    await logEvent({ userId: req.user.id, ip, endpoint: '/vehicles', action: 'create', success: false });
    res.status(500).json({ error: 'Error interno' });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('administrador', 'super-administrador'), async (req, res) => {
  const { marca, modelo, anio, precio } = req.body;
  const { id } = req.params;
  const ip = req.ip;
  if (!marca || !modelo || !anio || !precio) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', id)
      .input('marca', marca)
      .input('modelo', modelo)
      .input('anio', anio)
      .input('precio', precio)
      .query('UPDATE Vehicles SET marca=@marca, modelo=@modelo, anio=@anio, precio=@precio WHERE id=@id AND deleted=0');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    await logEvent({ userId: req.user.id, ip, endpoint: `/vehicles/${id}`, action: 'update', success: true });
    res.json({ message: 'Vehículo actualizado' });
  } catch (err) {
    await logEvent({ userId: req.user.id, ip, endpoint: `/vehicles/${id}`, action: 'update', success: false });
    res.status(500).json({ error: 'Error interno' });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('administrador', 'super-administrador'), async (req, res) => {
  const { id } = req.params;
  const ip = req.ip;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', id)
      .query('UPDATE Vehicles SET deleted=1 WHERE id=@id AND deleted=0');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado o ya eliminado' });
    }
    await logEvent({ userId: req.user.id, ip, endpoint: `/vehicles/${id}`, action: 'delete', success: true });
    res.json({ message: 'Vehículo eliminado (soft delete)' });
  } catch (err) {
    await logEvent({ userId: req.user.id, ip, endpoint: `/vehicles/${id}`, action: 'delete', success: false });
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
