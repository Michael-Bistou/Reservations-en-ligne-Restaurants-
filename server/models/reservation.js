const db = require('../config/database');

class Reservation {
    // Create a new reservation
    static async create(reservationData) {
        try {
            // Validate required fields
            const requiredFields = ['restaurant', 'date', 'time', 'guests', 'name', 'email', 'phone'];
            for (const field of requiredFields) {
                if (!reservationData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            const [result] = await db.execute(
                `INSERT INTO reservations 
                (restaurant_id, date, time, guests, seating_preference, 
                customer_name, email, phone, special_requests, payment_intent_id, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    reservationData.restaurant,
                    reservationData.date,
                    reservationData.time,
                    reservationData.guests,
                    reservationData.seating || null,
                    reservationData.name,
                    reservationData.email,
                    reservationData.phone,
                    reservationData.specialRequests || null,
                    reservationData.paymentIntentId,
                    'confirmed'
                ]
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creating reservation: ${error.message}`);
        }
    }

    // Get available time slots for a specific restaurant and date
    static async getAvailableTimeSlots(restaurant, date) {
        try {
            // Validate inputs
            if (!restaurant || !date) {
                throw new Error('Restaurant and date are required');
            }

            // Get restaurant capacity (you might want to add this to your database)
            const [restaurantData] = await db.execute(
                'SELECT capacity FROM restaurants WHERE id = ?',
                [restaurant]
            );

            if (!restaurantData.length) {
                throw new Error('Restaurant not found');
            }

            const capacity = restaurantData[0].capacity;

            // Get existing reservations for the date
            const [existingReservations] = await db.execute(
                `SELECT time, guests 
                FROM reservations 
                WHERE restaurant_id = ? 
                AND date = ? 
                AND status != 'cancelled'`,
                [restaurant, date]
            );

            // Generate all possible time slots
            const allTimeSlots = this.generateTimeSlots();
            
            // Calculate available slots considering capacity
            const availableSlots = allTimeSlots.map(slot => {
                const reservationsAtTime = existingReservations.filter(res => res.time === slot);
                const totalGuests = reservationsAtTime.reduce((sum, res) => sum + res.guests, 0);
                return {
                    time: slot,
                    available: totalGuests < capacity,
                    remainingCapacity: capacity - totalGuests
                };
            });

            return availableSlots.filter(slot => slot.available);
        } catch (error) {
            throw new Error(`Error getting available times: ${error.message}`);
        }
    }

    // Generate time slots
    static generateTimeSlots() {
        const slots = [];
        let hour = 11; // Starting at 11:30 AM
        let minute = 30;

        while (hour < 22) { // Until 10:00 PM
            slots.push(`${hour.toString().padStart(2, '0')}:${minute === 0 ? '00' : minute}`);
            minute += 30;
            if (minute === 60) {
                minute = 0;
                hour += 1;
            }
        }

        return slots;
    }

    // Get reservation by ID
    static async getById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM reservations WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error getting reservation: ${error.message}`);
        }
    }

    // Update reservation status
    static async updateStatus(id, status) {
        try {
            const [result] = await db.execute(
                'UPDATE reservations SET status = ? WHERE id = ?',
                [status, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating reservation status: ${error.message}`);
        }
    }
    

    // Get reservations by email
    static async getByEmail(email) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM reservations WHERE email = ? ORDER BY date DESC, time DESC',
                [email]
            );
            return rows;
        } catch (error) {
            throw new Error(`Error getting reservations by email: ${error.message}`);
        }
    }
    

    // Cancel reservation
    static async cancel(id) {
        try {
            const [result] = await db.execute(
                'UPDATE reservations SET status = "cancelled" WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error cancelling reservation: ${error.message}`);
        }
    }
}

module.exports = Reservation;
