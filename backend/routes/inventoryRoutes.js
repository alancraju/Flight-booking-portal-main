const express = require('express');
const router = express.Router();
const { searchInventory, bookInventory, cancelInventory } = require('../controllers/inventoryController');

// All endpoints prefixed with /api/inventory
router.get('/search', searchInventory);
router.post('/book', bookInventory);
router.post('/cancel', cancelInventory);

module.exports = router;
