document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch restaurants data
        const response = await fetch('/api/restaurants');
        const result = await response.json();
        const restaurants = result.data;
        
        initReservationForm(restaurants);
        initPaymentHandling();
    } catch (error) {
        console.error('Error initializing reservation system:', error);
        showError('Failed to load reservation system');
    }
});

function initReservationForm(restaurants) {
    const form = document.getElementById('reservation-form');
    if (!form) return;

    // Populate restaurant select
    const restaurantSelect = form.querySelector('#restaurant');
    if (restaurantSelect) {
        Object.entries(restaurants).forEach(([key, restaurant]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = restaurant.name;
            restaurantSelect.appendChild(option);
        });
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            restaurant: form.restaurant.value,
            name: form.name.value,
            email: form.email.value,
            date: form.date.value,
            time: form.time.value,
            guests: parseInt(form.guests.value),
            paymentMethod: form.querySelector('input[name="payment-method"]:checked').value,
            specialRequests: form.specialRequests?.value
        };

        if (formData.paymentMethod === 'pay-now') {
            formData.paymentDetails = {
                cardHolder: form.cardHolder?.value,
                cardNumber: form.cardNumber?.value,
                expiryDate: form.expiryDate?.value,
                cvv: form.cvv?.value
            };
        }

        try {
            showLoading();
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message);
            }

            hideLoading();
            showConfirmation(result.data);
            form.reset();
        } catch (error) {
            hideLoading();
            showError('Failed to process reservation: ' + error.message);
        }
    });
}

function initPaymentHandling() {
    const paymentMethodInputs = document.querySelectorAll('input[name="payment-method"]');
    const onlinePaymentForm = document.getElementById('online-payment-form');

    if (paymentMethodInputs && onlinePaymentForm) {
        paymentMethodInputs.forEach(input => {
            input.addEventListener('change', function() {
                onlinePaymentForm.style.display = 
                    this.value === 'pay-now' ? 'block' : 'none';
            });
        });
    }
}

function showConfirmation(reservationData) {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'confirmation-message';
    confirmationDiv.innerHTML = `
        <h3>Reservation Confirmed!</h3>
        <p>Thank you, ${reservationData.name}!</p>
        <p>Your reservation details:</p>
        <ul>
            <li>Date: ${reservationData.date}</li>
            <li>Time: ${reservationData.time}</li>
            <li>Guests: ${reservationData.guests}</li>
            <li>Restaurant: ${reservationData.restaurant}</li>
        </ul>
        <p>A confirmation email has been sent to ${reservationData.email}</p>
    `;
    document.body.appendChild(confirmationDiv);

    // Remove confirmation after 5 seconds
    setTimeout(() => {
        confirmationDiv.remove();
    }, 5000);
}

function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
