// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const sgMail=require('@sendgrid/mail');
sgMail.setApiKey(process.env.API_KEY);
const generateEmailToken = (name,email,password) => {
    return jwt.sign({ name,email,password }, process.env.EMAIL_SECRET, { expiresIn: '1h' });
};

const protect = asyncHandler(async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            // console.log(req.user);
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const sendConfirmationEmail = async (email, token) => {
  try {
    const confirmUrl = `http://localhost:5174/confirmEmail?token=${token}`;
    const msg = {
      from: 'Soudarjya Guha (TechHub)',
      to: email,
      subject: 'Confirm your email',
      html: `
        <!DOCTYPE html>
        <html lang="en" style="margin: 0; padding: 0;">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Email Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f6f9fc;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: auto;
              background: #ffffff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            h2 {
              color: #333333;
              text-align: center;
            }
            p {
              color: #555555;
              font-size: 16px;
              line-height: 1.5;
            }
            .button {
              display: block;
              width: max-content;
              margin: 30px auto;
              padding: 12px 24px;
              background-color: #007bff;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #999999;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h2>Confirm Your Email</h2>
            <p>Hi,</p>
            <p>Thank you for signing up. Please confirm your email address by clicking the button below:</p>
            <a href="${confirmUrl}" class="button">Confirm Email</a>
            <p>If you did not create this account, please ignore this email.</p>
            <div class="footer">
              &copy; 2025 Driveefy. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };
    const transporter=nodemailer.createTransport({
      service:'gmail',
      auth:{
        user:process.env.FROM_EMAIL,
        pass:process.env.API_KEY,
      }
    })
    // await sgMail.send(msg);
     transporter.sendMail(msg,(error,info)=>{
      if (error) {
        console.error('Error sending mail:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    })
    console.log('Email sent successfully to', email);
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error.message);
  }
};

module.exports = { protect,generateEmailToken,sendConfirmationEmail };
