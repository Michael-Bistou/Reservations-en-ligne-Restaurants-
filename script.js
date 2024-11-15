// Menu Items Data
const menuItems = [
    {
        name: "Bruschetta",
        category: "Appetizers",
        description: "Grilled bread with tomatoes, garlic, and olive oil",
        price: 8.99,
        image: "bruschetta.jpg"
    },
    {
        name: "Caprese Salad",
        category: "Appetizers",
        description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze",
        price: 10.99,
        image: "caprese.jpg"
    },
    {
        name: "Pasta Carbonara",
        category: "Main Course",
        description: "Classic Italian pasta with eggs, cheese, pancetta, and black pepper",
        price: 16.99,
        image: "carbonara.jpg"
    },
    {
        name: "Margherita Pizza",
        category: "Main Course",
        description: "Traditional pizza with tomato sauce, mozzarella, and fresh basil",
        price: 14.99,
        image: "pizza.jpg"
    },
    {
        name: "Tiramisu",
        category: "Desserts",
        description: "Classic Italian coffee-flavored dessert",
        price: 7.99,
        image: "tiramisu.jpg"
    },
    {
        name: "Panna Cotta",
        category: "Desserts",
        description: "Italian cream dessert with berry compote",
        price: 6.99,
        image: "pannacotta.jpg"
    },
    {
        name: "Italian Wine",
        category: "Beverages",
        description: "House selection of red or white wine",
        price: 8.99,
        image: "wine.jpg"
    },
    {
        name: "Espresso",
        category: "Beverages",
        description: "Traditional Italian coffee",
        price: 3.99,
        image: "espresso.jpg"
    }
];

// Form Validation
document.getElementById('reservation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.querySelector('input[type="text"]').value;
    const email = document.querySelector('input[type="email"]').value;
    const phone = document.querySelector('input[type="tel"]').value;
    const date = document.querySelector('input[type="date"]').value;
    const time = document.querySelector('input[type="time"]').value;
    const guests = document.querySelector('input[type="number"]').value;
    const seating = document.querySelector('select[name="seating"]').value;
    const specialRequests = document.querySelector('textarea').value;

    // Basic validation
    if (!name || !email || !phone || !date || !time || !guests || !seating) {
        alert('Please fill in all required fields');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // If validation passes, show confirmation
    showConfirmation(name, date, time, guests, seating);
});

// Reservation Confirmation
function showConfirmation(name, date, time, guests, seating) {
    alert(confirmationMessage);
    // Here you would typically send this data to a server
}

// Mobile Menu Toggle
const mobileMenuButton = document.createElement('button');
mobileMenuButton.className = 'mobile-menu-button';
mobileMenuButton.innerHTML = '☰';
document.querySelector('nav').prepend(mobileMenuButton);

mobileMenuButton.addEventListener('click', function() {
    const navUl = document.querySelector('nav ul');
    navUl.classList.toggle('show');
});

// Menu Display Function
function displayMenuItems() {
    const menuSection = document.getElementById('menu-items');
    menuItems.forEach(item => {
        const itemElement = `
            <div class="menu-item" data-category="${item.category}">
                <img src="images/${item.image}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p class="description">${item.description}</p>
                <span class="price">$${item.price.toFixed(2)}</span>
            </div>
        `;
        menuSection.innerHTML += itemElement;
    });
}

// Menu Filtering
function createMenuFilters() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'menu-filters';
    
    const filters = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages'];
    
    filters.forEach(filter => {
        const button = document.createElement('button');
        button.textContent = filter;
        button.addEventListener('click', () => filterMenuItems(filter));
        filterContainer.appendChild(button);
    });

    const menuSection = document.getElementById('menu');
    menuSection.insertBefore(filterContainer, menuSection.firstChild);
}

function filterMenuItems(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (category === 'All' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Gallery Section
function createGallery() {
    const gallery = document.createElement('section');
    gallery.id = 'gallery';
    gallery.innerHTML = `
        <h2>Our Restaurant</h2>
        <div class="gallery-grid">
            <img src="images/interior1.jpg" alt="Restaurant Interior">
            <img src="images/food1.jpg" alt="Signature Dish">
        </div>
    `;
    document.querySelector('main').appendChild(gallery);
}

// Reviews Section
function addReviewsSection() {
    const reviews = [
        {
            name: "John D.",
            rating: 5,
            text: "Amazing food and atmosphere! The pasta carbonara was exceptional."
        },
        {
            name: "Sarah M.",
            rating: 4,
            text: "Great service and delicious food. Will definitely come back!"
        },
        {
            name: "Michael R.",
            rating: 5,
            text: "Best Italian restaurant in town. The wine selection is outstanding."
        },
        {
            name: "Emily L.",
            rating: 5,
            text: "The tiramisu is to die for! Authentic Italian flavors."
        }
    ];

    const reviewsSection = document.createElement('section');
    reviewsSection.id = 'reviews';
    reviewsSection.innerHTML = `
        <h2>Customer Reviews</h2>
        <div class="reviews-container">
            ${reviews.map(review => `
                <div class="review">
                    <div class="stars">${'★'.repeat(review.rating)}</div>
                    <p>${review.text}</p>
                    <span class="reviewer">${review.name}</span>
                </div>
            `).join('')}
        </div>
    `;
    document.querySelector('main').appendChild(reviewsSection);
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    displayMenuItems();
    createMenuFilters();
    createGallery();
    addReviewsSection();
});
function initMap() {
    // Replace these coordinates with your restaurant's actual location
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

    // Add info window
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
// Newsletter Subscription
document.getElementById('newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    // Show loading animation
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        alert('Thank you for subscribing! You will receive our newsletter at: ' + email);
        this.reset();
    }, 1000);
});
