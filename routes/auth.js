// Fichier : routes/auth.js

const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');

// Route POST pour l'inscription 
// Endpoint: POST /api/auth/register
router.post('/register', UserController.register);

// Route POST pour la connexion 
// Endpoint: POST /api/auth/login
router.post('/login', UserController.login);

// Exporte le routeur pour qu'il puisse être attaché au serveur.js
module.exports = router;