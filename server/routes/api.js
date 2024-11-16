const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Reservation = require('../models/reservation'); // Updated import
const { sendConfirmationEmail } = require('../utils/email');

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, reservation } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            metadata: {
                reservation: JSON.stringify(reservation)
            }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create reservation
router.post('/create-reservation', async (req, res) => {
    try {
        const reservationData = req.body;

        // Create reservation in database
        const reservationId = await Reservation.create(reservationData);

        // Send confirmation email
        await sendConfirmationEmail(reservationData);

        res.json({ 
            success: true, 
            message: 'Reservation created successfully',
            reservationId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available time slots
router.get('/available-times', async (req, res) => {
    try {
        const { restaurant, date } = req.query;
        const availableSlots = await Reservation.getAvailableTimeSlots(restaurant, date);
        res.json({ availableSlots });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
