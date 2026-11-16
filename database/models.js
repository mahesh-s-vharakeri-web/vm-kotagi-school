/**
 * MongoDB Mongoose Models
 * All collections for the school website
 */
const mongoose = require('mongoose');

// ── Admin ─────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  name:       { type: String, default: 'School Administrator' }
}, { timestamps: true });

// ── Announcement ──────────────────────────────────────
const announcementSchema = new mongoose.Schema({
  title_en:   { type: String, required: true },
  title_kn:   { type: String, default: '' },
  title_hi:   { type: String, default: '' },
  content_en: { type: String, required: true },
  content_kn: { type: String, default: '' },
  content_hi: { type: String, default: '' },
  category:   { type: String, default: 'news' },
  is_active:  { type: Number, default: 1 }
}, { timestamps: true });

// ── Gallery ───────────────────────────────────────────
const gallerySchema = new mongoose.Schema({
  title:    { type: String, default: 'School Photo' },
  filename: { type: String, required: true },
  category: { type: String, default: 'general' }
}, { timestamps: true });

// ── Staff ─────────────────────────────────────────────
const staffSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  designation:   { type: String, default: '' },
  subject:       { type: String, default: '' },
  qualification: { type: String, default: '' },
  is_active:     { type: Number, default: 1 }
}, { timestamps: true });

// ── Inquiry ───────────────────────────────────────────
const inquirySchema = new mongoose.Schema({
  parent_name:    { type: String, required: true },
  student_name:   { type: String, required: true },
  phone:          { type: String, required: true },
  email:          { type: String, default: '' },
  class_applying: { type: String, required: true },
  message:        { type: String, default: '' },
  is_read:        { type: Number, default: 0 }
}, { timestamps: true });

module.exports = {
  Admin:        mongoose.models.Admin        || mongoose.model('Admin',        adminSchema),
  Announcement: mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema),
  Gallery:      mongoose.models.Gallery      || mongoose.model('Gallery',      gallerySchema),
  Staff:        mongoose.models.Staff        || mongoose.model('Staff',        staffSchema),
  Inquiry:      mongoose.models.Inquiry      || mongoose.model('Inquiry',      inquirySchema),
};
