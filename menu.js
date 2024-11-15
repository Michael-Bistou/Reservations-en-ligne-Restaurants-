document.addEventListener('DOMContentLoaded', function() {
    // Menu Filter functionality
    const filterButtons = document.querySelectorAll('.menu-filters button');
    const menuItems = document.querySelectorAll('.menu-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            menuItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});


// Menu Items Data
const menuItems = [
    {
        name: "Margherita Pizza",
        category: "main",
        description: "Fresh tomatoes, mozzarella, and basil",
        price: 14.99,
        image: "pizza.jpg"
    },
    {
        name: "Tiramisu",
        category: "desserts",
        description: "Classic Italian dessert",
        price: 8.99,
        image: "tiramisu.jpg"
    },
    // Add more menu items here
];

// Menu Display Function
function displayMenuItems() {
    const menuSection = document.getElementById('menu-items');
    if (menuSection) {
        menuSection.innerHTML = '';
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
}

// Menu Filtering
function initMenuFilters() {
    const filterButtons = document.querySelectorAll('.menu-filters button');
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Filter menu items
                const filter = button.dataset.filter;
                filterMenuItems(filter);
            });
        });
    }
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
