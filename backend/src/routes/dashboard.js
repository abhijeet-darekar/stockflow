const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

// GET /api/dashboard — summary stats + low stock items
router.get('/', async (req, res) => {
  try {
    const orgId = req.user.orgId;

    // Get default threshold from settings
    const settings = await prisma.settings.findUnique({ where: { organizationId: orgId } });
    const defaultThreshold = settings?.defaultLowStockThreshold ?? 5;

    // Fetch all active products
    const products = await prisma.product.findMany({
      where: { organizationId: orgId, deletedAt: null }
    });

    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantityOnHand, 0);

    // Low stock: quantity <= threshold (product's own threshold OR global default)
    const lowStockItems = products.filter(p => {
      const threshold = p.lowStockThreshold ?? defaultThreshold;
      return p.quantityOnHand <= threshold;
    });

    res.json({
      totalProducts,
      totalQuantity,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantityOnHand: p.quantityOnHand,
        threshold: p.lowStockThreshold ?? defaultThreshold
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
