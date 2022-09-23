const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 30,
  },
  text: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 500,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

MessageSchema.virtual('date').get(function () {
  return DateTime.fromJSDate(this.timestamp).toFormat('yyyy-MM-dd, HH:mm');
});

module.exports = mongoose.model('Message', MessageSchema);
