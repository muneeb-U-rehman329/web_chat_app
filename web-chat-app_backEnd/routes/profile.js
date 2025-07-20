const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getProfile, editProfile, getReceiverProfile} = require('../controllers/profile');
const upload  = require('../middlewares/upload');


router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), editProfile)
router.get('/profile/receiver/:chatId', protect, getReceiverProfile);

module.exports = router;
