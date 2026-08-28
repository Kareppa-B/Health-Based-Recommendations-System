
// --- DATA (Restored `let` for profile, but `const` for history) ---
let userHealthProfile = { conditions: ["diabetes", "hypertension"], allergies: ["nuts"], medications: ["metformin", "lisinopril"], goals: ["weight-loss", "better-health"], diet: "vegetarian" };
const orderHistoryData = [{ orderId: "SF00123", date: "2025-09-01", total: "₹270", status: "Delivered", items: [{ name: "Quinoa Salad Bowl", qty: 1 }, { name: "Moong Dal", qty: 1 }] }, { orderId: "SF00121", date: "2025-08-25", total: "₹580", status: "Delivered", items: [{ name: "Grilled Salmon", qty: 1 }, { name: "Cucumber Raita", qty: 2 }] }, { orderId: "SF00124", date: "2025-09-05", total: "₹120", status: "Processing", items: [{ name: "Vegetable Daliya", qty: 1 }] }];
const favoriteFoodData = [{ id: 2, emoji: "🐟", title: "Grilled Salmon", description: "Omega-3 rich salmon grilled with herbs - excellent for heart health", rating: 4.9, price: 420, tags: ["Heart-Healthy", "High Protein", "Anti-inflammatory"], healthBenefits: ["Omega-3 Fatty Acids", "Low Sodium", "Lean Protein"], cuisine: "continental", healthCategory: "recommended", healthReason: "Rich in omega-3 fatty acids which help reduce blood pressure and inflammation.", nutritionalInfo: { carbs: "0g", protein: "25g", fiber: "0g", sodium: "80mg" } }, { id: 5, emoji: "🥘", title: "Moong Dal", description: "Yellow lentils cooked with minimal spices - gentle on digestion", rating: 4.7, price: 90, tags: ["High Protein", "Easy Digest", "Low Fat"], healthBenefits: ["Plant Protein", "B Vitamins", "Iron Rich"], cuisine: "indian", healthCategory: "safe", healthReason: "Excellent source of plant protein with minimal impact on blood sugar.", nutritionalInfo: { carbs: "15g", protein: "12g", fiber: "6g", sodium: "100mg" } }];
const healthAwareFoodData = { healthRecommendations: [{ id: 1, emoji: "🥗", title: "Quinoa Salad Bowl", description: "Low glycemic index quinoa with fresh vegetables - perfect for blood sugar management", rating: 4.8, price: 180, tags: ["Diabetes-Friendly", "Heart-Healthy", "High Fiber"], healthBenefits: ["Low GI", "Rich in Protein", "Heart Healthy"], cuisine: "continental", healthCategory: "recommended", healthReason: "Low glycemic index helps maintain stable blood sugar levels. High fiber content aids in diabetes management.", nutritionalInfo: { carbs: "22g", protein: "8g", fiber: "5g", sodium: "120mg" } }, { id: 2, emoji: "🐟", title: "Grilled Salmon", description: "Omega-3 rich salmon grilled with herbs - excellent for heart health", rating: 4.9, price: 420, tags: ["Heart-Healthy", "High Protein", "Anti-inflammatory"], healthBenefits: ["Omega-3 Fatty Acids", "Low Sodium", "Lean Protein"], cuisine: "continental", healthCategory: "recommended", healthReason: "Rich in omega-3 fatty acids which help reduce blood pressure and inflammation.", nutritionalInfo: { carbs: "0g", protein: "25g", fiber: "0g", sodium: "80mg" } }, { id: 3, emoji: "🥒", title: "Cucumber Raita", description: "Cooling yogurt-based dish with low sodium and high probiotics", rating: 4.5, price: 80, tags: ["Low Sodium", "Probiotic", "Cooling"], healthBenefits: ["Probiotics", "Low Calorie", "Hydrating"], cuisine: "indian", healthCategory: "recommended", healthReason: "Low in sodium, helps with blood pressure management. Probiotics support digestive health.", nutritionalInfo: { carbs: "8g", protein: "4g", fiber: "2g", sodium: "45mg" } }], safeOptions: [{ id: 4, emoji: "🍲", title: "Vegetable Daliya", description: "Broken wheat porridge with mixed vegetables - wholesome and filling", rating: 4.6, price: 120, tags: ["High Fiber", "Low GI", "Vegetarian"], healthBenefits: ["Sustained Energy", "High Fiber", "Low Fat"], cuisine: "indian", healthCategory: "safe", healthReason: "Complex carbohydrates provide sustained energy without blood sugar spikes.", nutritionalInfo: { carbs: "28g", protein: "6g", fiber: "8g", sodium: "150mg" } }, { id: 5, emoji: "🥘", title: "Moong Dal", description: "Yellow lentils cooked with minimal spices - gentle on digestion", rating: 4.7, price: 90, tags: ["High Protein", "Easy Digest", "Low Fat"], healthBenefits: ["Plant Protein", "B Vitamins", "Iron Rich"], cuisine: "indian", healthCategory: "safe", healthReason: "Excellent source of plant protein with minimal impact on blood sugar.", nutritionalInfo: { carbs: "15g", protein: "12g", fiber: "6g", sodium: "100mg" } }, { id: 6, emoji: "🥬", title: "Palak Paneer (Low Salt)", description: "Spinach curry with cottage cheese, prepared with minimal salt", rating: 4.4, price: 160, tags: ["Iron Rich", "Low Sodium", "Calcium Rich"], healthBenefits: ["Iron", "Calcium", "Folate"], cuisine: "indian", healthCategory: "safe", healthReason: "Iron-rich spinach supports healthy blood. Low sodium version helps with blood pressure.", nutritionalInfo: { carbs: "10g", protein: "14g", fiber: "4g", sodium: "200mg" } }], moderateOptions: [{ id: 7, emoji: "🍛", title: "Brown Rice Pulao", description: "Aromatic brown rice with vegetables - consume in moderation", rating: 4.2, price: 140, tags: ["Whole Grain", "Moderate GI", "Portion Control"], healthBenefits: ["Whole Grain", "B Vitamins", "Manganese"], healthWarnings: ["Watch Portion Size"], cuisine: "indian", healthCategory: "moderate", healthReason: "Brown rice has moderate glycemic index. Portion control recommended for diabetes management.", nutritionalInfo: { carbs: "35g", protein: "5g", fiber: "3g", sodium: "180mg" } }, { id: 8, emoji: "🥭", title: "Mango Lassi (Sugar-free)", description: "Sweet mango yogurt drink with natural sweetener", rating: 4.0, price: 100, tags: ["Probiotic", "Sugar-free", "Limited Serving"], healthBenefits: ["Probiotics", "Vitamin C", "Calcium"], healthWarnings: ["Natural Fruit Sugars"], cuisine: "indian", healthCategory: "moderate", healthReason: "Contains natural fruit sugars. Limit to small portions to manage blood sugar.", nutritionalInfo: { carbs: "18g", protein: "6g", fiber: "1g", sodium: "65mg" } }] };
const mockRestaurants = [
    { name: "Healthy Eats Cafe", healthRating: 4.8 },
    { name: "The Green Leaf Bistro", healthRating: 4.6 },
    { name: "FitFood Kitchen", healthRating: 4.9 },
    { name: "Nourish & Co.", healthRating: 4.5 },
    { name: "Earthly Delights", healthRating: 4.2 }
];

// --- App-wide Settings Object (Restored) ---
let userSettings = {
    notifications: {
        healthTips: true,
        orderEmail: true,
        healthAlerts: true
    },
    preferences: {
        defaultSort: 'default'
    }
};

// --- Global State ---
let shoppingCart = {};
const filters = { health: document.getElementById('healthFilter'), cuisine: document.getElementById('cuisineFilter') };
let currentFilters = { health: '', cuisine: '', search: '' };
let currentSort = 'default';

// --- Global DOM variables ---
const searchInput = document.getElementById('searchInput'), searchBtn = document.getElementById('searchBtn'), fabBtn = document.getElementById('fabBtn'), recipeModal = document.getElementById('recipeModal'), closeModal = document.getElementById('closeModal'), modalTitle = document.getElementById('modalTitle'), modalBody = document.getElementById('modalBody'), sidebarItems = document.querySelectorAll('.sidebar-item');
const cartIcon = document.getElementById('cartIcon');
const cartCountEl = document.getElementById('cartCount');
const popoverContent = document.getElementById('popoverContent');
const popoverTotal = document.getElementById('popoverTotal');

// --- Section Variables (Restored) ---
const mainDashboardView = document.getElementById('mainDashboardView');
const healthSection = document.getElementById('healthSection');
const safeSection = document.getElementById('safeSection');
const moderateSection = document.getElementById('moderateSection');
const favoritesSection = document.getElementById('favoritesSection');
const historySection = document.getElementById('historySection');
const cartSection = document.getElementById('cartSection');
const settingsSection = document.getElementById('settingsSection'); // Settings section is back
const cartContainer = document.getElementById('cartContainer');

// ======== NEW THEME TOGGLE JAVASCRIPT ========
const rootEl = document.documentElement;

function applyTheme(theme) {
    if (theme === 'dark') {
        rootEl.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        rootEl.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    if (rootEl.classList.contains('dark')) {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        // If user has a saved preference, use it
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // If no saved preference, check OS setting
        applyTheme('dark');
    } else {
        // Default to light
        applyTheme('light');
    }
}
// ======== END NEW THEME JAVASCRIPT ========


// --- DATA & PRICE HELPER FUNCTIONS ---
function getAllFoodData() {
    return [...healthAwareFoodData.healthRecommendations, ...healthAwareFoodData.safeOptions, ...healthAwareFoodData.moderateOptions, ...favoriteFoodData];
}
function findFoodById(itemId) {
    const allFoodMap = new Map();
    getAllFoodData().forEach(item => {
        if (!allFoodMap.has(item.id)) {
            allFoodMap.set(item.id, item);
        }
    });
    return allFoodMap.get(itemId);
}
function getRestaurantPriceModifier(restaurantName) {
    let hash = 0;
    for (let i = 0; i < restaurantName.length; i++) {
        hash = (hash << 5) - hash + restaurantName.charCodeAt(i);
        hash |= 0;
    }
    const modifierRange = 0.25;
    const normalizedHash = (Math.abs(hash) % 100) / 100;
    return (normalizedHash * modifierRange) - 0.10;
}
function getSpecificRestaurantPrice(basePrice, restaurantName) {
    const modifier = getRestaurantPriceModifier(restaurantName);
    const specificPrice = basePrice + (basePrice * modifier);
    return Math.round(specificPrice / 5) * 5;
}
function getPriceRange(basePrice) {
    const minPrice = Math.floor(basePrice + (basePrice * -0.10));
    const maxPrice = Math.floor(basePrice + (basePrice * 0.15));
    const cleanMin = Math.floor(minPrice / 5) * 5;
    const cleanMax = Math.ceil(maxPrice / 5) * 5;
    if (cleanMin === cleanMax) return `₹${cleanMin}`;
    return `₹${cleanMin} - ₹${cleanMax}`;
}

// --- RATING HELPER FUNCTIONS ---
function getSpecificRestaurantRating(baseRating, restaurantName) {
    const modifier = getRestaurantPriceModifier(restaurantName);
    let ratingChange = modifier * 2;
    let specificRating = baseRating + ratingChange;
    if (specificRating > 5.0) specificRating = 5.0;
    if (specificRating < 3.5) specificRating = 3.5;
    return specificRating;
}
function calculateAverageRating(baseRating) {
    const allRatings = mockRestaurants.map(restaurant => {
        return getSpecificRestaurantRating(baseRating, restaurant.name);
    });
    const sum = allRatings.reduce((acc, rating) => acc + rating, 0);
    const avg = sum / allRatings.length;
    return avg.toFixed(1);
}

// --- SORTING FUNCTION ---
function sortFoodData(dataArray) {
    const sortedArray = [...dataArray];
    switch (currentSort) {
        case 'price-asc':
            sortedArray.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sortedArray.sort((a, b) => b.price - a.price);
            break;
        case 'rating-desc':
            sortedArray.sort((a, b) => b.rating - a.rating);
            break;
        case 'default':
        default:
            break;
    }
    return sortedArray;
}

// --- CORE APP FUNCTIONS ---
function initDashboard() {
    // Load settings on init
    currentSort = userSettings.preferences.defaultSort;
    document.getElementById('sortFilter').value = currentSort;

    initializeTheme(); // <-- ADDED: Set theme on load

    displayHealthConditions();
    displayFoodCards();
    displayOrderHistory();
    animateStats();
    setupEventListeners();
    updateAllCartUI();
    const initialView = location.hash.substring(1) || 'dashboard';
    showView(initialView, true);
}

function displayHealthConditions() {
    const healthConditionsEl = document.getElementById('healthConditions');
    if (healthConditionsEl) {
        const conditionLabels = { 'diabetes': 'Diabetes Type 2', 'hypertension': 'Hypertension', 'high-cholesterol': 'High Cholesterol', 'kidney-disease': 'Kidney Disease' };
        if (userHealthProfile.conditions.length > 0) {
            healthConditionsEl.innerHTML = userHealthProfile.conditions.map(c => `<span class="health-condition">${conditionLabels[c] || c}</span>`).join('');
        } else {
            healthConditionsEl.innerHTML = `<span style="font-size: 0.8rem; color: #7f8c8d;">No conditions listed.</span>`;
        }
    }
}

// ======== THIS FUNCTION IS NOW UPDATED FOR SEARCH LOGIC ========
function displayFoodCards() {
    // Get all the section elements we need to toggle
    const healthSectionEl = document.getElementById('healthSection');
    const safeSectionEl = document.getElementById('safeSection');
    const moderateSectionEl = document.getElementById('moderateSection');
    const healthGridEl = document.getElementById('healthRecommendationsGrid');

    // Get the title and badge elements so we can change them
    const healthTitleEl = healthSectionEl.querySelector('.section-title');
    const healthBadgeEl = healthSectionEl.querySelector('.health-recommendation-badge');

    if (currentFilters.search) {
        // --- SEARCH MODE IS ACTIVE ---

        // 1. Hide the other dashboard sections
        safeSectionEl.style.display = 'none';
        moderateSectionEl.style.display = 'none';

        // 2. Modify the main section to become a "Search Results" section
        healthSectionEl.style.display = 'block';
        healthTitleEl.textContent = `Search Results for "${currentFilters.search}"`;
        healthBadgeEl.style.display = 'none'; // Hide the "Personalized" badge

        // 3. Get ALL dashboard food, filter it, and sort it
        const allDashboardFood = [
            ...healthAwareFoodData.healthRecommendations,
            ...healthAwareFoodData.safeOptions,
            ...healthAwareFoodData.moderateOptions
        ];

        // filterFoodData function already applies ALL current filters (search, health dropdown, cuisine dropdown)
        const searchResults = filterFoodData(allDashboardFood);
        const finalResults = sortFoodData(searchResults);

        // 4. Render the final results directly into the (now repurposed) health grid
        if (finalResults.length === 0) {
            healthGridEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🤷</div><p>No items match your filters or search.</p></div>';
        } else {
            healthGridEl.innerHTML = finalResults.map(item => createHealthAwareFoodCard(item)).join('');
        }

    } else {
        // --- DEFAULT DASHBOARD MODE (NO SEARCH) ---

        // 1. Restore section visibility
        safeSectionEl.style.display = 'block';
        moderateSectionEl.style.display = 'block';
        healthSectionEl.style.display = 'block';

        // 2. Restore main section title and badge
        healthTitleEl.textContent = 'Health-Based Recommendations';
        healthBadgeEl.style.display = 'inline-block'; // Restore badge

        // 3. Run the original display logic (each section filters its own data)
        displayFoodSection('healthRecommendations', healthAwareFoodData.healthRecommendations);
        displayFoodSection('safeOptions', healthAwareFoodData.safeOptions);
        displayFoodSection('moderate', healthAwareFoodData.moderateOptions);
    }

    // Always display/update the favorites grid (its main visibility is controlled by showView function)
    displayFoodSection('favorites', favoriteFoodData);
}

function displayFoodSection(section, data) {
    const grid = document.getElementById(section + 'Grid');
    if (!grid) return;
    const filteredData = filterFoodData(data); // This filters the specific data array passed to it
    const finalData = sortFoodData(filteredData);

    if (finalData.length === 0) {
        // Don't show an empty state message for dashboard sections unless it's the favorites page
        if (section === 'favorites') {
            grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❤️</div><p>You have no favorite items yet.</p></div>';
        } else {
            // Hide the grid, but don't show an error (we do that only for a global search)
            grid.innerHTML = '';
        }

        // If search is active, we don't need this logic (it's handled in displayFoodCards)
        // This is to prevent "no items" message from appearing in default dashboard sections when filters are set
        if (currentFilters.search && section !== 'favorites') {
            grid.innerHTML = ''; // Search handles its own empty state
        }

    } else {
        grid.innerHTML = finalData.map(item => createHealthAwareFoodCard(item)).join('');
    }
}


function displayOrderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    if (orderHistoryData.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>You have no past orders.</p></div>';
    } else {
        const sortedHistory = orderHistoryData.sort((a, b) => new Date(b.date) - new Date(a.date));
        list.innerHTML = sortedHistory.map(order => createOrderHistoryCard(order)).join('');
    }
}

function createOrderHistoryCard(order) {
    const itemsHtml = order.items.map(item => `<li>${item.qty} x ${item.name}</li>`).join('');
    const statusClass = order.status.toLowerCase();
    return `<div class="order-history-item"><div class="order-history-header"><div><div class="order-id">Order #${order.orderId}</div><div style="font-size: 0.8rem; color: #7f8c8d;">${order.date}</div></div><span class="order-status ${statusClass}">${order.status}</span></div><div class="order-details"><div><strong>Items:</strong><ul class="order-items-list">${itemsHtml}</ul></div><div style="text-align: right;"><strong>Total:</strong><div style="font-weight: 600; font-size: 1.2rem; color: #2c3e50;">${order.total}</div></div></div><div style="text-align: right;"><button class="order-reorder-btn" onclick="reorder('${order.orderId}')">Reorder</button></div></div>`;
}

function filterFoodData(data) {
    // This function checks the GLOBAL filters against ANY data array passed to it
    return data.filter(item => {
        const healthMatch = !currentFilters.health || item.tags.some(t => t.toLowerCase().includes(currentFilters.health.replace('-', ' '))) || item.healthBenefits.some(b => b.toLowerCase().includes(currentFilters.health.replace('-', ' ')));
        const cuisineMatch = !currentFilters.cuisine || item.cuisine === currentFilters.cuisine;
        const searchMatch = !currentFilters.search || item.title.toLowerCase().includes(currentFilters.search.toLowerCase()) || item.description.toLowerCase().includes(currentFilters.search.toLowerCase()) || item.tags.some(t => t.toLowerCase().includes(currentFilters.search.toLowerCase()));
        return healthMatch && cuisineMatch && searchMatch;
    });
}

function createHealthAwareFoodCard(item) {
    const healthClass = `health-${item.healthCategory}`, healthTags = item.healthBenefits.map(b => `<span class="health-benefit-tag">${b}</span>`).join(''), warningTags = (item.healthWarnings || []).map(w => `<span class="health-warning-tag">${w}</span>`).join('');
    const avgRating = calculateAverageRating(item.rating);
    return `<div class="food-card ${healthClass}" data-id="${item.id}" onclick="openRecipeModal(${item.id})"><div class="food-image">${item.emoji}</div><div class="food-info"><h3 class="food-title">${item.title}</h3><p class="food-description">${item.description}</p><div class="food-tags">${item.tags.map(t => `<span class="food-tag">${t}</span>`).join('')}${healthTags}${warningTags}</div><div class="food-meta"><div class="food-rating"><span>⭐</span><span>${avgRating}</span><span class="rating-avg-label">(Avg)</span></div><div class="food-price">${getPriceRange(item.price)}</div></div></div></div>`;
}

function animateStats() {
    document.querySelectorAll('.stat-number').forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-count')), increment = target / 100;
        let current = 0;
        const update = () => { if (current < target) { current += increment; counter.textContent = target % 1 !== 0 ? current.toFixed(1) : Math.ceil(current); setTimeout(update, 20); } else { counter.textContent = target; } };
        update();
    });
}

function setupEventListeners() {
    // ======== ADDED THEME TOGGLE LISTENER ========
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Click and Enter listeners still work, running the same function
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') performSearch(); });

    // ======== THIS IS THE UPDATED REALTIME SEARCH LISTENER ========
    // Runs performSearch() on every keystroke, paste, or delete.
    searchInput.addEventListener('input', performSearch);


    Object.keys(filters).forEach(type => {
        filters[type].addEventListener('change', e => {
            currentFilters[type] = e.target.value;
            displayFoodCards();
        });
    });

    const sortFilter = document.getElementById('sortFilter');
    sortFilter.addEventListener('change', (e) => {
        currentSort = e.target.value;
        displayFoodCards();
    });

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.getAttribute('data-section');
            navigateTo(viewName);
        });
    });

    const viewAllBtns = document.querySelectorAll('.view-all-btn');
    viewAllBtns.forEach(btn => {
        const parentSection = btn.closest('.section');
        const gridId = parentSection.querySelector('.food-grid').id;
        let viewName;
        if (gridId === 'safeOptionsGrid') viewName = 'view-safe-options';
        else if (gridId === 'moderateGrid') viewName = 'view-moderate-options';
        if (viewName) {
            btn.addEventListener('click', () => navigateTo(viewName));
        }
    });

    closeModal.addEventListener('click', closeRecipeModal);
    recipeModal.addEventListener('click', e => { if (e.target === recipeModal) closeRecipeModal(); });

    // ======== FAB BUTTON ACTION UPDATED ========
    fabBtn.addEventListener('click', () => showNotification('AI Health Assistant coming soon!', 'info'));

    cartIcon.addEventListener('click', () => navigateTo('cart'));
    document.getElementById('popoverViewCartBtn').addEventListener('click', () => {
        navigateTo('cart');
    });

    // --- Profile Popover Listeners (Restored) ---
    document.getElementById('profileAvatar').addEventListener('click', () => navigateTo('profile'));
    document.getElementById('popoverProfileBtn').addEventListener('click', () => navigateTo('profile'));
    document.getElementById('popoverSettingsBtn').addEventListener('click', () => navigateTo('settings')); // Re-wired to settings page
    document.getElementById('popoverLogoutBtn').addEventListener('click', handleLogout);
}

// ======== THIS FUNCTION IS NOW UPDATED (Notification removed) ========
function performSearch() {
    currentFilters.search = searchInput.value.trim();
    displayFoodCards(); // This function now contains all the search/restore logic

    /* NOTIFICATION REMOVED FOR REALTIME SEARCH
       Firing on every keystroke is annoying. The visual change is the only feedback needed.
    if (currentFilters.search) {
        showNotification(`Searching for health-friendly "${currentFilters.search}"...`, 'info');
    }
    */
}

// --- NAVIGATION & VIEW FUNCTIONS (Restored) ---
function navigateTo(viewName) {
    const currentHash = location.hash.substring(1);
    if (currentHash === viewName && viewName === 'profile') {
        openProfileModal();
        return;
    }
    if (currentHash === viewName) return;

    showView(viewName);
    if (viewName !== 'profile') {
        history.pushState({ view: viewName }, "", `#${viewName}`);
    } else if (currentHash !== 'dashboard' && currentHash !== 'recommendations') {
        history.pushState({ view: viewName }, "", `#${viewName}`);
    }
}

function showView(viewName, isInitialLoad = false) {
    // Hide all main sections
    [mainDashboardView, favoritesSection, historySection, cartSection, settingsSection].forEach(s => s.style.display = 'none');
    sidebarItems.forEach(i => i.classList.remove('active'));
    let notificationMessage = '';

    // When changing views, ALWAYS clear the search filter and restore the dashboard
    if (currentFilters.search) {
        currentFilters.search = '';
        searchInput.value = '';
        // No need to call displayFoodCards() here, it will be called by the logic below
    }

    switch (viewName) {
        case 'dashboard':
        case 'recommendations':
            mainDashboardView.style.display = 'block';
            displayFoodCards(); // This will now run the "else" block (restore logic)
            const itemToActivate = viewName === 'dashboard' ? 'dashboard' : 'recommendations';
            const activeItem = document.querySelector(`.sidebar-item[data-section="${itemToActivate}"]`);
            if (activeItem) activeItem.classList.add('active');
            notificationMessage = itemToActivate === 'dashboard' ? 'Dashboard view loaded' : 'All recommendations loaded';
            break;
        case 'health-recommendations':
            mainDashboardView.style.display = 'block';
            displayFoodCards(); // Run restore logic
            document.getElementById('safeSection').style.display = 'none'; // Then hide sections
            document.getElementById('moderateSection').style.display = 'none';
            document.querySelector('.sidebar-item[data-section="health-recommendations"]').classList.add('active');
            notificationMessage = 'Health-based recommendations loaded';
            break;
        case 'cart':
            cartSection.style.display = 'block';
            document.querySelector('.sidebar-item[data-section="cart"]').classList.add('active');
            renderCartView();
            notificationMessage = 'Shopping cart loaded';
            break;
        case 'favorites':
            favoritesSection.style.display = 'block';
            displayFoodSection('favorites', favoriteFoodData); // Just render favorites
            document.querySelector('.sidebar-item[data-section="favorites"]').classList.add('active');
            notificationMessage = 'Your favorite dishes loaded';
            break;
        case 'history':
            historySection.style.display = 'block';
            document.querySelector('.sidebar-item[data-section="history"]').classList.add('active');
            displayOrderHistory(); // Refresh history view
            notificationMessage = 'Order history loaded';
            break;
        case 'profile':
            mainDashboardView.style.display = 'block';
            displayFoodCards(); // Restore dashboard view
            const profileItem = document.querySelector('.sidebar-item[data-section="profile"]');
            if (profileItem) profileItem.classList.add('active');
            openProfileModal();
            break;
        // --- Settings Case is BACK ---
        case 'settings':
            settingsSection.style.display = 'block';
            const settingsItem = document.querySelector('.sidebar-item[data-section="settings"]');
            if (settingsItem) settingsItem.classList.add('active');
            showSettingsTab('account', document.querySelector('.settings-nav-item'));
            loadHealthSettings();
            loadNotificationSettings();
            loadPreferencesSettings();
            notificationMessage = 'Settings loaded';
            break;
        case 'view-safe-options':
            mainDashboardView.style.display = 'block';
            displayFoodCards(); // Restore dashboard
            document.getElementById('healthSection').style.display = 'none'; // Hide other sections
            document.getElementById('moderateSection').style.display = 'none';
            notificationMessage = 'Showing all "Safe Options for You"';
            break;
        case 'view-moderate-options':
            mainDashboardView.style.display = 'block';
            displayFoodCards(); // Restore dashboard
            document.getElementById('healthSection').style.display = 'none'; // Hide other sections
            document.getElementById('safeSection').style.display = 'none';
            notificationMessage = 'Showing all "Moderate Consumption"';
            break;
        default:
            mainDashboardView.style.display = 'block';
            displayFoodCards(); // Restore dashboard
            const dashItem = document.querySelector('.sidebar-item[data-section="dashboard"]');
            if (dashItem) dashItem.classList.add('active');
            notificationMessage = 'Dashboard view loaded';
    }
    if (!isInitialLoad && notificationMessage) {
        showNotification(notificationMessage, 'info');
    }
}

window.addEventListener('popstate', (e) => {
    let view = (e.state && e.state.view) ? e.state.view : (location.hash.substring(1) || 'dashboard');
    showView(view);
});


// --- MODAL & CART FUNCTIONS ---

function openRecipeModal(itemId) {
    const item = findFoodById(itemId);
    if (!item) return;
    modalTitle.textContent = item.title;
    const avgRating = calculateAverageRating(item.rating);
    modalBody.innerHTML = `<div style="text-align: center; margin-bottom: 2rem;"><div style="font-size: 6rem; margin-bottom: 1rem;">${item.emoji}</div><div class="food-tags">${item.tags.map(t => `<span class="food-tag">${t}</span>`).join('')}${item.healthBenefits.map(b => `<span class="health-benefit-tag">${b}</span>`).join('')}</div></div>${item.healthReason ? `<div class="health-recommendation-reason"><h5>Why This is ${item.healthCategory === 'recommended' ? 'Recommended' : item.healthCategory === 'safe' ? 'Safe' : 'For Moderate Consumption'}</h5><p>${item.healthReason}</p></div>` : ''}<div class="nutritional-info">${Object.entries(item.nutritionalInfo).map(([k, v]) => `<div class="nutritional-item"><div class="nutritional-value">${v}</div><div class="nutritional-label">${k.charAt(0).toUpperCase() + k.slice(1)}</div></div>`).join('')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2rem"><div><h4 style="margin-bottom:.5rem;color:#2c3e50">Rating</h4><div style="display:flex;align-items:center;gap:.5rem"><span>⭐</span><span style="font-weight:600">${avgRating} (Avg)</span></div></div><div><h4 style="margin-bottom:.5rem;color:#2c3e50">Price Range</h4><div style="font-weight:600;color:#e74c3c;font-size:1.2rem">${getPriceRange(item.price)}</div></div></div><div style="margin-bottom:2rem"><h4 style="margin-bottom:1rem;color:#2c3e50">Description</h4><p style="line-height:1.6;color:#7f8c8d">${item.description}</p></div><div style="margin-bottom:2rem"><h4 style="margin-bottom:1rem;color:#2c3e50">Health Benefits</h4><ul style="list-style-type:none;padding:0">${item.healthBenefits.map(b => `<li style="padding:.5rem 0;border-bottom:1px solid #ecf0f1">• ${b}</li>`).join('')}</ul></div>${item.healthWarnings ? `<div style="margin-bottom:2rem;background:rgba(241,196,15,.1);padding:1rem;border-radius:8px;border-left:4px solid #f1c40f"><h4 style="margin-bottom:1rem;color:#f39c12">Health Considerations</h4><ul style="list-style-type:none;padding:0;color:#e67e22">${item.healthWarnings.map(w => `<li style="padding:.25rem 0">⚠️ ${w}</li>`).join('')}</ul></div>` : ''}<div style="display:flex;gap:1rem;margin-top:2rem"><button onclick="addToCart(${item.id})" style="flex:1;padding:12px;background:linear-gradient(135deg,#2ecc71,#27ae60);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">Add to Cart</button><button onclick="addToFavorites(${item.id})" style="flex:1;padding:12px;background:linear-gradient(135deg,#e74c3c,#c0392b);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">Add to Favorites</button></div>`;
    recipeModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { modalBody.scrollTop = 0; }, 0);
}

function closeRecipeModal() {
    document.body.style.overflow = '';
    recipeModal.classList.remove('show');
}

function updateAllCartUI() {
    updateCartCount();
    updateCartPopover();
}

function updateCartCount() {
    let totalItems = 0;
    for (const itemArray of Object.values(shoppingCart)) {
        totalItems += itemArray.reduce((sum, item) => sum + item.qty, 0);
    }
    cartCountEl.textContent = totalItems;
    cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none';
}

function updateCartPopover() {
    const cartKeys = Object.keys(shoppingCart);
    if (cartKeys.length === 0) {
        popoverContent.innerHTML = '<div class="popover-empty">Your cart is empty.</div>';
        popoverTotal.textContent = '₹0';
        return;
    }
    let grandTotal = 0;
    let itemsHtml = '';
    for (const [restaurantName, itemsArray] of Object.entries(shoppingCart)) {
        itemsArray.forEach(item => {
            const itemTotal = item.price * item.qty;
            grandTotal += itemTotal;
            itemsHtml += `
                        <div class="popover-item">
                            <span class="popover-item-qty">${item.qty}x</span>
                            <div class="popover-item-info">
                                <div class="popover-item-title">${item.title}</div>
                                <div class="popover-item-restaurant">from ${restaurantName}</div>
                            </div>
                            <span class="popover-item-price">₹${itemTotal}</span>
                        </div>
                    `;
        });
    }
    popoverContent.innerHTML = itemsHtml;
    popoverTotal.textContent = `₹${grandTotal}`;
}

function addToCart(itemId) {
    closeRecipeModal();
    openRestaurantSelector(itemId);
}

function openRestaurantSelector(itemId) {
    const item = findFoodById(itemId);
    modalTitle.textContent = `Get ${item.title} from...`;
    const restaurantData = mockRestaurants.map(restaurant => ({
        name: restaurant.name,
        healthRating: restaurant.healthRating,
        price: getSpecificRestaurantPrice(item.price, restaurant.name)
    }));
    restaurantData.sort((a, b) => b.healthRating - a.healthRating);
    const restaurantButtonsHtml = restaurantData.map(data => {
        const safeName = data.name.replace(/'/g, "\\'");
        return `<button class="restaurant-select-btn" onclick="confirmAddToCart(${itemId}, '${safeName}')">
                            <div>
                                <strong>${data.name}</strong>
                                <div class="restaurant-health-rating">⭐ ${data.healthRating} Health Rating</div>
                            </div>
                            <div>₹${data.price}</div>
                        </button>`;
    }).join('');
    const sortControlsHtml = `
                <div class="modal-sort-controls">
                    <strong style="color: #2c3e50; font-size: 0.9rem; margin-right: 0.5rem;">Sort by:</strong>
                    <span class="sort-tag active" onclick="sortRestaurantList('recommended', ${itemId}, this)">Recommended</span>
                    <span class="sort-tag" onclick="sortRestaurantList('price-asc', ${itemId}, this)">Price: Low-High</span>
                    <span class="sort-tag" onclick="sortRestaurantList('price-desc', ${itemId}, this)">Price: High-Low</span>
                </div>
            `;
    modalBody.innerHTML = `
                ${sortControlsHtml}
                <div id="restaurantListContainer">
                    ${restaurantButtonsHtml}
                </div>`;
    recipeModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { modalBody.scrollTop = 0; }, 0);
}

function sortRestaurantList(sortKey, itemId, clickedElement) {
    const item = findFoodById(itemId);
    if (!item) return;
    if (clickedElement) {
        const siblings = clickedElement.parentNode.querySelectorAll('.sort-tag');
        siblings.forEach(tag => tag.classList.remove('active'));
        clickedElement.classList.add('active');
    }
    const restaurantData = mockRestaurants.map(restaurant => ({
        name: restaurant.name,
        healthRating: restaurant.healthRating,
        price: getSpecificRestaurantPrice(item.price, restaurant.name)
    }));
    switch (sortKey) {
        case 'price-asc':
            restaurantData.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            restaurantData.sort((a, b) => b.price - a.price);
            break;
        case 'recommended':
        default:
            restaurantData.sort((a, b) => b.healthRating - a.healthRating);
            break;
    }
    const restaurantButtonsHtml = restaurantData.map(data => {
        const safeName = data.name.replace(/'/g, "\\'");
        return `<button class="restaurant-select-btn" onclick="confirmAddToCart(${itemId}, '${safeName}')">
                            <div>
                                <strong>${data.name}</strong>
                                <div class="restaurant-health-rating">⭐ ${data.healthRating} Health Rating</div>
                            </div>
                            <div>₹${data.price}</div>
                        </button>`;
    }).join('');
    document.getElementById('restaurantListContainer').innerHTML = restaurantButtonsHtml;
}


function confirmAddToCart(itemId, restaurantName) {
    const foodItem = findFoodById(itemId);
    if (!foodItem) return;
    const specificPrice = getSpecificRestaurantPrice(foodItem.price, restaurantName);
    if (!shoppingCart[restaurantName]) {
        shoppingCart[restaurantName] = [];
    }
    const existingItem = shoppingCart[restaurantName].find(item => item.id === itemId);
    if (existingItem) {
        existingItem.qty++;
    } else {
        shoppingCart[restaurantName].push({
            id: foodItem.id,
            title: foodItem.title,
            price: specificPrice,
            emoji: foodItem.emoji,
            qty: 1
        });
    }
    updateAllCartUI();
    showNotification(`${foodItem.title} (₹${specificPrice}) added from ${restaurantName}!`, 'success');
    closeRecipeModal();
}


function renderCartView() {
    if (Object.keys(shoppingCart).length === 0) {
        cartContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛒</div><p>Your cart is empty. Add some healthy meals!</p></div>';
        return;
    }
    let grandTotal = 0;
    let allCartsHtml = '';
    for (const [restaurantName, itemsArray] of Object.entries(shoppingCart)) {
        let restaurantSubtotal = 0;
        const itemsHtml = itemsArray.map(item => {
            const itemTotal = item.price * item.qty;
            restaurantSubtotal += itemTotal;
            const safeName = restaurantName.replace(/'/g, "\\'");
            return `
                        <div class="cart-item">
                            <div class="cart-item-emoji">${item.emoji}</div>
                            <div class="cart-item-info">
                                <h4>${item.title}</h4>
                                <div class="cart-item-price">₹${item.price} x ${item.qty} = <strong>₹${itemTotal}</strong></div>
                            </div>
                            <div class="cart-item-qty">
                                <button class="cart-qty-btn" onclick="updateCartQuantity('${safeName}', ${item.id}, -1)">-</button>
                                <span style="font-weight: bold; width: 20px; text-align: center;">${item.qty}</span>
                                <button class="cart-qty-btn" onclick="updateCartQuantity('${safeName}', ${item.id}, 1)">+</button>
                            </div>
                            <button class="cart-item-remove" onclick="removeFromCart('${safeName}', ${item.id})">✕</button>
                        </div>
                    `;
        }).join('');
        allCartsHtml += `
                    <div class="cart-restaurant-group">
                        <div class="cart-restaurant-header">${restaurantName}</div>
                        ${itemsHtml}
                    </div>
                `;
        grandTotal += restaurantSubtotal;
    }
    const summaryHtml = `
                <div class="cart-summary">
                    <div class="cart-total">
                        <span class="cart-total-label">Grand Total:</span>
                        <span class="cart-total-value">₹${grandTotal}</span>
                    </div>
                    <button class="checkout-btn" onclick="handleCheckout()">Proceed to Checkout (All Orders)</button>
                </div>
            `;
    cartContainer.innerHTML = allCartsHtml + summaryHtml;
}

function updateCartQuantity(restaurantName, itemId, change) {
    const restaurantCart = shoppingCart[restaurantName];
    if (!restaurantCart) return;
    const item = restaurantCart.find(i => i.id === itemId);
    if (!item) return;
    item.qty += change;
    if (item.qty <= 0) {
        removeFromCart(restaurantName, itemId);
    } else {
        renderCartView();
        updateAllCartUI();
    }
}

function removeFromCart(restaurantName, itemId) {
    const restaurantCart = shoppingCart[restaurantName];
    if (!restaurantCart) return;
    shoppingCart[restaurantName] = restaurantCart.filter(i => i.id !== itemId);
    if (shoppingCart[restaurantName].length === 0) {
        delete shoppingCart[restaurantName];
    }
    const foodItem = findFoodById(itemId);
    showNotification(`${foodItem.title} removed from ${restaurantName} cart.`, 'error');
    renderCartView();
    updateAllCartUI();
}

function handleCheckout() {
    if (Object.keys(shoppingCart).length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    showNotification('Processing all healthy orders!', 'success');
    shoppingCart = {};
    renderCartView();
    updateAllCartUI();
}

// --- OTHER FUNCTIONS (Profile, Logout, etc) ---

function reorder(orderId) {
    showNotification(`Reordering items from order #${orderId}...`, 'success');
}
function addToFavorites(itemId) {
    showNotification('Added to your healthy favorites!', 'success');
}

function openProfileModal() {
    modalTitle.textContent = 'Health Profile';
    const conditionLabels = { 'diabetes': 'Diabetes Type 2', 'hypertension': 'Hypertension', 'high-cholesterol': 'High Cholesterol', 'kidney-disease': 'Kidney Disease' };
    modalBody.innerHTML = `<div style="text-align:center;margin-bottom:2rem"><div class="profile-avatar" style="width:80px;height:80px;font-size:2rem;margin:0 auto 1rem">JD</div><h3>John Doe</h3><p style="color:#7f8c8d">john.doe@email.com</p></div><div style="margin-bottom:2rem"><h4 style="margin-bottom:1rem;color:#2c3e50">Health Conditions</h4><div class="food-tags">${userHealthProfile.conditions.map(c => `<span class="health-condition">${conditionLabels[c] || c}</span>`).join('')}</div></div><div style="margin-bottom:2rem"><h4 style="margin-bottom:1rem;color:#2c3e50">Dietary Preferences</h4><div class="food-tags"><span class="food-tag">Vegetarian</span><span class="food-tag">Low Sodium</span><span class="food-tag">Sugar Conscious</span></div></div><div style="margin-bottom:2rem"><h4 style="margin-bottom:1rem;color:#2c3e50">Health Goals</h4><div class="food-tags">${userHealthProfile.goals.map(g => `<span class="health-benefit-tag">${g.charAt(0).toUpperCase() + g.slice(1).replace('-', ' ')}</span>`).join('')}</div></div><div style="margin-bottom:2rem"><h4 style="margin-bottom:1rem;color:#2c3e50">Health Stats</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"><div style="text-align:center;padding:1rem;background:#f8f9fa;border-radius:8px"><div style="font-size:1.5rem;font-weight:bold;color:#27ae60">28</div><div style="color:#7f8c8d;font-size:.9rem">Healthy Meals</div></div><div style="text-align:center;padding:1rem;background:#f8f9fa;border-radius:8px"><div style="font-size:1.5rem;font-weight:bold;color:#3498db">4.8</div><div style="color:#7f8c8d;font-size:.9rem">Health Score</div></div></div></div>
            <button id="updateProfileBtn" onclick="editHealthProfile()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                Update Health Profile
            </button>`; // Restored button text and onclick
    recipeModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { modalBody.scrollTop = 0; }, 0);
}

// Restored original editHealthProfile function
window.editHealthProfile = function () {
    const updateBtn = document.getElementById('updateProfileBtn');
    if (!updateBtn) return;
    updateBtn.disabled = true;
    updateBtn.innerHTML = `<span class="button-spinner"></span> Updating...`;
    showNotification('Redirecting to health profile update...', 'info');
    setTimeout(() => {
        window.location.replace('onBoarding.html');
    }, 1500);
}

function handleLogout() { if (confirm('Are you sure you want to logout?')) { showNotification('Logging out...', 'info'); setTimeout(() => { window.location.href = 'login.html'; }, 1500); } }

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    const n = document.createElement('div'); n.className = `notification ${type}`; n.textContent = message; document.body.appendChild(n);
    setTimeout(() => { n.style.animation = 'slideOutRight 0.3s ease-in forwards'; setTimeout(() => { if (document.body.contains(n)) document.body.removeChild(n); }, 300); }, 4000);
}

// --- SETTINGS PAGE FUNCTIONS (Restored) ---
const allPossibleConditions = { 'diabetes': 'Diabetes Type 2', 'hypertension': 'Hypertension', 'high-cholesterol': 'High Cholesterol', 'kidney-disease': 'Kidney Disease' };
const allPossibleGoals = { 'weight-loss': 'Weight Loss', 'better-health': 'Better Health', 'muscle-gain': 'Muscle Gain', 'lower-bp': 'Lower Blood Pressure' };

function showSettingsTab(tabName, clickedElement) {
    document.querySelectorAll('.settings-tab-pane').forEach(pane => pane.style.display = 'none');
    document.querySelectorAll('.settings-nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(`settings-tab-${tabName}`).style.display = 'block';
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
}

function loadHealthSettings() {
    const conditionsList = document.getElementById('healthConditionsList');
    conditionsList.innerHTML = Object.entries(allPossibleConditions).map(([key, label]) => {
        const isChecked = userHealthProfile.conditions.includes(key) ? 'checked' : '';
        return `
                    <label class="checkbox-label">
                        <input type="checkbox" name="health-condition" value="${key}" ${isChecked}>
                        <span>${label}</span>
                    </label>`;
    }).join('');
    const goalsList = document.getElementById('healthGoalsList');
    goalsList.innerHTML = Object.entries(allPossibleGoals).map(([key, label]) => {
        const isChecked = userHealthProfile.goals.includes(key) ? 'checked' : '';
        return `
                    <label class="checkbox-label">
                        <input type="checkbox" name="health-goal" value="${key}" ${isChecked}>
                        <span>${label}</span>
                    </label>`;
    }).join('');
}

function saveHealthSettings() {
    const selectedConditions = [];
    document.querySelectorAll('input[name="health-condition"]:checked').forEach(cb => {
        selectedConditions.push(cb.value);
    });
    userHealthProfile.conditions = selectedConditions; // UPDATE GLOBAL OBJECT
    const selectedGoals = [];
    document.querySelectorAll('input[name="health-goal"]:checked').forEach(cb => {
        selectedGoals.push(cb.value);
    });
    userHealthProfile.goals = selectedGoals; // UPDATE GLOBAL OBJECT
    showNotification('Health Profile Updated!', 'success');
    displayHealthConditions();
    displayFoodCards();
}

function loadNotificationSettings() {
    document.getElementById('toggle-health-tips').checked = userSettings.notifications.healthTips;
    document.getElementById('toggle-order-email').checked = userSettings.notifications.orderEmail;
    document.getElementById('toggle-health-alerts').checked = userSettings.notifications.healthAlerts;
}

function saveNotificationSettings() {
    userSettings.notifications.healthTips = document.getElementById('toggle-health-tips').checked;
    userSettings.notifications.orderEmail = document.getElementById('toggle-order-email').checked;
    userSettings.notifications.healthAlerts = document.getElementById('toggle-health-alerts').checked;
    showNotification('Notification settings saved!', 'success');
}

function loadPreferencesSettings() {
    document.getElementById('defaultSortSelect').value = userSettings.preferences.defaultSort;
}

function savePreferencesSettings() {
    userSettings.preferences.defaultSort = document.getElementById('defaultSortSelect').value;
    currentSort = userSettings.preferences.defaultSort;
    document.getElementById('sortFilter').value = currentSort;
    showNotification('Preferences saved!', 'success');
    displayFoodCards();
}

function saveAccountSettings() {
    const name = document.getElementById('acc-name').value;
    showNotification(`Account details for ${name} saved (demo)!`, 'success');
}

// --- Make new functions globally accessible for onclick ---
window.showSettingsTab = showSettingsTab;
window.saveHealthSettings = saveHealthSettings;
window.saveNotificationSettings = saveNotificationSettings;
window.savePreferencesSettings = savePreferencesSettings;
window.saveAccountSettings = saveAccountSettings;
window.reorder = reorder;
window.addToFavorites = addToFavorites;
window.addToCart = addToCart;
window.openRestaurantSelector = openRestaurantSelector;
window.confirmAddToCart = confirmAddToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.handleCheckout = handleCheckout;
window.sortRestaurantList = sortRestaurantList;


// --- Init ---
document.addEventListener('DOMContentLoaded', initDashboard);
document.addEventListener('click', e => { if (e.target.closest('.food-card')) { const c = e.target.closest('.food-card'); c.style.transform = 'scale(0.98)'; setTimeout(() => { c.style.transform = ''; }, 150); } });

// Health tips interval (Restored with check)
const healthTips = ['Remember to check your blood sugar levels regularly!', 'Stay hydrated - aim for 8 glasses of water daily.', 'Consider a 10-minute walk after meals to help with digestion.', 'Your medication schedule is important for managing your conditions.', 'Fresh vegetables and lean proteins are your best friends!'];
setInterval(() => {
    if (userSettings.notifications.healthTips && Math.random() < 0.15) {
        showNotification(`Health Tip: ${healthTips[Math.floor(Math.random() * healthTips.length)]}`, 'info');
    }
}, 45000);

window.onload = function () {
    window.scrollTo(0, 0);
};
window.addEventListener('beforeunload', function () {
    window.scrollTo(0, 0);
});