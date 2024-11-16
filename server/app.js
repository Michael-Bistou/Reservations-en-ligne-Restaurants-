require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const apiRoutes = require('./routes/api');

const app = express();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create database pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testDatabaseConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit if database connection fails
    }
}

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.PRODUCTION_URL 
        : ['http://localhost:3000/', 'http://localhost:5000/', 'http://127.0.0.1:5500/'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    preflightContinue: false,
    optionsSuccessStatus: 204  // Handle preflight requests
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Make database pool available in all routes
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Verify Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe secret key is not configured');
    process.exit(1);
}

// Test Stripe configuration
async function testStripeConnection() {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1000,
            currency: 'usd'
        });
        console.log('Stripe configuration is valid');
        // Immediately cancel the test payment intent
        await stripe.paymentIntents.cancel(paymentIntent.id);
    } catch (error) {
        console.error('Stripe configuration error:', error);
        process.exit(1);
    }
}

// API Routes
app.use('/api', apiRoutes);

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
        database: pool ? 'connected' : 'not connected'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    
    // Handle Stripe errors
    if (err.type === 'StripeError') {
        return res.status(402).json({
            error: 'Payment Failed',
            message: err.message
        });
    }

    // Handle database errors
    if (err.code && err.code.startsWith('ER_')) {
        return res.status(500).json({
            error: 'Database Error',
            message: 'A database error occurred'
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message
        });
    }

    // Generic error response
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Server initialization
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Test database connection
        await testDatabaseConnection();
        
        // Test Stripe configuration
        await testStripeConnection();

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Environment:', process.env.NODE_ENV);
            console.log('Database:', process.env.DB_NAME);
            console.log('Stripe configuration:', process.env.STRIPE_SECRET_KEY ? 'Present' : 'Missing');
            console.log('CORS enabled for:', process.env.NODE_ENV === 'production' 
                ? process.env.PRODUCTION_URL 
                : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5500']);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
