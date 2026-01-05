const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
const xssClean = require('xss-clean');
const expressRateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const logger = require('./logger');

const configureMiddleware = (app) => {
  // Enable CORS FIRST - must be before other middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  }));

  // Body-parser middleware
  app.use(express.json());

  // Cookie Parser
  app.use(cookieParser());

  // MongoDB data sanitizer
  app.use(mongoSanitize());

  // Helmet improves API security by setting some additional header checks
  // app.use(helmet());

  // Additional protection against XSS attacks
  app.use(xssClean());

  // Add rate limit to API (100 requests per 10 mins)
  // Skip rate limiting for OPTIONS requests (CORS preflight) and allow all origins for CORS
  const rateLimiter = expressRateLimit({
      windowMs: 10 * 60 * 1000,
      max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip OPTIONS requests (CORS preflight)
      return req.method === 'OPTIONS';
    },
  });
  
  app.use(rateLimiter);

  // Prevent http param pollution
  app.use(hpp());

  // Custom logging middleware
  app.use(logger);
};

module.exports = configureMiddleware;
