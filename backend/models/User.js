const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: { type: String, required: true, minlength: 6 },
    color: { type: String, default: '' }
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Assign a random collaboration color on creation
UserSchema.pre('save', function (next) {
  if (!this.color) {
    const COLORS = ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce', '#805ad5', '#d53f8c', '#00b5d8'];
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Return safe user object (no password)
UserSchema.methods.toSafeObject = function () {
  return { id: this._id, name: this.name, email: this.email, color: this.color };
};

module.exports = mongoose.model('User', UserSchema);
