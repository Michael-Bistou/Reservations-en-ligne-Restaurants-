document.addEventListener('DOMContentLoaded', function() {
    // Menu data for three different restaurants
    const restaurants = {
        italian: {
            name: "La Bella Italia",
            items: [
                {
                    name: "Bruschetta",
                    category: "starters",
                    price: "8.99",
                    description: "Toasted bread with tomatoes, garlic, and fresh basil",
                    image: "images/menu/italian/bruschetta.jpg"
                },
                {
                    name: "Caprese Salad",
                    category: "starters",
                    price: "10.99",
                    description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze",
                    image: "images/menu/italian/caprese.jpg"
                },
                {
                    name: "Fettuccine Alfredo",
                    category: "main",
                    price: "16.99",
                    description: "Creamy pasta with parmesan cheese and butter sauce",
                    image: "images/menu/italian/fettuccine.jpg"
                },
                {
                    name: "Tiramisu",
                    category: "desserts",
                    price: "7.99",
                    description: "Classic Italian dessert with coffee and mascarpone",
                    image: "images/menu/italian/tiramisu.jpg"
                }
            ]
        },
        japanese: {
            name: "Sakura Sushi",
            items: [
                {
                    name: "Miso Soup",
                    category: "starters",
                    price: "4.99",
                    description: "Traditional Japanese soup with tofu and seaweed",
                    image: "images/menu/japanese/miso.jpg"
                },
                {
                    name: "California Roll",
                    category: "main",
                    price: "12.99",
                    description: "Crab, avocado, and cucumber roll",
                    image: "images/menu/japanese/california.jpg"
                },
                {
                    name: "Salmon Nigiri",
                    category: "main",
                    price: "14.99",
                    description: "Fresh salmon over pressed sushi rice",
                    image: "images/menu/japanese/nigiri.jpg"
                },
                {
                    name: "Green Tea Ice Cream",
                    category: "desserts",
                    price: "5.99",
                    description: "Traditional matcha ice cream",
                    image: "images/menu/japanese/matcha.jpg"
                }
            ]
        },
        french: {
            name: "Le Petit Bistro",
            items: [
                {
                    name: "French Onion Soup",
                    category: "starters",
                    price: "9.99",
                    description: "Classic soup with caramelized onions and melted cheese",
                    image: "images/menu/french/onionsoup.jpg"
                },
                {
                    name: "Coq au Vin",
                    category: "main",
                    price: "24.99",
                    description: "Braised chicken in red wine sauce",
                    image: "images/menu/french/coqauvin.jpg"
                },
                {
                    name: "Beef Bourguignon",
                    category: "main",
                    price: "26.99",
                    description: "Beef stewed in red wine with mushrooms",
                    image: "images/menu/french/bourguignon.jpg"
                },
                {
                    name: "Crème Brûlée",
                    category: "desserts",
                    price: "8.99",
                    description: "Classic French custard with caramelized sugar",
                    image: "images/menu/french/cremebrulee.jpg"
                }
            ]
        }
    };

    // Function to create menu item HTML
    function createMenuItem(item) {
        return `
            <div class="menu-item" data-category="${item.category}">
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-item-content">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <span class="price">$${item.price}</span>
                </div>
            </div>
        `;
    }

    // Function to display menu items
    function displayMenuItems(restaurant, category = 'all') {
        const menuContainer = document.querySelector('.menu-items');
        const restaurantTitle = document.querySelector('.restaurant-name');
        menuContainer.innerHTML = ''; // Clear existing items

        // Update restaurant name
        restaurantTitle.textContent = restaurants[restaurant].name;

        const filteredItems = category === 'all' 
            ? restaurants[restaurant].items 
            : restaurants[restaurant].items.filter(item => item.category === category);

        const menuHTML = filteredItems.map(createMenuItem).join('');
        menuContainer.innerHTML = menuHTML;

        // Add fade-in animation to new items
        const items = menuContainer.querySelectorAll('.menu-item');
        items.forEach((item, index) => {
            item.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;
        });
    }

    // Restaurant selector functionality
    const restaurantSelect = document.getElementById('restaurant-select');
    restaurantSelect.addEventListener('change', (e) => {
        const selectedRestaurant = e.target.value;
        displayMenuItems(selectedRestaurant);
        // Reset filter buttons
        document.querySelector('.menu-filters button[data-filter="all"]').click();
    });

    // Filter functionality
    const filterButtons = document.querySelectorAll('.menu-filters button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const category = button.getAttribute('data-filter');
            const selectedRestaurant = restaurantSelect.value;
            displayMenuItems(selectedRestaurant, category);
        });
    });

    // Initial display (Italian restaurant by default)
    displayMenuItems('italian');
});
