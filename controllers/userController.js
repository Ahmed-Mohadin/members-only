const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// GET User sign up
exports.user_sign_up_get = (req, res, next) => {
  res.render('sign_up', { title: 'Sign Up' });
};

// POST User sign up
exports.user_sign_up_post = [
  // Validate and sanitize fields
  body('username', 'Username must be entered')
    .isAlphanumeric()
    .withMessage('Username must be alphanumeric')
    .isLength({ min: 2, max: 20 })
    .withMessage('Username must be between 2 & 20 characters long')
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        return Promise.reject('Username already in use');
      }
    })
    .trim()
    .escape(),
  body('password', 'Password must be entered')
    .isLength({ min: 2, max: 50 })
    .withMessage('Password must be between 2 & 50 characters long')
    .trim()
    .escape(),
  body('confirmPassword')
    .custom((confirmPassword, { req }) => confirmPassword === req.body.password)
    .withMessage('Passwords did not match')
    .trim()
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const user = new User({
        username: req.body.username,
      });
      // There are errors. Render form again with sanitized values/error messages.
      return res.render('sign_up', {
        title: 'Sign Up',
        errors: errors.array(),
        username: req.body.username,
      });
    }

    // Data from form is valid. Save user.
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
      });
      await user.save();
      // Successful: redirect to index.
      res.redirect('/members-only/sign-in');
    } catch (err) {
      next(err);
    }
  },
];

// GET User sign in
exports.user_sign_in_get = (req, res, next) => {
  res.render('sign_in', { title: 'Sign In' });
};

// POST User sign in
exports.user_sign_in_post = (req, res) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      res.render('sign_in', {
        title: 'Sign In',
        errors: { signin: { msg: 'Internal error.' } },
      });
    } else if (!user) {
      res.render('sign_in', {
        errors: { signin: { msg: 'Invalid username or password.' } },
        title: 'Sign In',
        username: req.body.username,
      });
    } else {
      req.login(user, function (err, done) {
        if (err) {
          done(err);
        }
        res.redirect('/');
      });
    }
  })(req, res);
};

// GET User sig out
exports.user_sign_out_get = (req, res) => {
  req.session.destroy(function (err) {
    if (err) throw new Error(err);
    res.redirect('/'); //Inside a callback… bulletproof!
  });
};

// GET User join club
exports.user_join_club_get = (req, res, next) => {
  req.user
    ? res.render('join_club', { title: 'Join Club', user: req.user })
    : res.redirect('sign-in');
};

// POST User join club
exports.user_join_club_post = [
  // Validate and sanitize
  body('secretCode')
    .custom(
      (secretCode) =>
        secretCode === 'MEMBERSONLY' || secretCode === 'ONLYMEMBERS'
    )
    .withMessage('Wrong code kiddo ;)')
    .trim()
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    // Check if user signed in
    if (!req.user) res.redirect('/members-only/sign-in');
    // Render again if errors
    if (!errors.isEmpty()) {
      res.render('join_club', {
        title: 'Join Club',
        errors: errors.array(),
        secretCode: req.body.secretCode,
        user: req.user,
      });
    }
    // Change user's status
    try {
      const user = await User.findOne({ username: req.user.username });
      switch (req.body.secretCode) {
        case 'MEMBERSONLY':
          user.status = 'member';
          break;
        case 'ONLYMEMBERS':
          user.status = 'admin';
          break;
      }
      await user.save();
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  },
];
