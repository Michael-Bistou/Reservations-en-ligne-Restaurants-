document.addEventListener('DOMContentLoaded', function() {
    // Initialize Stripe
    const stripe = Stripe('pk_test_51PtammRpOPp0fqiuheB0dwsSSwIreBkjk2i5zXNwoKumifqxd94JWaekbR4Jk11WKNm91H3Nz6C1i0YXD7x3Cios00cyNAZNyA'); // Replace with your publishable key
    let elements;
    let paymentElement;

    // Form elements
    const form = document.getElementById('reservation-form');
    const submitButton = document.getElementById('submit-button');
    const buttonText = document.getElementById('button-text');
    const spinner = document.getElementById('spinner');
    const paymentMessage = document.getElementById('payment-message');

    // Initialize Flatpickr for date picker
    flatpickr("#date", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: [
            function(date) {
                // Disable Sundays and Mondays
                return (date.getDay() === 0 || date.getDay() === 1);
            }
        ],
        onChange: function(selectedDates, dateStr) {
            // Update available time slots based on the selected date
            updateAvailableTimeSlots(dateStr);
        }
    });

    // Initialize Flatpickr for time picker
    const timePicker = flatpickr("#time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        minTime: "11:30",
        maxTime: "21:30",
        defaultHour: 19,
        defaultMinute: 0,
        minuteIncrement: 30
    });

    // Initialize payment element
   async function initializePayment() {
       try {
           // Show loading state
           setLoading(true);
           var test = JSON.stringify({
            reservationDetails: {
                restaurant: document.getElementById('restaurant').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                guests: document.getElementById('guests').value,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value
            }
        });
        console.log(test);
           
           console.log('Initializing payment...'); // Debug log
   
           const response = await fetch('/api/create-payment-intent', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   reservationDetails: {
                       restaurant: document.getElementById('restaurant').value,
                       date: document.getElementById('date').value,
                       time: document.getElementById('time').value,
                       guests: document.getElementById('guests').value,
                       name: document.getElementById('name').value,
                       email: document.getElementById('email').value
                   }
               })
           });
   
           console.log('Response status:', response.status); // Debug log
   
           if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || 'Payment initialization failed');
           }
   
           const { clientSecret } = await response.json();
           console.log('Client secret received'); // Debug log
   
           elements = stripe.elements({
               clientSecret,
               appearance: {
                   theme: 'stripe',
                   variables: {
                       colorPrimary: '#0a6ebd',
                   }
               }
           });
   
           paymentElement = elements.create('payment');
           await paymentElement.mount('#payment-element');
           console.log('Payment element mounted'); // Debug log
   
       } catch (error) {
           console.error('Detailed payment initialization error:', error);
           showMessage('Failed to initialize payment system. Please try again later.', true);
       } finally {
           setLoading(false);
       }
   }
   

    // Update available time slots based on date and restaurant
    async function updateAvailableTimeSlots(selectedDate) {
        const restaurant = document.getElementById('restaurant').value;
        if (!restaurant || !selectedDate) return;

        try {
            const response = await fetch(`/api/available-times?restaurant=${restaurant}&date=${selectedDate}`);
            const data = await response.json();
            
            if (response.ok) {
                timePicker.set('enable', data.availableSlots);
            } else {
                console.error('Error fetching available times:', data.error);
            }
        } catch (error) {
            console.error('Error fetching available times:', error);
        }
    }

    // Form validation
    function validateForm() {
        clearErrors();
        let isValid = true;
        const formData = new FormData(form);

        // Email validation
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Phone validation
        const phone = formData.get('phone');
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(phone)) {
            showError('phone', 'Please enter a valid phone number');
            isValid = false;
        }

        // Name validation
        const name = formData.get('name');
        if (name.length < 3) {
            showError('name', 'Name must be at least 3 characters long');
            isValid = false;
        }

        // Guest number validation
        const guests = formData.get('guests');
        if (guests === '7+') {
            showError('guests', 'For groups larger than 6, please call us directly');
            isValid = false;
        }

        return isValid;
    }

    // Error handling functions
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        field.classList.add('error');
    }

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    function showMessage(messageText, isError = false) {
        paymentMessage.textContent = messageText;
        paymentMessage.classList.toggle('error-message', isError);
        paymentMessage.style.display = 'block';
    }

    // Handle form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const { error: submitError } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/confirmation.html`,
                    receipt_email: document.getElementById('email').value,
                    payment_method_data: {
                        billing_details: {
                            name: document.getElementById('name').value,
                            email: document.getElementById('email').value,
                            phone: document.getElementById('phone').value
                        }
                    }
                }
            });

            if (submitError) {
                showMessage(submitError.message, true);
            }

        } catch (error) {
            console.error('Payment error:', error);
            showMessage('An unexpected error occurred. Please try again.', true);
        }

        setLoading(false);
    });

    // Loading state utilities
    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        spinner.classList.toggle('hidden', !isLoading);
        buttonText.textContent = isLoading ? 'Processing...' : 'Pay Deposit & Reserve ($20)';
    }

    // Restaurant selection change handler
    document.getElementById('restaurant').addEventListener('change', function() {
        const selectedDate = document.getElementById('date').value;
        if (selectedDate) {
            updateAvailableTimeSlots(selectedDate);
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
        if (nav && nav.classList.contains('active') && !e.target.closest('.navbar')) {
            nav.classList.remove('active');
        }
    });

    // Initialize payment on page load
    initializePayment();
});
