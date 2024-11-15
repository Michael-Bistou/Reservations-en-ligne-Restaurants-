document.addEventListener('DOMContentLoaded', function() {
    initReservationForm();
    initAvailabilityChecker();
});

// Reservation Form Handler
function initReservationForm() {
    const form = document.getElementById('reservation-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.querySelector('input[type="text"]').value,
                email: this.querySelector('input[type="email"]').value,
                phone: this.querySelector('input[type="tel"]').value,
                location: this.querySelector('select[name="location"]').value,
                date: this.querySelector('input[type="date"]').value,
                time: this.querySelector('input[type="time"]').value,
                guests: this.querySelector('input[type="number"]').value,
                seating: this.querySelector('select[name="seating"]').value,
                requests: this.querySelector('textarea').value
            };

            // Basic validation
            if (!formData.name || !formData.email || !formData.phone || 
                !formData.date || !formData.time || !formData.guests || !formData.seating) {
                alert('Please fill in all required fields');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                alert('Please enter a valid email address');
                return;
            }

            showLoading();

            // Simulate API call
            setTimeout(() => {
                hideLoading();
                showConfirmation(formData);
                form.reset();
            }, 1500);
        });
    }
}

// Availability Checker
function initAvailabilityChecker() {
    const form = document.getElementById('availability-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const date = this.querySelector('#check-date').value;
            const time = this.querySelector('#check-time').value;
            const guests = this.querySelector('#check-guests').value;
            
            showLoading();
            
            // Simulate availability check
            setTimeout(() => {
                hideLoading();
                const available = Math.random() > 0.3; // Random availability
                const result = document.getElementById('availability-result');
                
                result.innerHTML = available 
                    ? '<p class="available">Tables are available! Please proceed with your reservation.</p>'
                    : '<p class="unavailable">Sorry, we\'re fully booked at that time. Please try another time slot.</p>';
            }, 1000);
        });
    }
}

// Confirmation Display
function showConfirmation(formData) {
    const confirmationMessage = `
        Thank you for your reservation!
        
        Reservation Details:
        Name: ${formData.name}
        Date: ${formData.date}
        Time: ${formData.time}
        Guests: ${formData.guests}
        Location: ${formData.location}
        Seating: ${formData.seating}
        
        We'll send a confirmation email to ${formData.email}
    `;
    
    alert(confirmationMessage);
}
