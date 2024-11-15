const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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
