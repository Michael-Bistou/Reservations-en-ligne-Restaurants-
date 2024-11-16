// Initialize Stripe with your publishable key
const stripe = Stripe('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
let elements;
let paymentElement;

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('reservation-form');
    
    // Initialize payment
    initializePayment();

    // Handle form submission
    form.addEventListener('submit', handleSubmit);
});

async function initializePayment() {
    try {
        // Create PaymentIntent on the server
        const response = await fetch('http://localhost:3000/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 2000, // $20.00
                currency: 'eur'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create payment intent');
        }

        const { clientSecret } = await response.json();

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

    } catch (error) {
        console.error('Payment initialization error:', error);
        showMessage('Failed to initialize payment system. Please try again later.', true);
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    if (!stripe || !elements) {
        showMessage('Payment system not initialized. Please refresh the page.', true);
        return;
    }

    setLoading(true);

    try {
        // Submit the form data first
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            guests: document.getElementById('guests').value,
            specialRequests: document.getElementById('special-requests').value
        };

        // Validate form data
        if (!validateFormData(formData)) {
            setLoading(false);
            return;
        }

        // Confirm the payment
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/confirmation.html`,
                payment_method_data: {
                    billing_details: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone
                    }
                }
            }
        });

        if (error) {
            // This point will only be reached if there's an immediate error.
            // Otherwise, the customer will be redirected to the `return_url`.
            showMessage(error.message, true);
            setLoading(false);
        }

    } catch (error) {
        console.error('Payment error:', error);
        showMessage('An unexpected error occurred. Please try again.', true);
        setLoading(false);
    }
}

function validateFormData(formData) {
    // Check required fields
    const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'guests'];
    for (const field of requiredFields) {
        if (!formData[field]) {
            showMessage(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, true);
            return false;
        }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showMessage('Please enter a valid email address', true);
        return false;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(formData.phone)) {
        showMessage('Please enter a valid phone number', true);
        return false;
    }

    // Validate date (must be future date)
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        showMessage('Please select a future date', true);
        return false;
    }

    return true;
}

function setLoading(isLoading) {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = isLoading;
        
        const spinner = document.querySelector('#spinner');
        const buttonText = document.querySelector('#button-text');
        
        if (spinner && buttonText) {
            spinner.classList.toggle('hidden', !isLoading);
            buttonText.textContent = isLoading ? 'Processing...' : 'Pay Deposit & Reserve';
        }
    }
}

function showMessage(messageText, isError = false) {
    const messageDiv = document.getElementById('payment-message');
    if (messageDiv) {
        messageDiv.classList.remove('hidden');
        messageDiv.textContent = messageText;
        messageDiv.classList.toggle('error', isError);
        
        // Hide message after 4 seconds
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 4000);
    }
}

// Add this helper function to format currency
function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount / 100);
}

// Add event listeners for form field validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservation-form');
    if (form) {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }
});

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    switch (field.id) {
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            message = 'Please enter a valid email address';
            break;
        case 'phone':
            isValid = /^\+?[\d\s-]{8,}$/.test(value);
            message = 'Please enter a valid phone number';
            break;
        case 'date':
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            isValid = selectedDate >= today;
            message = 'Please select a future date';
            break;
    }

    if (!isValid && value !== '') {
        showMessage(message, true);
    }

    return isValid;
}
