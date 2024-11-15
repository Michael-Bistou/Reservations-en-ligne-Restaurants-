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
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            showLoading();
            
            // Simulate API call
            setTimeout(() => {
                hideLoading();
                alert('Thank you for subscribing! You will receive our newsletter at: ' + email);
                this.reset();
            }, 1000);
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

// Google Maps Integration
function initMap() {
    if (document.getElementById('map')) {
        const restaurantLocation = {
            lat: 40.7128,  // Replace with your latitude
            lng: -74.0060  // Replace with your longitude
        };

        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: restaurantLocation,
            styles: [
                {
                    "featureType": "poi.business",
                    "elementType": "labels",
                    "stylers": [
                        {
                            "visibility": "on"
                        }
                    ]
                }
            ]
        });

        const marker = new google.maps.Marker({
            position: restaurantLocation,
            map: map,
            title: 'Your Restaurant Name'
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div class="map-info">
                    <h3>Your Restaurant Name</h3>
                    <p>123 Restaurant Street</p>
                    <p>New York, NY 10001</p>
                    <p><a href="tel:+1234567890">123-456-7890</a></p>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    }
}
