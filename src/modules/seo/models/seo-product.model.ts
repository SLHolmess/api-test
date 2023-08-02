import mongoose, { Schema } from "mongoose"

const SeoProductConfigSchema = new Schema({
  status: Number,

  category: String,
  priceFrom: Number,
  priceTo: Number,

  title: String,
  h1: String,
  description: String,
}, {timestamps: true})

const SeoProductConfigModel =  mongoose.model('SeoProductConfig', SeoProductConfigSchema, 'seo_product_configs');

export default SeoProductConfigModel;