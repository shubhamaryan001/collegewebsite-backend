const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const crypto = require("crypto");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Name is required'
  },
  photo: {
    data: Buffer,
    contentType: String
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String
  },
  quantity: {
    type: Number,
    required: "Quantity is required"
  },
  price: {
    type: Number,
    required: "Price is required"
  },

  productedBy: {
    type: ObjectId,
    ref: "User"
},

  updated: Date,
  created: {
    type: Date,
    default: Date.now
  },
  

});

module.exports = mongoose.model('Product', ProductSchema)
