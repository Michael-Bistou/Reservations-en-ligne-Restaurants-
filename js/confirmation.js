document.addEventListener('DOMContentLoaded', function() {
    // Get the payment intent client secret from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');

    const loadingElement = document.getElementById('loading');
    const successElement = document.getElementById('success');
    const errorElement = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const reservationDetails = document.getElementById('reservation-details');

    // If no payment intent is found, show error
    if (!paymentIntent) {
        showError('No payment information found.');
        return;
    }

    // Check payment status
    checkPaymentStatus(paymentIntent);
});

async function checkPaymentStatus(paymentIntentId) {
    try {
        const response = await fetch(`http://localhost:3000/api/check-payment-status/${paymentIntentId}`);
        const data = await response.json();

        if (response.ok) {
            if (data.status === 'succeeded') {
                showSuccess(data.reservation);
                // Send confirmation email
                sendConfirmationEmail(data.reservation);
            } else {
                showError('Payment was not successful. Please try again.');
            }
        } else {
            throw new Error(data.error || 'Failed to verify payment status');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error verifying payment. Please contact support.');
    }
}

function showSuccess(reservation) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('success').style.display = 'block';

    // Format the reservation details
    const reservationDetails = document.getElementById('reservation-details');
    reservationDetails.innerHTML = `
        <div class="detail-item">
            <i class="fas fa-utensils"></i>
            <span><strong>Restaurant:</strong> ${reservation.restaurant}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span><strong>Date:</strong> ${formatDate(reservation.date)}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span><strong>Time:</strong> ${formatTime(reservation.time)}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-users"></i>
            <span><strong>Guests:</strong> ${reservation.guests}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-user"></i>
            <span><strong>Name:</strong> ${reservation.name}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-envelope"></i>
            <span><strong>Email:</strong> ${reservation.email}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-bookmark"></i>
            <span><strong>Confirmation Number:</strong> ${reservation._id.slice(-6).toUpperCase()}</span>
        </div>
    `;

    // Set up calendar link
    setupCalendarLink(reservation);
}

function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error-message').textContent = message;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function setupCalendarLink(reservation) {
    const startTime = new Date(`${reservation.date}T${reservation.time}`);
    const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration

    const calendarEvent = {
        title: `Reservation at ${reservation.restaurant}`,
        start: startTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
        end: endTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
        description: `Reservation Details:\n` +
            `Number of Guests: ${reservation.guests}\n` +
            `Confirmation Number: ${reservation._id.slice(-6).toUpperCase()}\n` +
            `Contact: ${reservation.email}`,
        location: reservation.restaurant
    };

    const calendarLink = document.getElementById('calendar-link');
    calendarLink.href = createGoogleCalendarUrl(calendarEvent);
}

function createGoogleCalendarUrl(event) {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${event.start}/${event.end}`,
        details: event.description,
        location: event.location
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function sendConfirmationEmail(reservation) {
    try {
        const response = await fetch('http://localhost:3000/api/send-confirmation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reservationId: reservation._id })
        });

        if (!response.ok) {
            throw new Error('Failed to send confirmation email');
        }

        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        // Don't show this error to the user since the reservation was successful
    }
}

// Add animation for showing/hiding elements
function animateElement(element, show) {
    element.style.opacity = '0';
    element.style.display = show ? 'block' : 'none';
    
    if (show) {
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease-in-out';
            element.style.opacity = '1';
        }, 10);
    }
}

// Handle network errors and retries
async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
}

// Add copy to clipboard functionality for confirmation number
document.addEventListener('click', function(e) {
    if (e.target.matches('.detail-item .fas.fa-bookmark')) {
        const confirmationNumber = e.target.nextElementSibling.textContent.split(':')[1].trim();
        navigator.clipboard.writeText(confirmationNumber)
            .then(() => {
                // Show a temporary tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = 'Copied!';
                e.target.parentElement.appendChild(tooltip);
                setTimeout(() => tooltip.remove(), 2000);
            })
            .catch(err => console.error('Failed to copy:', err));
    }
});

// Add error boundary
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please try refreshing the page.');
});
