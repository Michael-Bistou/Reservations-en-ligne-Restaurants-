require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const Reservation = require('./server/models/reservation.js');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 3000;


// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from public directory
app.use(express.static('public'));
app.use(express.json());

// Specific route for menu data
app.get('/js/menuData/:restaurant.json', (req, res) => {
    const restaurant = req.params.restaurant;
    const allowedRestaurants = ['italian', 'french', 'asian'];
    
    if (!allowedRestaurants.includes(restaurant)) {
        return res.status(404).json({ error: 'Menu not found' });
    }

    res.sendFile(path.join(__dirname, 'public', 'js', 'menuData', `${restaurant}.json`));
});

// Serve static files with proper paths
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Route handlers for pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/reservations', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reservations.html'));
});

// Restaurant data
const restaurants = {
    italian: {
        name: "La Bella Italia",
        openingHours: { start: "11:00", end: "23:00" },
        maxCapacity: 50
    },
    french: {
        name: "Le Petit Bistro",
        openingHours: { start: "12:00", end: "22:00" },
        maxCapacity: 40
    },
    asian: {
        name: "Asian Fusion",
        openingHours: { start: "11:30", end: "22:30" },
        maxCapacity: 45
    }
};

// Store reservations (replace with database in production)
let reservations = [];

// API Routes
app.get('/api/restaurants', (req, res) => {
    res.json({
        status: 'success',
        data: restaurants
    });
});

// Menu data route with error handling
app.get('/api/menu/:restaurant', (req, res) => {
    const { restaurant } = req.params;
    try {
        const menuData = require(`./js/menuData/${restaurant}.json`);
        res.json({
            status: 'success',
            data: menuData
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
            message: 'Menu not found'
        });
    }
});

// Contact form handling
app.post('/api/contact', (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validate form data
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required'
            });
        }

        // Here you would typically send an email or store the message
        // For now, we'll just send a success response
        res.json({
            status: 'success',
            message: 'Message received successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Reservations routes
app.get('/api/reservations', (req, res) => {
    res.json({
        status: 'success',
        data: reservations
    });
});

app.post('/api/create-payment-intent', async (req, res) => {
    try {
        console.log('Received payment intent request'); // Debug log

        // Validate Stripe key
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('Stripe secret key missing');
            throw new Error('Stripe configuration error');
        }

        const { reservationDetails } = req.body;
        console.log('Reservation details:', reservationDetails); // Debug log

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000, // $20.00 in cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                restaurant: reservationDetails?.restaurant || '',
                date: reservationDetails?.date || '',
                time: reservationDetails?.time || '',
                guests: reservationDetails?.guests || '',
                customerName: reservationDetails?.name || '',
                customerEmail: reservationDetails?.email || ''
            }
        });

        console.log('Payment intent created:', paymentIntent.id); // Debug log

        res.json({
            clientSecret: paymentIntent.client_secret
        });

    } catch (error) {
        console.error('Detailed payment intent creation error:', error);
        res.status(500).json({
            error: 'Payment intent creation failed',
            details: error.message
        });
    }
});

app.post('/api/reservations', (req, res) => {
    try {
        const reservation = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };

        // Validate reservation
        if (!reservation.restaurant || !reservation.name || 
            !reservation.email || !reservation.date || 
            !reservation.time || !reservation.guests) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        reservations.push(reservation);
        res.status(201).json({
            status: 'success',
            data: reservation
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Update reservation
app.put('/api/reservations/:id', (req, res) => {
    try {
        const { id } = req.params;
        const reservationIndex = reservations.findIndex(r => r.id === id);

        if (reservationIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Reservation not found'
            });
        }

        reservations[reservationIndex] = {
            ...reservations[reservationIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        res.json({
            status: 'success',
            data: reservations[reservationIndex]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Delete reservation
app.delete('/api/reservations/:id', (req, res) => {
    try {
        const { id } = req.params;
        const reservationIndex = reservations.findIndex(r => r.id === id);

        if (reservationIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Reservation not found'
            });
        }

        reservations.splice(reservationIndex, 1);
        res.json({
            status: 'success',
            message: 'Reservation deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something broke!'
    });
});

// Catch-all route for any unmatched routes
app.get('*', (req, res) => {
    res.redirect('/');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the application`);
});

// Available times endpoint
app.get('/available-times', async (req, res) => {
    try {
        const { restaurant, date } = req.query;

        if (!restaurant || !date) {
            return res.status(400).json({
                error: 'Restaurant and date are required'
            });
        }

        // Get existing reservations for the date
        const existingReservations = await Reservation.find({
            restaurant,
            date,
            status: 'confirmed'
        });

        // Generate time slots (30-minute intervals from 11:30 to 21:30)
        const timeSlots = [];
        const startTime = 11 * 60 + 30; // 11:30
        const endTime = 21 * 60 + 30;   // 21:30

        for (let time = startTime; time <= endTime; time += 30) {
            const hours = Math.floor(time / 60);
            const minutes = time % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            
            // Check if this time slot is available
            const reservationsAtTime = existingReservations.filter(r => r.time === timeString);
            if (reservationsAtTime.length < 4) { // Maximum 4 reservations per time slot
                timeSlots.push(timeString);
            }
        }

        res.json({ availableSlots: timeSlots });
    } catch (error) {
        console.error('Error fetching available times:', error);
        res.status(500).json({
            error: 'Failed to fetch available times'
        });
    }
});
// Get payment status endpoint
app.post('/api/payment-status/', async (req, res) => {
    const paymentId = String(req.body.paymentIntentId);
    try {
        const { paymentIntentId } = paymentId;
        console.log('Received payment intent ID:', paymentIntentId);
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            // Find associated reservation
            const reservation = await Reservation.findOne({ paymentIntentId });
            
            if (reservation) {
                res.json({
                    success: true,
                    reservation
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'Reservation not found'
                });
            }
        } else {
            res.json({
                success: false,
                error: 'Payment not completed'
            });
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check payment status'
        });
    }
});



// Create Reservation endpoint
app.post('/create-reservation', async (req, res) => {
    try {
        const {
            restaurant,
            date,
            time,
            guests,
            seating,
            name,
            email,
            phone,
            specialRequests,
            paymentIntentId
        } = req.body;

        // Validate required fields
        if (!restaurant || !date || !time || !guests || !name || !email || !paymentIntentId) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Verify payment intent status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                error: 'Payment has not been completed'
            });
        }

        // Create reservation
        const reservation = new Reservation({
            restaurant,
            date,
            time,
            guests,
            seating,
            name,
            email,
            phone,
            specialRequests,
            paymentIntentId,
            status: 'confirmed',
            paymentStatus: 'paid',
            createdAt: new Date()
        });

        await reservation.save();

        // Send confirmation email
        await sendConfirmationEmail(reservation);

        res.json({
            success: true,
            reservation,
            message: 'Reservation created successfully'
        });
    } catch (error) {
        console.error('Reservation creation error:', error);
        res.status(500).json({
            error: 'Failed to create reservation'
        });
    }
});
// Send confirmation email
async function sendConfirmationEmail(reservation) {
    try {
        const emailContent = `
            <h2>Reservation Confirmation</h2>
            <p>Dear ${reservation.name},</p>
            <p>Your reservation has been confirmed:</p>
            <ul>
                <li>Restaurant: ${reservation.restaurant}</li>
                <li>Date: ${new Date(reservation.date).toLocaleDateString()}</li>
                <li>Time: ${reservation.time}</li>
                <li>Guests: ${reservation.guests}</li>
                <li>Confirmation Number: ${reservation._id.toString().slice(-6).toUpperCase()}</li>
            </ul>
            <p>If you need to modify or cancel your reservation, please contact us.</p>
            <p>Thank you for choosing our restaurant!</p>
        `;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: reservation.email,
            subject: 'Reservation Confirmation',
            html: emailContent
        });
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        // Don't throw error to prevent blocking the reservation process
    }
}
// Verify payment endpoint
app.get('/verify-payment/:paymentIntentId', async (req, res) => {
    try {
        const { paymentIntentId } = req.params;
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        res.json({
            success: true,
            status: paymentIntent.status
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
        });
    }
});