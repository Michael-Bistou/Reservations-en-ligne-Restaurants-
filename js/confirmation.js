document.addEventListener('DOMContentLoaded', function() {
    // Get the payment intent client secret from the URL
    const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret');
    const paymentIntentId = new URLSearchParams(window.location.search).get('payment_intent');

    if (!clientSecret) {
        showError('No payment information found.');
        return;
    }

    // Fetch the payment intent status
    fetch(`/api/payment-status/${paymentIntentId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(data.reservation);
                // Send confirmation email
                sendConfirmationEmail(data.reservation);
            } else {
                showError(data.error || 'Failed to confirm reservation.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Failed to verify payment status.');
        });
});

function showSuccess(reservation) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('success').style.display = 'block';

    // Fill in reservation details
    const detailsContainer = document.getElementById('reservation-details');
    detailsContainer.innerHTML = `
        <div class="detail-item">
            <i class="fas fa-utensils"></i>
            <span>${reservation.restaurant}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>${formatDate(reservation.date)}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>${reservation.time}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-users"></i>
            <span>${reservation.guests} guests</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-bookmark"></i>
            <span>Confirmation #: ${reservation._id.slice(-6).toUpperCase()}</span>
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

function setupCalendarLink(reservation) {
    const startTime = new Date(`${reservation.date}T${reservation.time}`);
    const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration

    const calendarEvent = {
        title: `Reservation at ${reservation.restaurant}`,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        description: `Reservation for ${reservation.guests} guests\nConfirmation #: ${reservation._id.slice(-6).toUpperCase()}`
    };

    const googleCalendarUrl = createGoogleCalendarUrl(calendarEvent);
    document.getElementById('calendar-link').href = googleCalendarUrl;
}

function createGoogleCalendarUrl(event) {
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${event.start.replace(/[-:]/g, '')}/${event.end.replace(/[-:]/g, '')}`,
        details: event.description
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function sendConfirmationEmail(reservation) {
    fetch('/api/send-confirmation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reservationId: reservation._id })
    }).catch(error => console.error('Error sending confirmation email:', error));
}
