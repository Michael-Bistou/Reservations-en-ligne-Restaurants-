document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS
    AOS.init({
        duration: 800,
        offset: 100,
        once: true
    });

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

    // Get restaurant parameter from URL
    const params = new URLSearchParams(window.location.search);
    const restaurant = params.get('restaurant');

    // Restaurant data (you can move this to a separate JSON file)
    const menuData = {
        italian: {
            name: "La Bella Italia",
            items: [
                {
                    name: "Bruschetta",
                    category: "starters",
                    price: "8.99",
                    description: "Toasted bread with fresh tomatoes, garlic, and basil",
                    image: "/images/menu/bruschetta.jpg"
                },
                {
                    name: "Margherita Pizza",
                    category: "main",
                    price: "14.99",
                    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
                    image: "/images/menu/pizza.jpg"
                },
                {
                    name: "Tiramisu",
                    category: "desserts",
                    price: "7.99",
                    description: "Classic Italian coffee-flavored dessert",
                    image: "/images/menu/tiramisu.jpg"
                },
                {
                    name: "Italian Red Wine",
                    category: "drinks",
                    price: "6.99",
                    description: "Glass of premium Italian red wine",
                    image: "/images/menu/wine.jpg"
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
                    description: "Traditional French onion soup with melted cheese",
                    image: "/images/menu/onion-soup.jpg"
                },
                {
                    name: "Coq au Vin",
                    category: "main",
                    price: "24.99",
                    description: "Chicken braised in wine with mushrooms and pearl onions",
                    image: "/images/menu/coq-au-vin.jpg"
                },
                {
                    name: "Crème Brûlée",
                    category: "desserts",
                    price: "8.99",
                    description: "Classic French custard with caramelized sugar top",
                    image: "/images/menu/creme-brulee.jpg"
                }
            ]
        },
        asian: {
            name: "Asian Fusion",
            items: [
                {
                    name: "Spring Rolls",
                    category: "starters",
                    price: "7.99",
                    description: "Fresh vegetable spring rolls with peanut sauce",
                    image: "/images/menu/spring-rolls.jpg"
                },
                {
                    name: "Pad Thai",
                    category: "main",
                    price: "16.99",
                    description: "Traditional Thai stir-fried rice noodles",
                    image: "/images/menu/pad-thai.jpg"
                },
                {
                    name: "Mango Sticky Rice",
                    category: "desserts",
                    price: "6.99",
                    description: "Sweet sticky rice with fresh mango",
                    image: "/images/menu/mango-sticky-rice.jpg"
                }
            ]
        }
    };

    // Load menu data
    function loadMenuData() {
        const container = document.getElementById('menu-items');
        container.classList.add('loading');

        try {
            const data = menuData[restaurant];
            if (!data) {
                throw new Error('Restaurant not found');
            }

            // Update restaurant name
            document.getElementById('restaurant-name').textContent = data.name;
            
            // Display menu items
            container.classList.remove('loading');
            displayMenuItems(data.items);
            
            // Initialize filters
            initializeFilters();
        } catch (error) {
            console.error('Error loading menu:', error);
            showError('Unable to load menu. Please try again later.');
        }
    }

    function displayMenuItems(items) {
        const container = document.getElementById('menu-items');
        container.innerHTML = items.map((item, index) => createMenuItem(item, index)).join('');
    }

    function createMenuItem(item, index) {
        return `
            <div class="menu-item" data-category="${item.category}" data-aos="fade-up" data-aos-delay="${index * 100}">
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="this.src='/images/menu/default-dish.jpg'">
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <h3 class="menu-item-title">${item.name}</h3>
                        <span class="menu-item-price">$${item.price}</span>
                    </div>
                    <p class="menu-item-description">${item.description}</p>
                    <span class="menu-item-category">${capitalizeFirstLetter(item.category)}</span>
                </div>
            </div>
        `;
    }

    function initializeFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter menu items
                const category = this.dataset.category;
                filterMenuItems(category);
            });
        });
    }

    function filterMenuItems(category) {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function showError(message) {
        const container = document.getElementById('menu-items');
        container.innerHTML = `
            <div class="menu-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (nav.classList.contains('active') && !e.target.closest('.navbar')) {
            nav.classList.remove('active');
        }
    });

    // Load menu data when page loads
    if (restaurant) {
        loadMenuData();
    } else {
        showError('No restaurant selected');
    }
});
