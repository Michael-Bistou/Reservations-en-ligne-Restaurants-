document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        offset: 100,
        once: true
    });

    // Restaurant data
    const restaurantData = {
        italian: {
            name: "La Bella Italia",
            description: "Experience the authentic flavors of Italy in our romantic setting, where each dish tells a story of tradition and passion.",
            tags: ['Italian', 'Fine Dining', 'Wine Bar'],
            image: '/images/italian.jpg'
        },
        french: {
            name: "Le Petit Bistro",
            description: "Discover the essence of French cuisine with our carefully crafted dishes and elegant atmosphere.",
            tags: ['French', 'Bistro', 'Wine Selection'],
            image: '/images/french.jpg'
        },
        asian: {
            name: "Asian Fusion",
            description: "A modern take on traditional Asian flavors, blending contemporary techniques with authentic recipes.",
            tags: ['Asian', 'Fusion', 'Modern'],
            image: '/images/asian.jpg'
        }
    };

    // Mobile menu toggle
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    
    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Load restaurant data
    async function loadRestaurantData() {
        const container = document.getElementById('restaurant-cards-container');
        container.classList.add('loading');

        try {
            const restaurants = {
                italian: await fetch('/js/menuData/italian.json').then(res => res.json()),
                french: await fetch('/js/menuData/french.json').then(res => res.json()),
                asian: await fetch('/js/menuData/asian.json').then(res => res.json())
            };

            container.classList.remove('loading');
            container.innerHTML = ''; // Clear loading state
            
            // Create restaurant cards
            Object.entries(restaurants).forEach(([cuisine, data], index) => {
                const card = createRestaurantCard(cuisine, data, index);
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading restaurant data:', error);
            showError('Unable to load restaurant data. Please try again later.');
        }
    }

    function createRestaurantCard(cuisine, data, index) {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 100).toString());

        const restaurantInfo = restaurantData[cuisine];

        card.innerHTML = `
            <div class="restaurant-image">
                <img src="${restaurantInfo.image}" alt="${restaurantInfo.name}" 
                     onerror="this.src='/images/menu/default-restaurant.jpg'">
            </div>
            <div class="restaurant-info">
                <h3>${restaurantInfo.name}</h3>
                <p>${restaurantInfo.description}</p>
                <div class="cuisine-tags">
                    ${restaurantInfo.tags.map(tag => `<span>${tag}</span>`).join('')}
                </div>
                <div class="restaurant-buttons">
                    <a href="menu.html?restaurant=${cuisine}" class="view-menu-btn">
                        View Menu <i class="fas fa-arrow-right"></i>
                    </a>
                    <a href="reservations.html?restaurant=${cuisine}" class="book-table-btn">
                        Book a Table <i class="fas fa-calendar-alt"></i>
                    </a>
                </div>
            </div>
        `;

        return card;
    }

    function showError(message) {
        const container = document.getElementById('restaurant-cards-container');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    function changeLanguage(language) {
        fetch('/api/change-language', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lng: language })
        })
        .then(() => {
            location.reload(); // Recharge la page pour appliquer la langue choisie
        });
    }
    

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (nav.classList.contains('active') && !e.target.closest('.navbar')) {
            nav.classList.remove('active');
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    

    // Load restaurant data when the page loads
    loadRestaurantData();
});

