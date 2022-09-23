const { body, validationResult } = require('express-validator');
const Message = require('../models/message');

// GET new Message
exports.new_message_get = (req, res, next) => {
  req.user
    ? res.render('new_message', { title: 'Create New Message', user: req.user })
    : res.redirect('sign-in');
};

// POST new Message
exports.new_message_post = [
  body('title')
    .isLength({ min: 1, max: 30 })
    .withMessage('Title must be between 1 and 30 characters long')
    .trim()
    .escape(),
  body('message')
    .isLength({ min: 2, max: 500 })
    .withMessage('Message must be between 2 and 500 characters long')
    .trim()
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    // Check if user signed in
    if (!req.user) res.redirect('/members-only/sign-in');

    // Render again if errors
    if (!errors.isEmpty()) {
      const message = new Message({
        title: req.body.title,
        text: req.body.message,
      });
      res.render('new_message', {
        title: 'Create New Message',
        errors: errors.array(),
        user: req.user,
        message,
      });
    }
    try {
      const message = new Message({
        title: req.body.title,
        text: req.body.message,
        user: req.user._id,
      });
      await message.save();
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  },
];

// GET Message list
exports.message_list = async (req, res, next) => {
  try {
    return Object.values(await Message.find().populate('user')).reverse();
  } catch (error) {
    next(err);
  }
};

// Delete message
exports.delete_message = async (req, res, next) => {
  if (req.user.status === 'admin') {
    try {
      await Message.findByIdAndDelete(req.params.id);
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  }
};
