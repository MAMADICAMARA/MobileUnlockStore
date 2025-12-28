// back/models/License.js
const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
}, 
{ timestamps: true }
);

const License = mongoose.model('License', LicenseSchema);
module.exports = License;
