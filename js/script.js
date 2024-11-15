// Common functions and event listeners
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initNewsletterForm();
    initMap();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.innerHTML = '☰';
    document.querySelector('nav').prepend(mobileMenuButton);

    mobileMenuButton.addEventListener('click', function() {
        const navUl = document.querySelector('nav ul');
        navUl.classList.toggle('show');
    });
}

// Newsletter Subscription
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            showLoading();
            // You can add an API endpoint for newsletter subscription
            try {
                const response = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                hideLoading();
                alert('Thank you for subscribing! You will receive our newsletter at: ' + email);
                this.reset();
            } catch (error) {
                hideLoading();
                alert('Error subscribing to newsletter');
            }
        });
    }
}

// Loading Animation
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
