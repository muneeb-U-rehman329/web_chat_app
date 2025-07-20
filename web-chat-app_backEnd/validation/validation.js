const Joi = require('joi');

const signUpValidation = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).required(),
  fullName: Joi.string().required(),
  password: Joi.string().min(8).required(),
  recaptchaToken: Joi.string().required(),
});

const loginValidation = Joi.object({
  email: Joi.string().email(),
  username: Joi.string(),
  password: Joi.string().required(),
});

const dateOfBirthValidation = Joi.object({
  email: Joi.string().email(),
  date: Joi.string()
});

const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
});

const validateOtpValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.number().required(),
});

const resetPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.number().required(),
  newPassword: Joi.string().min(8).required(),
});


const verifyPhoneNumValidation = Joi.object({
  email: Joi.string().required(),
})
module.exports = {
  signUpValidation,
  loginValidation,
  dateOfBirthValidation,
  forgotPasswordValidation,
  validateOtpValidation,
  resetPasswordValidation,
  verifyPhoneNumValidation,
};
