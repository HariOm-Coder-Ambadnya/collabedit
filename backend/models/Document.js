const mongoose = require('mongoose');

const RevisionSchema = new mongoose.Schema({
  content: { type: String, default: '' },
  snapshot: { type: Buffer },
  savedAt: { type: Date, default: Date.now },
  savedBy: { type: String, default: 'system' },
  label: { type: String, default: '' }
});

const DocumentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, default: 'Untitled Document' },
    content: { type: String, default: '' },
    yjsState: { type: Buffer, default: null },
    revisions: { type: [RevisionSchema], default: [] },
    activeUsers: { type: Number, default: 0 },
    lastModified: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

DocumentSchema.methods.addRevision = function (content, snapshot, savedBy = 'system', label = '') {
  this.revisions.push({ content, snapshot, savedBy, label });
  if (this.revisions.length > 50) {
    this.revisions = this.revisions.slice(-50);
  }
};

module.exports = mongoose.model('Document', DocumentSchema);
