// Fichier : routes/auth.js

const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');
const { authenticateToken } = require('../app/middleware/authMiddleware');

// Inscription
// Endpoint final : POST /api/v1/auth/register
router.post('/register', UserController.register);

// Connexion
// Endpoint final : POST /api/v1/auth/login
router.post('/login', UserController.login);

// Rafraîchir l'access token à partir d'un refresh token
// Endpoint final : POST /api/v1/auth/refresh
router.post('/refresh', UserController.refreshToken);

// Profil utilisateur à partir du JWT d'accès
// Endpoint final : GET /api/v1/auth/me
router.get('/me', authenticateToken, UserController.getProfile);

module.exports = router;
