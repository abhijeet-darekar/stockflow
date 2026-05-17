const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where = {
      organizationId: req.user.orgId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } }
        ]
      })
    };
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, organizationId: req.user.orgId, deletedAt: null }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;
  if (!name || !sku) return res.status(400).json({ error: 'Name and SKU are required' });
  try {
    const existing = await prisma.product.findFirst({
      where: { organizationId: req.user.orgId, sku, deletedAt: null }
    });
    if (existing) return res.status(400).json({ error: 'SKU already exists in your organization' });
    const product = await prisma.product.create({
      data: {
        organizationId: req.user.orgId,
        name,
        sku,
        description: description || null,
        quantityOnHand: parseInt(quantityOnHand) || 0,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : null,
      }
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, organizationId: req.user.orgId, deletedAt: null }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (sku && sku !== product.sku) {
      const skuConflict = await prisma.product.findFirst({
        where: { organizationId: req.user.orgId, sku, deletedAt: null, NOT: { id: req.params.id } }
      });
      if (skuConflict) return res.status(400).json({ error: 'SKU already exists' });
    }
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name ?? product.name,
        sku: sku ?? product.sku,
        description: description !== undefined ? description : product.description,
        quantityOnHand: quantityOnHand !== undefined ? parseInt(quantityOnHand) : product.quantityOnHand,
        costPrice: costPrice !== undefined ? (costPrice ? parseFloat(costPrice) : null) : product.costPrice,
        sellingPrice: sellingPrice !== undefined ? (sellingPrice ? parseFloat(sellingPrice) : null) : product.sellingPrice,
        lowStockThreshold: lowStockThreshold !== undefined ? (lowStockThreshold ? parseInt(lowStockThreshold) : null) : product.lowStockThreshold,
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/products/:id/adjust
router.patch('/:id/adjust', async (req, res) => {
  const { delta } = req.body;
  if (delta === undefined) return res.status(400).json({ error: 'delta required' });
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, organizationId: req.user.orgId, deletedAt: null }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const newQty = Math.max(0, product.quantityOnHand + parseInt(delta));
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { quantityOnHand: newQty }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, organizationId: req.user.orgId, deletedAt: null }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await prisma.product.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() }
    });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;