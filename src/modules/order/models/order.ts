import mongoose, { Schema } from "mongoose"

const OrderSchema = new Schema({
  sim: String,
  phone: String,
  price: Number,
  name: String,
  address: String,
  other_option: String, 
  ip: String,
  viewed: Number,
  browse_history: String
}, {timestamps: true})

const OrderModel =  mongoose.model('Order', OrderSchema);

export default OrderModel;