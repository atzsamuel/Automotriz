const express = require('express');
const router = express.Router();
const { poolPromise } = require('../models/db');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');
const logEvent = require('../middleware/logging');

// CRUD de usuarios solo para super-administrador
router.get('/', authenticateToken, authorizeRoles('super-administrador'), async (req, res) => {
  // ...listar usuarios...
});

router.post('/', authenticateToken, authorizeRoles('super-administrador'), async (req, res) => {
  // ...crear usuario...
});

router.put('/:id', authenticateToken, authorizeRoles('super-administrador'), async (req, res) => {
  // ...actualizar usuario...
});

router.delete('/:id', authenticateToken, authorizeRoles('super-administrador'), async (req, res) => {
  // ...eliminación lógica (soft delete)...
});

module.exports = router;
