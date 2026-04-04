const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');

// GET /api/document/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({
      id: doc._id,
      title: doc.title,
      content: doc.content,
      lastModified: doc.lastModified,
      yjsState: doc.yjsState ? doc.yjsState.toString('base64') : null,
      revisionCount: doc.revisions.length
    });
  } catch (err) {
    console.error('GET /api/document/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/document — create new doc
router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const { title = 'Untitled Document' } = req.body;
    const doc = new Document({ _id: id, title });
    await doc.save();
    res.status(201).json({ id: doc._id, title: doc.title });
  } catch (err) {
    console.error('POST /api/document error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/document/:id — update title
router.patch('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    if (title) doc.title = title;
    doc.lastModified = new Date();
    await doc.save();
    res.json({ id: doc._id, title: doc.title });
  } catch (err) {
    console.error('PATCH /api/document/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/document/:id/revisions
router.get('/:id/revisions', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const revisions = doc.revisions.map((r, i) => ({
      index: i,
      savedAt: r.savedAt,
      savedBy: r.savedBy,
      label: r.label,
      preview: r.content ? r.content.slice(0, 200) : ''
    }));
    res.json(revisions.reverse());
  } catch (err) {
    console.error('GET revisions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/document/:id/revisions/:index
router.get('/:id/revisions/:index', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const idx = parseInt(req.params.index, 10);
    const rev = doc.revisions[idx];
    if (!rev) return res.status(404).json({ error: 'Revision not found' });
    res.json({
      index: idx,
      content: rev.content,
      savedAt: rev.savedAt,
      savedBy: rev.savedBy,
      label: rev.label,
      yjsState: rev.snapshot ? rev.snapshot.toString('base64') : null
    });
  } catch (err) {
    console.error('GET revision error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
