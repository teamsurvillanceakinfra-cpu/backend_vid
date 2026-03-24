import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  tokens: {
    type: Number,
    default: 10
  },
  preferences: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'dark' }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
