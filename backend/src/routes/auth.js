const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { poolPromise } = require('../models/db');
const logEvent = require('../middleware/logging');
const exponentialBackoff = require('../middleware/backoff');
const speakeasy = require('speakeasy');

// Endpoint de login con backoff y logging

// Paso 1: Login con usuario y contraseña, responde si requiere MFA
router.post('/login', exponentialBackoff, async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', username)
      .query('SELECT * FROM Users WHERE username = @username AND deleted = 0');
    const user = result.recordset[0];
    if (!user) {
      await logEvent({ userId: null, ip, endpoint: '/login', action: 'login', success: false });
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await logEvent({ userId: user.id, ip, endpoint: '/login', action: 'login', success: false });
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    // Si el usuario tiene mfaSecret, requiere MFA
    if (user.mfaSecret) {
      return res.json({ mfaRequired: true, userId: user.id });
    }
    // Si no tiene MFA, genera el token directamente
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2m' });
    await logEvent({ userId: user.id, ip, endpoint: '/login', action: 'login', success: true });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// Paso 2: Validar código MFA y entregar token
router.post('/login/mfa', exponentialBackoff, async (req, res) => {
  const { userId, token: mfaToken } = req.body;
  const ip = req.ip;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', userId)
      .query('SELECT * FROM Users WHERE id = @id AND deleted = 0');
    const user = result.recordset[0];
    if (!user || !user.mfaSecret) {
      return res.status(401).json({ error: 'Usuario no válido para MFA' });
    }
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaToken
    });
    if (!verified) {
      await logEvent({ userId: user.id, ip, endpoint: '/login/mfa', action: 'mfa', success: false });
      return res.status(401).json({ error: 'Código MFA incorrecto' });
    }
    const jwtToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2m' });
    await logEvent({ userId: user.id, ip, endpoint: '/login/mfa', action: 'mfa', success: true });
    res.json({ token: jwtToken });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
