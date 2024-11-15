document.addEventListener('DOMContentLoaded', function() {
    // Restaurant Data
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

    const form = document.getElementById('reservation-form');
    const restaurantSelect = document.getElementById('reservation-restaurant');
    const timeInput = document.getElementById('time');

    if (restaurantSelect) {
        restaurantSelect.addEventListener('change', function() {
            const selectedRestaurant = restaurants[this.value];
            if (selectedRestaurant && timeInput) {
                timeInput.min = selectedRestaurant.openingHours.start;
                timeInput.max = selectedRestaurant.openingHours.end;
            }
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = {
                restaurant: document.getElementById('reservation-restaurant').value,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                guests: document.getElementById('guests').value,
                specialRequests: document.getElementById('special-requests').value
            };

            if (validateForm(formData)) {
                // Show success message
                showConfirmation(formData);
                form.reset();
            }
        });
    }

    function validateForm(formData) {
        // Check if restaurant is selected
        if (!formData.restaurant) {
            alert('Please select a restaurant');
            return false;
        }

        // Check required fields
        if (!formData.name || !formData.email || !formData.phone || 
            !formData.date || !formData.time || !formData.guests) {
            alert('Please fill in all required fields');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address');
            return false;
        }

        // Phone validation (simple check for minimum length)
        if (formData.phone.replace(/\D/g, '').length < 10) {
            alert('Please enter a valid phone number');
            return false;
        }

        // Validate restaurant hours
        const selectedRestaurant = restaurants[formData.restaurant];
        if (selectedRestaurant) {
            const reservationTime = formData.time;
            if (reservationTime < selectedRestaurant.openingHours.start || 
                reservationTime > selectedRestaurant.openingHours.end) {
                alert(`${selectedRestaurant.name} is only open between ${selectedRestaurant.openingHours.start} and ${selectedRestaurant.openingHours.end}`);
                return false;
            }
        }

        return true;
    }

    function showConfirmation(formData) {
        const restaurant = restaurants[formData.restaurant];
        const confirmationMessage = `
            Reservation Confirmed!
            
            Restaurant: ${restaurant.name}
            Name: ${formData.name}
            Date: ${formData.date}
            Time: ${formData.time}
            Number of Guests: ${formData.guests}
            
            A confirmation email will be sent to ${formData.email}
        `;
        
        alert(confirmationMessage);
    }
});
