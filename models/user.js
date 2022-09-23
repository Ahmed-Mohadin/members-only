const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    minLength: 2,
    maxLength: 20,
    required: true,
  },
  password: {
    type: String,
    minLength: 8,
    required: true,
  },
  status: {
    type: String,
    enum: ['outsider', 'member', 'admin'],
    default: 'outsider',
  },
});

module.exports = mongoose.model('User', UserSchema);
