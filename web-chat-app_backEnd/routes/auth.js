const express = require('express');
const router = express.Router();
const {
  SignUp,
  verificationPin,
  Login,
  RefreshToken,
  forgotPassword,
  validateOtp,
  resetPassword,
  getUser,
  dateOfBirth,
  deleteAllUser,
  SendOtp,
} = require('../controllers/auth');
router
  .post('/auth/signup', SignUp)
  .post('/auth/verification-pin', verificationPin)
  .post('/auth/login', Login)
  .post('/auth/refresh-token', RefreshToken)
  .post('/auth/forgot-password', forgotPassword)
  .post('/auth/validate-otp', validateOtp)
  .post('/auth/reset-password', resetPassword)
  .get('/auth/user', getUser)
  .delete('/auth/deleteAll', deleteAllUser)
  .post('/auth/date-of-birth',dateOfBirth)
  .post('/auth/send-otp', SendOtp);

module.exports = router;