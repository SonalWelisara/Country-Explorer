const express = require('express');
const { getFavorites, addFavorite } = require('../controllers/favouritesController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, getFavorites);
router.post('/', authenticate, addFavorite);

module.exports = router;