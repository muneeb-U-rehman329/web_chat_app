require('dotenv').config();
const { StatusCodes } = require('http-status-codes');
const UserSchema = require('../models/user');
const axios = require('axios');
const {
  signUpValidation,
  loginValidation,
  dateOfBirthValidation,
  forgotPasswordValidation,
  validateOtpValidation,
  resetPasswordValidation,
  verifyPhoneNumValidation,
} = require('../validation/validation');
const errorHandler = require('../utills/errorHandler');
const CustomError = require('../errors/customError');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const logger = require('../utills/logger');
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
// Configure Nodemailer:
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getUser = errorHandler(async (req, res) => {
  const user = await UserSchema.find();
  res.status(StatusCodes.OK).json({
    status: 'OK',
    message: 'All users',
    data: user,
  });
});

const deleteAllUser = errorHandler(async (req, res) => {
  const user = await UserSchema.deleteMany();
  res.status(StatusCodes.OK).json({
    status: 'OK',
    message: 'All users deleted',
    data: user,
  });
});

const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// const sendVrificationEmail = async (userEmail, pin) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: userEmail,
//     subject: 'Your Email Verification Pin',
//     html: `<p>Your verification pin is: <strong>${pin}</strong></p>`,
//   });
// };

const SignUp = errorHandler(async (req, res) => {
  const { username, fullName, email, password, recaptchaToken, fcmToken } =
    req.body;

  if (!recaptchaToken) {
    throw new CustomError('Please fill the reCAPTCHA', StatusCodes.BAD_REQUEST);
  }

  console.time('reCAPTCHA');
  const { data: captchaRes } = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    {},
    {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      },
    }
  );
  console.timeEnd('reCAPTCHA');

  if (!captchaRes.success || captchaRes.score < 0.5) {
    throw new CustomError(
      'reCAPTCHA verification failed',
      StatusCodes.FORBIDDEN
    );
  }

  const { error } = signUpValidation.validate(req.body);
  if (error) {
    throw new CustomError(error.details[0]?.message, StatusCodes.BAD_REQUEST);
  }

  if (!/^[a-zA-Z0-9._]+$/.test(username)) {
    throw new CustomError(
      'Username must contain only letters, numbers, dots, and underscores',
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const existingEmail = await UserSchema.findOne({
    email: email.toLowerCase(),
  });
  if (existingEmail) {
    throw new CustomError(
      'Account already exists with this email.',
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const existingUsername = await UserSchema.findOne({ username });
  if (existingUsername) {
    throw new CustomError(
      'Account already exists with this username.',
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const newUser = new UserSchema({
    username,
    name: fullName,
    email: email.toLowerCase(),
    password,
    fcmToken,
  });

  console.time('saveUser');
  const savedUser = await newUser.save();
  console.timeEnd('saveUser');

  res.status(StatusCodes.CREATED).json({
    status: 'OK',
    message: 'Thank you for registering on our platform',
    accountId: savedUser.accountId,
  });
});

const verificationPin = errorHandler(async (req, res) => {
  const { email, pin } = req.body;
  const user = await UserSchema.findOne({ email });
  if (!user) {
    throw new CustomError('User not found', StatusCodes.NOT_FOUND);
  }
  const storedPin = String(user.verificationPin);
  const enteredPin = String(pin);

  if (storedPin !== enteredPin) {
    throw new CustomError('Invalid pin', StatusCodes.BAD_REQUEST);
  }

  if (Date.now() > user.pinExpiry) {
    throw new CustomError(
      'Pin has expired. Please request a new one.',
      StatusCodes.BAD_REQUEST
    );
  }

  user.isEmailVerified = true;
  user.verificationPin = undefined;
  user.pinExpiry = undefined;
  await user.save();

  res.status(StatusCodes.OK).json({ message: 'Email verified successfully' });
});

const Login = errorHandler(async (req, res) => {
  const { error } = loginValidation.validate(req?.body);
  if (error) {
    throw new CustomError(error?.details[0]?.message, StatusCodes.BAD_REQUEST);
  }

  const { email, username, password } = req?.body;

  const identifiers = [email, username].filter(Boolean);
  if (identifiers.length !== 1) {
    throw new CustomError(
      'Please provide exactly one identifier: email or username.',
      StatusCodes.BAD_REQUEST
    );
  }

  let user;
  if (email) {
    user = await UserSchema.findOne({ email });
    if (!user) {
      throw new CustomError('Email not found', StatusCodes.UNAUTHORIZED);
    }
  } else if (username) {
    user = await UserSchema.findOne({ username });
    if (!user) {
      throw new CustomError('Username not found', StatusCodes.NOT_FOUND);
    }
  }

  const validPassword = await user.comparePassword(password);
  if (!validPassword) {
    throw new CustomError('Invalid password', StatusCodes.UNAUTHORIZED);
  }

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '12h',
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: '7d',
  });

  res.cookie('token', accessToken, {
    secure: true,
    sameSite: 'None',
    maxAge: 12 * 60 * 60 * 1000,
  });

  res.cookie('refresh-token', refreshToken, {
    secure: true,
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(StatusCodes.OK).json({
    status: 'OK',
    id: user._id,
    message: 'Logged in successfully',
    token: accessToken,
  });
});

const RefreshToken = errorHandler(async (req, res) => {
  const refreshToken = req.headers['authorization']?.split(' ')[1];

  if (!refreshToken) {
    throw new CustomError(
      'No refresh token provided',
      StatusCodes?.UNAUTHORIZED
    );
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      throw new CustomError(
        'Invalid or expired refresh token',
        StatusCodes?.UNAUTHORIZED
      );
    }
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '12h',
    });

    res
      .header('token', accessToken)
      .status(StatusCodes.OK)
      .json({ message: 'Token refreshed successfully', accessToken });
  });
});

const forgotPassword = errorHandler(async (req, res) => {
  const { error } = forgotPasswordValidation.validate(req.body);
  if (error) {
    throw new CustomError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { email } = req.body;
  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  const otpExpiry =
    Date.now() + parseInt(process.env?.OTP_EXPIRY_TIME) * 60 * 1000;

  const user = await UserSchema.findOne({ email });
  if (!user) {
    throw new CustomError('Email not found', StatusCodes.NOT_FOUND);
  }

  user.otp = otp;
  user.otpExpiry = otpExpiry;

  res.status(StatusCodes.OK).json({
    message: `OTP sent successfully. It will expire in ${process.env.OTP_EXPIRY_TIME} minutes.`,
  });

  try {
    // Save user and send email simultaneously
    await Promise.all([
      user.save(),
      transporter.sendMail({
        from: `Muneeb & Team <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset OTP',
        text: `Your OTP is ${otp}. It will expire in ${process.env.OTP_EXPIRY_TIME} minutes.`,
      }),
    ]);

    logger.info(`OTP sent to ${email}`);
  } catch (err) {
    logger.error(`Failed to process request for ${email}: ${err.message}`);
  }
});

const validateOtp = errorHandler(async (req, res) => {
  const { error } = validateOtpValidation.validate(req?.body);
  if (error) {
    throw new CustomError(error?.details[0]?.message, StatusCodes.BAD_REQUEST);
  }

  const { email, otp } = req?.body;

  if (!email || !otp) {
    throw new CustomError(
      'Email and OTP are required.',
      StatusCodes.BAD_REQUEST
    );
  }

  const user = await UserSchema.findOne({ email });
  if (!user) {
    throw new CustomError('Email not found', StatusCodes.NOT_FOUND);
  }
  const isOTP = user?.otp;
  if (isOTP === null || isOTP === undefined) {
    throw new CustomError('OTP not found', StatusCodes.NOT_FOUND);
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    throw new CustomError(
      `Account locked. Try again after ${new Date(
        user.lockUntil
      ).toLocaleTimeString()}.`,
      StatusCodes.FORBIDDEN
    );
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    user.failedOtpAttempts += 1;
    user.lastFailedOtpAttempt = Date.now();

    if (user.failedOtpAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000;
      await user.save();
      logger.warn(`Account locked due to OTP brute force: ${email}`);
      throw new CustomError(
        'Too many failed attempts. Account locked for 15 minutes.',
        StatusCodes.FORBIDDEN
      );
    }

    await user.save();
    logger.info(
      `Failed OTP attempt for ${email}. Attempts: ${user.failedOtpAttempts}`
    );
    throw new CustomError('Invalid or expired OTP.', StatusCodes.UNAUTHORIZED);
  }

  user.failedOtpAttempts = 0;
  user.lockUntil = null;
  await user.save();

  logger.info(`OTP validated successfully for ${email}`);
  res.status(StatusCodes.OK).json({
    message: 'OTP validated successfully',
  });
});

const dateOfBirth = errorHandler(async (req, res) => {
  const { error } = dateOfBirthValidation.validate(req?.body);
  if (error) {
    throw new CustomError(error?.details[0]?.message, StatusCodes.BAD_REQUEST);
  }

  let { email, date } = req?.body;
  if (!email) {
    throw new CustomError('Please provide an email', StatusCodes.BAD_REQUEST);
  }
  if (!date) {
    throw new CustomError(
      'Please provide date of birth',
      StatusCodes.BAD_REQUEST
    );
  }
  let user = await UserSchema.findOne({ email });

  if (!user) {
    throw new CustomError('Email not found', StatusCodes.NOT_FOUND);
  }
  if (user.date) {
    throw new CustomError(
      'Date of birth already exists',
      StatusCodes.BAD_REQUEST
    );
  }

  let dob = new Date(date);
  let currentDate = new Date();

  if (isNaN(dob)) {
    throw new CustomError('Invalid date format', StatusCodes.BAD_REQUEST);
  }
  let age = currentDate.getFullYear() - dob.getFullYear();
  let isBeforeBirthdayThisYear =
    currentDate.getMonth() < dob.getMonth() ||
    (currentDate.getMonth() === dob.getMonth() &&
      currentDate.getDate() < dob.getDate());

  if (isBeforeBirthdayThisYear) {
    age--;
  }

  if (age < 13) {
    throw new CustomError(
      'You must be at least 13 years old',
      StatusCodes.BAD_REQUEST
    );
  }

  if (dob.getFullYear() === currentDate.getFullYear()) {
    throw new CustomError(
      'Date of birth cannot be the current year',
      StatusCodes.BAD_REQUEST
    );
  }

  user.date = date;
  await user.save();

  res.status(StatusCodes.OK).json({
    message: 'Date of birth added successfully',
  });
});

const resetPassword = errorHandler(async (req, res) => {
  const { error } = resetPasswordValidation.validate(req?.body);
  if (error) {
    throw new CustomError(error?.details[0]?.message, StatusCodes.BAD_REQUEST);
  }

  const { email, otp, newPassword } = req?.body;

  if (!email || !otp || !newPassword) {
    throw new CustomError(
      'Please provide email, OTP, and new password.',
      StatusCodes.BAD_REQUEST
    );
  }

  const user = await UserSchema.findOne({ email });
  if (!user) {
    throw new CustomError('Email not found', StatusCodes.NOT_FOUND);
  }

  if (user.otp !== otp) {
    throw new CustomError('Invalid OTP', StatusCodes.UNAUTHORIZED);
  }

  if (user.otpExpiry < Date.now()) {
    throw new CustomError('OTP has expired', StatusCodes.UNAUTHORIZED);
  }

  if (newPassword.length < 6) {
    throw new CustomError(
      'Password should be at least 6 characters long.',
      StatusCodes.BAD_REQUEST
    );
  }

  user.otp = undefined;
  user.otpExpiry = undefined;

  user.password = newPassword;
  await user.save();

  logger.info(`Password successfully reset for ${email}`);

  res.status(StatusCodes.OK).json({
    message:
      'Password reset successfully. You can now log in with your new password.',
  });
});

const SendOtp = errorHandler(async (req, res) => {
  const { error } = verifyPhoneNumValidation.validate(req.body);
  if (error) {
    throw new CustomError(error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  const { email } = req.body;

  const user = await UserSchema.findOne({ email });
  if (!user) {
    throw (new CustomError('Email not found'), StatusCodes.NOT_FOUND);
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  const otpExpiry =
    Date.now() + parseInt(process.env.OTP_EXPIRY_TIME || '10') * 60 * 1000;

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  // Send OTP Email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  res.status(StatusCodes.OK).json({
    message: 'OTP sent successfully',
    exipryTime: process.env.OTP_EXPIRY_TIME + ' min',
  });
});

module.exports = {
  getUser,
  deleteAllUser,
  SignUp,
  verificationPin,
  Login,
  RefreshToken,
  forgotPassword,
  validateOtp,
  resetPassword,
  dateOfBirth,
  SendOtp,
};
