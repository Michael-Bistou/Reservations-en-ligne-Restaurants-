document.addEventListener('DOMContentLoaded', () => {
    // Load all restaurant menus
    loadAllMenus();

    async function loadAllMenus() {
        const restaurants = ['italian', 'french', 'asian'];
        
        for (const restaurant of restaurants) {
            try {
                const response = await fetch(`/js/menuData/${restaurant}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const menuData = await response.json();
                displayMenu(menuData, restaurant);
            } catch (error) {
                console.error(`Error loading ${restaurant} menu:`, error);
                document.querySelector(`#${restaurant}-restaurant .menu-container`)
                    .innerHTML = '<p class="error">Failed to load menu. Please try again.</p>';
            }
        }
    }

    function displayMenu(menuData, restaurantType) {
        const menuContainer = document.querySelector(`#${restaurantType}-restaurant .menu-container`);
        menuContainer.innerHTML = ''; // Clear existing content

        Object.entries(menuData.categories).forEach(([category, items]) => {
            const categorySection = document.createElement('div');
            categorySection.className = 'menu-category';
            
            const categoryTitle = category
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());

            categorySection.innerHTML = `
                <h3>${categoryTitle}</h3>
                <div class="menu-items">
                    ${items.map(item => `
                        <div class="menu-item">
                            <h4>${item.name}</h4>
                            <p class="description">${item.description}</p>
                            <p class="price">$${item.price.toFixed(2)}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            
            menuContainer.appendChild(categorySection);
        });
    }
});
