document.addEventListener('DOMContentLoaded', function() {
    const menuData = {};
    let currentRestaurant = 'italian';
    let currentCategory = 'starters';

    // Fetch menu data function
    async function fetchMenuData(restaurant) {
        try {
            const response = await fetch(`/js/menuData/${restaurant}.json`);
            const data = await response.json();
            menuData[restaurant] = data;
        } catch (error) {
            console.error(`Error loading ${restaurant} menu:`, error);
        }
    }

    // Initialize all menus
    async function initializeMenus() {
        await Promise.all([
            fetchMenuData('italian'),
            fetchMenuData('french'),
            fetchMenuData('asian')
        ]);
        updateMenu();
    }

    const restaurantSelect = document.getElementById('restaurant-select');
    const categoryTabs = document.querySelectorAll('.category-tabs .tab');
    const menuItemsContainer = document.querySelector('.menu-items');

    function updateMenu() {
        if (!menuData[currentRestaurant]) {
            console.error('Menu data not loaded');
            return;
        }

        const items = menuData[currentRestaurant][currentCategory];
        if (!items) {
            menuItemsContainer.innerHTML = '<p>No items available in this category</p>';
            return;
        }

        menuItemsContainer.innerHTML = items.map(item => `
            <div class="menu-item">
                <img src="/images/menu/${currentRestaurant}/${item.image}" 
                     alt="${item.name}"
                     loading="lazy">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <span class="price">€${item.price}</span>
                </div>
            </div>
        `).join('');
    }

    // Event Listeners
    if (restaurantSelect) {
        restaurantSelect.addEventListener('change', (e) => {
            currentRestaurant = e.target.value;
            updateMenu();
        });
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            updateMenu();
        });
    });

    // Initialize menus when page loads
    initializeMenus();
});
