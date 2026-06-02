require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Conflict = require('../models/Conflict');
const User = require('../models/User');

// ─── Basic Data Backup Script ──────────────────────────────────────────────────
// Run: node scripts/backupData.js
// Exports all MongoDB data to JSON files in /backup folder

const backupData = async () => {
  try {
    console.log('💾 Starting data backup...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for backup\n');

    // ── Create backup directory with timestamp ─────────────────────────────
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(__dirname, '..', 'backup', timestamp);
    fs.mkdirSync(backupDir, { recursive: true });

    // ── Export Conflicts ───────────────────────────────────────────────────
    const conflicts = await Conflict.find({}).lean();
    const conflictsPath = path.join(backupDir, 'conflicts.json');
    fs.writeFileSync(conflictsPath, JSON.stringify(conflicts, null, 2));
    console.log(`✅ Conflicts backed up: ${conflicts.length} records → ${conflictsPath}`);

    // ── Export Users (without passwords) ──────────────────────────────────
    const users = await User.find({}).select('-password').lean();
    const usersPath = path.join(backupDir, 'users.json');
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    console.log(`✅ Users backed up: ${users.length} records → ${usersPath}`);

    // ── Write backup manifest ──────────────────────────────────────────────
    const manifest = {
      backupTimestamp: new Date().toISOString(),
      collections: {
        conflicts: conflicts.length,
        users:     users.length,
      },
      backupDir,
    };
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log('\n🎉 Backup completed successfully!');
    console.log(`📁 Backup saved to: ${backupDir}\n`);

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.\n');
    process.exit(0);
  }
};

backupData();
