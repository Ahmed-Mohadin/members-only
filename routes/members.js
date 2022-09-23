var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
var messageController = require('../controllers/messageController');

/* GET users listing. */
router.get('/', async function (req, res, next) {
  res.render('index', {
    title: 'Members Only',
    user: req.user,
    messages: await messageController.message_list(),
  });
});

/// USER ROUTES ///

// GET sign up form
router.get('/sign-up', userController.user_sign_up_get);
// POST sign up form
router.post('/sign-up', userController.user_sign_up_post);

// GET sign in form
router.get('/sign-in', userController.user_sign_in_get);
// POST sign in form
router.post('/sign-in', userController.user_sign_in_post);

// GET sign out
router.get('/sign-out', userController.user_sign_out_get);

// Get join club
router.get('/join-club', userController.user_join_club_get);
// POST join club
router.post('/join-club', userController.user_join_club_post);

/// MESSAGE ROUTES ///

// Get Message
router.get('/new-message', messageController.new_message_get);
// POST Message
router.post('/new-message', messageController.new_message_post);
// Delete Message
router.post('/delete/:id', messageController.delete_message);

module.exports = router;
