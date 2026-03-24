import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous downloads
  },
  originalUrl: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  title: {
    type: String
  },
  thumbnail: {
    type: String
  },
  qualitySelected: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('Download', downloadSchema);
