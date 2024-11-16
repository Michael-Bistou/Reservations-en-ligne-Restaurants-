document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        offset: 100,
        once: true
    });

    // Initialize Flatpickr for date picker
    flatpickr("#date", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: [
            function(date) {
                // Disable Sundays and Mondays
                return (date.getDay() === 0 || date.getDay() === 1);
            }
        ]
    });

    // Initialize Flatpickr for time picker
    flatpickr("#time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        minTime: "11:30",
        maxTime: "21:30",
        defaultHour: 19,
        defaultMinute: 0
    });

    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const preselectedRestaurant = params.get('restaurant');
    
    if (preselectedRestaurant) {
        document.getElementById('restaurant').value = preselectedRestaurant;
    }

    // Form validation and submission
    const form = document.getElementById('reservation-form');
    const modal = document.getElementById('confirmation-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalBtn = document.querySelector('.modal-btn');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            restaurant: this.restaurant.value,
            date: this.date.value,
            time: this.time.value,
            guests: this.guests.value,
            seating: this.seating.value,
            name: this.name.value,
            email: this.email.value,
            phone: this.phone.value,
            specialRequests: this['special-requests'].value
        };

        // Validate form data
        if (!validateForm(formData)) {
            return;
        }

        // Show confirmation
        showConfirmation(formData);
    });

    function validateForm(data) {
        // Reset previous errors
        clearErrors();

        let isValid = true;

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Phone validation
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(data.phone)) {
            showError('phone', 'Please enter a valid phone number');
            isValid = false;
        }

        // Name validation
        if (data.name.length < 3) {
            showError('name', 'Name must be at least 3 characters long');
            isValid = false;
        }

        return isValid;
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.classList.add('invalid');
        
        const error = document.createElement('div');
        error.className = 'error';
        error.textContent = message;
        
        field.parentNode.appendChild(error);
    }

    function clearErrors() {
        document.querySelectorAll('.error').forEach(error => error.remove());
        document.querySelectorAll('.invalid').forEach(field => field.classList.remove('invalid'));
    }

    function showConfirmation(data) {
        const restaurantName = document.querySelector(`#restaurant option[value="${data.restaurant}"]`).textContent;
        const details = document.getElementById('confirmation-details');
        
        details.innerHTML = `
            <p><strong>Restaurant:</strong> ${restaurantName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Number of Guests:</strong> ${data.guests}</p>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone}</p>
            ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
        `;

        modal.classList.add('active');
    }

    // Modal close handlers
    function closeConfirmation() {
        modal.classList.remove('active');
        form.reset();
    }

    closeModal.addEventListener('click', closeConfirmation);
    modalBtn.addEventListener('click', closeConfirmation);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeConfirmation();
        }
    });

    // Mobile menu handlers
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    
    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (nav.classList.contains('active') && !e.target.closest('.navbar')) {
            nav.classList.remove('active');
        }
    });
});
