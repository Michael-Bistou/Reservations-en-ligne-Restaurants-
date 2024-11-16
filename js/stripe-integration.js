// Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_your_publishable_key');
const elements = stripe.elements();

// Create card Element
const card = elements.create('card', {
    style: {
        base: {
            color: '#32325d',
            fontFamily: '"Poppins", sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
});

// Mount the card Element
card.mount('#card-element');

// Handle real-time validation errors
card.addEventListener('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});

// Handle form submission
const form = document.getElementById('reservation-form');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', async function(event) {
    event.preventDefault();

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

    // Validate form first
    if (!validateForm(formData)) {
        return;
    }

    // Update UI to loading state
    submitButton.disabled = true;
    document.getElementById('spinner').classList.remove('hidden');
    document.getElementById('button-text').textContent = 'Processing...';

    try {
        // Create payment intent
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 2000, // $20.00
                currency: 'usd',
                reservation: formData
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Confirm card payment
        const result = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                }
            }
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        // Payment successful, create reservation
        const reservationResponse = await fetch('/api/create-reservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...formData,
                paymentId: result.paymentIntent.id
            })
        });

        const reservationData = await reservationResponse.json();

        if (reservationData.error) {
            throw new Error(reservationData.error);
        }

        // Show confirmation
        showConfirmation({
            ...formData,
            paymentId: result.paymentIntent.id
        });

    } catch (error) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
    } finally {
        // Reset UI state
        submitButton.disabled = false;
        document.getElementById('spinner').classList.add('hidden');
        document.getElementById('button-text').textContent = 'Pay Deposit & Reserve ($20)';
    }
});
