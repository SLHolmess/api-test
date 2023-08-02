import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  salt: String,
  password: String,
  username: { type: String, unique: true },
  is_root: { type: Boolean },
}, {timestamps: true});


const UserModel =  mongoose.model('User', UserSchema);

export default UserModel;
