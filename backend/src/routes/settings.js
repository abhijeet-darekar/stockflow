const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { organizationId: req.user.orgId }
    });
    res.json(settings || { defaultLowStockThreshold: 5 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  const { defaultLowStockThreshold } = req.body;
  if (defaultLowStockThreshold === undefined || isNaN(parseInt(defaultLowStockThreshold))) {
    return res.status(400).json({ error: 'Valid defaultLowStockThreshold required' });
  }
  try {
    const settings = await prisma.settings.upsert({
      where: { organizationId: req.user.orgId },
      update: { defaultLowStockThreshold: parseInt(defaultLowStockThreshold) },
      create: {
        organizationId: req.user.orgId,
        defaultLowStockThreshold: parseInt(defaultLowStockThreshold)
      }
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;