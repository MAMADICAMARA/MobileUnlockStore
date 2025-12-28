// back/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  serviceDetails: {
    name: String,
    price: Number,
  },
  fields: {
    type: Object,
  },
  status: {
    type: String,
    enum: ['En attente', 'En cours', 'Terminé', 'Annulé', 'Assigné'],
    default: 'En cours',
  },
  employeeCode: {
    type: String,
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;