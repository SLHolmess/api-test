import mongoose, { ConnectOptions } from 'mongoose';
import { mongoConnectionString } from '../includes/config';

export default class MongoProvider {
  static async connect(options?: ConnectOptions) {
    await mongoose.connect(mongoConnectionString, options);
  }
}