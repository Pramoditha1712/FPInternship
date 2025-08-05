const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');

// GET all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find({});
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// POST new organization
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const existing = await Organization.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ error: 'Organization exists' });

    const newOrg = await Organization.create({ name: name.trim() });
    res.status(201).json(newOrg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.id);
    res.json({ message: 'Organization deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

module.exports = router;