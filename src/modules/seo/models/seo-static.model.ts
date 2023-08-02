import mongoose, { Schema } from "mongoose"

const SeoStaticConfigSchema = new Schema({
  status: Number,
  category: Number,
  link: String,
  
  title: String,
  image: String,
  h1: String,
  description: String,
  detail: String,
  related_links: Array
}, {timestamps: true})

const SeoStaticConfigModel =  mongoose.model('SeoStaticConfig', SeoStaticConfigSchema, 'seo_static_configs');

export default SeoStaticConfigModel;