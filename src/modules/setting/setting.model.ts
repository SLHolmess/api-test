import { Schema, model } from "mongoose";

const settingSchema = new Schema({
  key: { type: String, unique: true, require: true },
  value: String
}, { timestamps: true });

const Setting = model('Setting', settingSchema);

export default Setting;