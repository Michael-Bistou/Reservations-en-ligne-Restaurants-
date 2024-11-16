const db = require('../config/database');

class Reservation {
    static async create(reservationData) {
        try {
            const [result] = await db.execute(
                `INSERT INTO reservations 
                (restaurant_id, date, time, guests, seating_preference, 
                customer_name, email, phone, special_requests, payment_id, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    reservationData.restaurant,
                    reservationData.date,
                    reservationData.time,
                    reservationData.guests,
                    reservationData.seating,
                    reservationData.name,
                    reservationData.email,
                    reservationData.phone,
                    reservationData.specialRequests,
                    reservationData.paymentId,
                    'confirmed'
                ]
            );
            return result.insertId;
        } catch (error) {
            throw new Error(`Error creating reservation: ${error.message}`);
        }
    }

    static async getAvailableTimeSlots(restaurant, date) {
        try {
            const [existingReservations] = await db.execute(
                'SELECT time FROM reservations WHERE restaurant_id = ? AND date = ?',
                [restaurant, date]
            );

            // Generate all possible time slots
            const allTimeSlots = this.generateTimeSlots();
            
            // Filter out booked slots
            const bookedTimes = existingReservations.map(res => res.time);
            return allTimeSlots.filter(slot => !bookedTimes.includes(slot));
        } catch (error) {
            throw new Error(`Error getting available times: ${error.message}`);
        }
    }

    static generateTimeSlots() {
        const slots = [];
        let hour = 11;
        let minute = 30;

        while (hour < 22) {
            slots.push(`${hour.toString().padStart(2, '0')}:${minute === 0 ? '00' : minute}`);
            minute += 30;
            if (minute === 60) {
                minute = 0;
                hour += 1;
            }
        }

        return slots;
    }
}

module.exports = Reservation;
