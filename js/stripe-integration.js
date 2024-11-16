// Initialize Stripe
const stripePublicKey = document.querySelector('#stripe-script').getAttribute('data-public-key');
const stripe = Stripe(stripePublicKey);
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
    
    const errorElement = document.getElementById('card-errors');
    errorElement.textContent = '';

    submitButton.disabled = true;
    document.getElementById('spinner').classList.remove('hidden');
    document.getElementById('button-text').textContent = 'Processing...';

    try {
        // Create payment intent
        const paymentResponse = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 2000,
                currency: 'usd'
            })
        });

        if (!paymentResponse.ok) {
            throw new Error('Payment intent creation failed');
        }

        const paymentData = await paymentResponse.json();

        // Confirm card payment
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            paymentData.clientSecret,
            {
                payment_method: {
                    card: card,
                    billing_details: {
                        name: form.name.value,
                        email: form.email.value,
                        phone: form.phone.value
                    }
                }
            }
        );

        if (confirmError) {
            throw new Error(confirmError.message);
        }

        // Create reservation
        const reservationResponse = await fetch('/api/create-reservation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                restaurant: form.restaurant.value,
                date: form.date.value,
                time: form.time.value,
                guests: form.guests.value,
                seating: form.seating.value,
                name: form.name.value,
                email: form.email.value,
                phone: form.phone.value,
                specialRequests: form['special-requests'].value,
                paymentIntentId: paymentIntent.id
            })
        });

        if (!reservationResponse.ok) {
            throw new Error('Failed to create reservation');
        }

        // Show success message
        showConfirmation({
            name: form.name.value,
            restaurant: form.restaurant.value,
            date: form.date.value,
            time: form.time.value,
            guests: form.guests.value,
            paymentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Error:', error);
        errorElement.textContent = error.message;
    } finally {
        submitButton.disabled = false;
        document.getElementById('spinner').classList.add('hidden');
        document.getElementById('button-text').textContent = 'Pay Deposit & Reserve ($20)';
    }
});

function showConfirmation(data) {
    const form = document.getElementById('reservation-form');
    const confirmationDiv = document.getElementById('confirmation-message');
    
    form.style.display = 'none';
    confirmationDiv.style.display = 'block';
    
    confirmationDiv.innerHTML = `
        <div class="confirmation-content">
            <h2>Reservation Confirmed!</h2>
            <p>Thank you, ${data.name}!</p>
            <div class="reservation-details">
                <h3>Your Reservation Details:</h3>
                <ul>
                    <li><strong>Restaurant:</strong> ${data.restaurant}</li>
                    <li><strong>Date:</strong> ${data.date}</li>
                    <li><strong>Time:</strong> ${data.time}</li>
                    <li><strong>Number of Guests:</strong> ${data.guests}</li>
                    <li><strong>Confirmation ID:</strong> ${data.paymentId}</li>
                </ul>
            </div>
            <p class="confirmation-note">A confirmation email has been sent to your email address.</p>
        </div>
    `;
}
