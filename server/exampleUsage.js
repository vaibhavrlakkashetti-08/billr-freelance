import logger from './logger.js';

/**
 * Example 1: Logging User Login safely
 * We pass an object with metadata that might contain sensitive info.
 * The logger automatically scrubs sensitive keys (password, api_key) 
 * and masks the email.
 */
const handleUserLogin = (user) => {
  logger.info('User login attempt initiated', {
    meta: {
      userId: user.id,
      email: user.email,
      password: user.password,
      apiKey: user.apiKey
    }
  });

  try {
    // Simulating login logic...
    if (!user.id) {
       throw new Error("Missing critical User ID during login flow!");
    }
    
    logger.info('User logged in successfully', { meta: { userId: user.id }});
    
  } catch (error) {
    /**
     * Example 2: Handling and Logging Errors
     * We pass the error directly to meta, and Winston native error formatting handles it.
     * The stack trace will show in Dev, but be hidden in Production automatically.
     */
    logger.error(`Login Failed: ${error.message}`, { 
      error, // Native error object
      meta: { 
        email: user.email,
        attemptTime: Date.now() 
      }
    });
  }
};

// --- Execute Examples ---

// 1. Will safely log the attempt, REDACT the password/apiKey, and MASK the email.
handleUserLogin({
  id: 12345,
  email: 'johndoe@example.com',
  password: process.env.TEST_PASSWORD || 'redacted',
  apiKey: process.env.TEST_API_KEY || 'redacted'
});

// 2. Will throw an error and log the error data to error.log
handleUserLogin({
  email: 'invalid.user@test.io',
  password: process.env.TEST_PASSWORD || 'redacted'
});
