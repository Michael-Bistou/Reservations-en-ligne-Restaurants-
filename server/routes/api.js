const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/reservation');
const nodemailer = require('nodemailer');

router.post('/change-language', (req, res) => {
    const { lng } = req.body;
    console.log('Changement de langue demandé:', lng);  // Ajoutez ce log pour vérifier
    res.cookie('i18next', lng); // Utilise un cookie pour enregistrer la langue choisie par l'utilisateur
    res.status(200).send('Language changed');
});

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

// Available times endpoint
router.get('/available-times', async (req, res) => {
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

// Create Payment Intent endpoint
router.post('/create-payment-intent', async (req, res) => {
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

// Get payment status endpoint
router.post('/payment-status', async (req, res) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
        return res.status(400).json({ error: 'Missing paymentIntentId' });
    }

    try {
        // Récupération du PaymentIntent à partir de Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            res.status(200).json({ status: 'succeeded', reservation: paymentIntent.metadata });
        } else {
            res.status(200).json({ status: paymentIntent.status });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du statut du paiement:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du statut du paiement' });
    }
});


// Create Reservation endpoint
router.post('/create-reservation', async (req, res) => {
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
router.get('/verify-payment/:paymentIntentId', async (req, res) => {
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



module.exports = router;
