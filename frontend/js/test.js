// --- V V V THIS IS THE SECURITY GUARD CODE --- V V V
// This code runs immediately when the page starts to load.
function getLoggedInUserId() {
    // Check both permanent (localStorage) and temporary (sessionStorage) for a user ID
    return localStorage.getItem('userId') || sessionStorage.getItem('userId');
}

const currentUserId = getLoggedInUserId();

// If NO user ID is found in either storage, redirect to the login page immediately.
if (!currentUserId) {
    alert('You must be logged in to view this page. Redirecting...');
    window.location.href = 'login.html';
}
// --- ^ ^ ^ END OF SECURITY GUARD CODE ^ ^ ^ ---


// --- GLOBAL VARIABLES ---
let userHealthProfile = {}; // This will be populated with REAL data from the server.

let recipeModal, modalBody, modalTitle, profileAvatarEl, popoverProfileBtn, closeModalEl;

const DISPLAY_LIMIT = 20; // 20 foods per page/API call
let currentPage = 1; // Current page number for the API

// *** GLOBAL DATA ARRAYS ***
let healthRecommendationsData = []; // Stores Health-Aware recommendations
let generalRecommendationsData = []; // Stores General Suggestions
let favoriteFoods = []; // Stores Favorites from localStorage

let currentFilters = {
    sort: 'default'
};
let searchDebounceTimer;


// ====================================================================
// ---        DATA FETCHING & INITIALIZATION (CONNECTS TO BACKEND)  ---
// ====================================================================

async function fetchAndPopulateDashboard() {
    const userId = getLoggedInUserId();
    if (!userId) return;

    try {
        const profileResponse = await fetch(`http://localhost:3000/api/dashboard-data/${userId}`);

        if (!profileResponse.ok) {
            const errorData = await profileResponse.json();
            throw new Error(errorData.error || 'Failed to fetch user profile data.');
        }

        const userData = await profileResponse.json();

        // STEP B: Populate the UI with the fetched data
        populateUIWithData(userData);

        // Fetch and display the ML recommendations.
        fetchAndDisplayRecommendations(userId);

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        alert('Could not load your data. Please try again.');
    }
}

function populateUIWithData(data) {
    // Store the fetched data globally for other functions to use
    userHealthProfile = {
        conditions: data.conditions,
        goals: data.goals,
        weight: data.weight,
        bmi: data.bmi,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
    };

    const fullName = `${data.firstName} ${data.lastName}`;
    const initials = `${data.firstName[0]}${data.lastName[0]}`.toUpperCase();

    // Update the header with the user's real name and avatar initials
    document.querySelector('.welcome-text').textContent = `Welcome back, ${data.firstName}!`;
    document.getElementById('profileAvatar').textContent = initials;

    // Update the popover menu as well
    document.querySelector('.popover-avatar').textContent = initials;
    document.querySelector('.popover-user-info strong').textContent = fullName;
    document.querySelector('.popover-user-info span').textContent = data.email;

    // Display health conditions in the sidebar
    displayHealthConditions();
}

function displayHealthConditions() {
    const healthConditionsEl = document.getElementById('healthConditions');

    if (userHealthProfile.conditions && userHealthProfile.conditions.length > 0 && userHealthProfile.conditions[0] !== 'none') {
        // If the user has conditions, display them as tags
        healthConditionsEl.innerHTML = userHealthProfile.conditions.map(c =>
            `<span class="health-condition">${c.replace(/-/g, ' ')}</span>`
        ).join('');
    } else {
        // If the user has no conditions, show a message
        healthConditionsEl.innerHTML = `<span style="font-size: 0.8rem; color: #7f8c8d;">No active conditions.</span>`;
    }
}

// ====================================================================
// ---               RECOMMENDATION DISPLAY FUNCTIONS               ---
// ====================================================================

// In health-recommendations.js, replace the existing fetchAndDisplayRecommendations function entirely

async function fetchAndDisplayRecommendations(userId) {
    const healthGrid = document.getElementById('healthRecommendationsGrid');
    const generalGrid = document.getElementById('generalRecommendationsGrid');

    if (!healthGrid || !generalGrid) {
        // ... error handling
        return;
    }

    // Reset state for a fresh load
    currentPage = 1;
    healthRecommendationsData = [];

    // Show loading
    healthGrid.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;
    generalGrid.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

    try {
        const response = await fetch(`http://localhost:3000/api/recommendations/${userId}?page=${currentPage}`);

        if (!response.ok) {
            // ... error handling
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch recommendations from server');
        }

        const data = await response.json();

        // Store the initial batch of health recommendations
        healthRecommendationsData = data.healthRecommendations || [];

        // Render all data and the "Load More" button
        renderHealthRecommendations();

        // Display General Recommendations (General only fetches page 1)
        generalRecommendationsData = data.generalRecommendations || [];
        displayGeneralRecommendations(generalRecommendationsData);

    } catch (error) {
        // ... error message logic
    }
}


/**
 * Renders food cards for the Health section, supports search/sort, and attaches click listeners.
 * @param {Array} recommendations - The list of food items to display.
 * @param {string} gridId - The ID of the HTML element to render into.
 * @param {string} [searchTerm=''] - The search term used, for displaying a better empty message.
 */
function displayRecommendations(recommendations, gridId, searchTerm = '') {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    // --- EMPTY STATE LOGIC ---
    if (!recommendations || recommendations.length === 0) {
        if (searchTerm) {
            grid.innerHTML = `<div class="empty-state">
                                <div class="empty-state-icon">🤷</div>
                                <h4>No results found for "${searchTerm}"</h4>
                                <p>Try searching for a different food or keyword.</p>
                             </div>`;
        } else {
            grid.innerHTML = `<div class="empty-state">
                                <div class="empty-state-icon">😥</div>
                                <h4>No Recommendations Available</h4>
                                <p>We couldn't find any recommendations right now. Please try again later.</p>
                             </div>`;
        }
        return;
    }

    const recommendationsHtml = recommendations.map(rec => {
        let metaHtml = '';
        if (rec.Restaurants && rec.Restaurants.length > 0) {
            const totalRating = rec.Restaurants.reduce((sum, r) => sum + r.Rating, 0);
            const avgRating = (totalRating / rec.Restaurants.length).toFixed(1);
            const prices = rec.Restaurants.map(r => r.Price_for_2);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const priceDisplay = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ${maxPrice}`;
            metaHtml = `
                <div class="food-meta">
                    <div class="food-rating"><strong>⭐ ${avgRating}</strong><span class="rating-avg-label">Avg. Rating</span></div>
                    <div class="food-price"><strong>${priceDisplay}</strong><span class="rating-avg-label">for one</span></div>
                </div>`;
        }
        const imageContent = rec.ImageURL && rec.ImageURL !== 'None' ? `<img src="${rec.ImageURL}" alt="${rec.Name}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size: 4rem;">🥗</span>`;
        // Important: Set data-source="health"
        return `<div class="food-card health-recommended" data-rank="${rec.Rank || rec.rank}" data-source="health"><div class="food-image">${imageContent}</div><div class="food-info"><h3 class="food-title">${rec.Name}</h3><p class="food-description">${rec.Description.substring(0, 65)}...</p>${metaHtml}</div></div>`;
    }).join('');

    grid.innerHTML = recommendationsHtml;

    // *** ATTACH CLICK LISTENER ***
    grid.querySelectorAll('.food-card').forEach(card => {
        card.addEventListener('click', () => {
            const rank = card.dataset.rank;
            // Pass 'health' as the data source
            openRecipeDetailModal(rank, 'health');
        });
    });
}


/**
 * Renders General Food cards in a separate section and attaches click listeners.
 * @param {Array} recommendations - The list of general food items to display.
 */
// In health-recommendations.js, replace the existing displayGeneralRecommendations function

/**
 * Renders General Food cards in a separate section and attaches click listeners.
 * @param {Array} recommendations - The list of general food items to display.
 */
function displayGeneralRecommendations(recommendations) {
    const grid = document.getElementById('generalRecommendationsGrid');
    if (!grid) return;

    if (!recommendations || recommendations.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🍽️</div><h4>No General Recommendations Available</h4></div>`;
        return;
    }

    const recommendationsHtml = recommendations.map(rec => {
        const imageContent = rec.ImageURL && rec.ImageURL !== 'None' ? `<img src="${rec.ImageURL}" alt="${rec.Name}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size: 4rem;">🥗</span>`;

        let metaHtml = '';
        if (rec.Restaurants && rec.Restaurants.length > 0) {
            // --- START: ADDED METADATA LOGIC ---
            const totalRating = rec.Restaurants.reduce((sum, r) => sum + r.Rating, 0);
            const avgRating = (totalRating / rec.Restaurants.length).toFixed(1);
            const prices = rec.Restaurants.map(r => r.Price_for_2);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const priceDisplay = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ${maxPrice}`;

            metaHtml = `
                <div class="food-meta">
                    <div class="food-rating"><strong>⭐ ${avgRating}</strong><span class="rating-avg-label">Avg. Rating</span></div>
                    <div class="food-price"><strong>${priceDisplay}</strong><span class="rating-avg-label">for one</span></div>
                </div>`;
            // --- END: ADDED METADATA LOGIC ---
        }

        // Important: Use Description and full metaHtml
        return `<div class="food-card" data-rank="${rec.Rank || rec.rank}" data-source="general">
                    <div class="food-image">${imageContent}</div>
                    <div class="food-info">
                        <h3 class="food-title">${rec.Name}</h3>
                        <p class="food-description">${rec.Description.substring(0, 65)}...</p>
                        ${metaHtml}
                    </div>
                </div>`;
    }).join('');

    grid.innerHTML = recommendationsHtml;

    // *** ATTACH CLICK LISTENER ***
    grid.querySelectorAll('.food-card').forEach(card => {
        card.addEventListener('click', () => {
            const rank = card.dataset.rank;
            // Pass 'general' as the data source
            openRecipeDetailModal(rank, 'general');
        });
    });
}


/**
 * Renders the list of favorite foods into the favorites grid.
 * @param {Array} favorites - An array of favorite food objects.
 */
function displayFavorites(favorites) {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    if (!favorites || favorites.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❤️</div><h4>You have no favorite items saved yet.</h4></div>`;
        return;
    }

    const favoritesHtml = favorites.map(rec => {
        let metaHtml = '';
        if (rec.Restaurants && rec.Restaurants.length > 0) {
            const totalRating = rec.Restaurants.reduce((sum, r) => sum + r.Rating, 0);
            const avgRating = (totalRating / rec.Restaurants.length).toFixed(1);
            const prices = rec.Restaurants.map(r => r.Price_for_2);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const priceDisplay = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ${maxPrice}`;

            metaHtml = `
                <div class="food-meta">
                    <div class="food-rating"><strong>⭐ ${avgRating}</strong><span class="rating-avg-label">Avg. Rating</span></div>
                    <div class="food-price"><strong>${priceDisplay}</strong><span class="rating-avg-label">for one</span></div>
                </div>`;
        }

        const imageContent = rec.ImageURL && rec.ImageURL !== 'None'
            ? `<img src="${rec.ImageURL}" alt="${rec.Name}" style="width:100%; height:100%; object-fit:cover;">`
            : `<span style="font-size: 4rem;">🥗</span>`;

        // Important: Set data-source="favorites"
        return `<div class="food-card" data-rank="${rec.Rank || rec.rank}" data-source="favorites">
                    <div class="food-image">${imageContent}</div>
                    <div class="food-info">
                        <h3 class="food-title">${rec.Name}</h3>
                        <p class="food-description">${rec.Description.substring(0, 65)}...</p>
                        ${metaHtml}
                    </div>
                </div>`;
    }).join('');

    grid.innerHTML = favoritesHtml;

    // *** ATTACH CLICK LISTENER ***
    grid.querySelectorAll('.food-card').forEach(card => {
        card.addEventListener('click', () => {
            const rank = card.dataset.rank;
            // Pass 'favorites' as the data source
            openRecipeDetailModal(rank, 'favorites');
        });
    });
}


// ====================================================================
// ---               MODAL AND DETAIL FUNCTIONS                     ---
// ====================================================================

/**
 * Displays recipe details by searching in the specified data source.
 * THIS IS THE CORE FIX.
 * @param {string} rank - The rank ID of the recipe to display.
 * @param {string} dataSource - The list to search in ('health', 'general', or 'favorites').
 */
function openRecipeDetailModal(rank, dataSource = 'health') {
    let recipe;
    const uniqueId = String(rank);

    // 1. Look up the recipe in the correct array
    if (dataSource === 'favorites') {
        recipe = favoriteFoods.find(r => String(r.Rank || r.rank) === uniqueId);
    } else if (dataSource === 'general') {
        recipe = generalRecommendationsData.find(r => String(r.Rank || r.rank) === uniqueId);
    } else { // Default to 'health'
        // If searching a filtered list, we must search the original source data
        // For 'health', we assume the main array is the source of truth for details
        recipe = healthRecommendationsData.find(r => String(r.Rank || r.rank) === uniqueId);
    }

    if (!recipe) {
        alert("Sorry, we couldn't find the details for that item.");
        return;
    }

    // 2. Get references to all modal elements
    const modal = document.getElementById('recipeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = document.getElementById('closeModal');

    if (!modal || !modalTitle || !modalBody || !closeModalBtn) return;

    // 3. Prepare HTML content
    const nutrition = recipe.Nutrition || {};
    const keywordsHtml = (recipe.Keywords || '').split(',').map(k => k.trim()).filter(k => k).map(k => `<span class="food-tag">${k}</span>`).join('');
    const nutritionHtml = `
        <div class="nutritional-item"><div class="nutritional-value">${nutrition.Calories || 'N/A'}</div><div class="nutritional-label">Calories</div></div>
        <div class="nutritional-item"><div class="nutritional-value">${nutrition.Fat || 'N/A'}</div><div class="nutritional-label">Fat</div></div>
        <div class="nutritional-item"><div class="nutritional-value">${nutrition.Cholesterol || 'N/A'}</div><div class="nutritional-label">Cholesterol</div></div>
        <div class="nutritional-item"><div class="nutritional-value">${nutrition.Sodium || 'N/A'}</div><div class="nutritional-label">Sodium</div></div>
        <div class="nutritional-item"><div class="nutritional-value">${nutrition.Carbohydrates || 'N/A'}</div><div class="nutritional-label">Carbs</div></div>
        <div class="nutritional-item"><div class="nutritional-value">${nutrition.Fiber || 'N/A'}</div><div class="nutritional-label">Fiber</div></div>
        <div class="nutritional-item"><div class="nutritional-value">${nutrition.Sugar || 'N/A'}</div><div class="nutritional-label">Sugar</div></div>
        <div class="nutritional-item"><div class="nutritional-value">${nutrition.Protein || 'N/A'}</div><div class="nutritional-label">Protein</div></div>
    `;

    // 4. Set the modal title and inject the main HTML structure
    modalTitle.textContent = recipe.Name;
    modalBody.innerHTML = `
        <img src="${recipe.ImageURL}" alt="${recipe.Name}" style="width:100%;height:250px;object-fit:cover;border-radius:12px;margin-bottom:1.5rem;">
        <div class="food-tags" style="justify-content:flex-start;margin-bottom:1.5rem;flex-wrap:wrap;">${keywordsHtml}</div>
        <h4 style="margin-bottom:.75rem;">Description</h4>
        <p style="color:#5a6872;margin-bottom:2rem;line-height:1.6;">${recipe.Description}</p>
        <h4 style="margin-bottom:1rem;">Nutritional Information</h4>
        <div class="nutritional-info" style="grid-template-columns:repeat(4, 1fr);margin-bottom:2rem;">${nutritionHtml}</div>
        
        <div id="detailsContentSection" style="display:none;border-top:1px solid #e1e8ed;padding-top:1.5rem;margin-top:1.5rem;">
        </div>

        <div id="modalActionsContainer" style="display:flex;gap:1rem;margin-top:1.5rem;border-top:1px solid #e1e8ed;padding-top:1.5rem;">
            <button id="moreDetailsBtn" class="save-btn" style="flex:1;">More Details</button>
            <button id="favoritesActionBtn" class="danger-btn" style="flex:1;"></button>
        </div>
    `;

    // 5. Show the modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // 6. Attach dynamic event handlers

    // --- FAVORITES BUTTON TOGGLE LOGIC ---
    const favoritesActionBtn = document.getElementById('favoritesActionBtn');

    const handleAdd = () => {
        favoriteFoods.push(recipe);
        localStorage.setItem('smartFoodFavorites', JSON.stringify(favoriteFoods));
        alert(`Added "${recipe.Name}" to your favorites!`);
        displayFavorites(favoriteFoods);
        favoritesActionBtn.textContent = 'Remove from Favorites';
        favoritesActionBtn.onclick = handleRemove;
    };

    const handleRemove = () => {
        favoriteFoods = favoriteFoods.filter(fav => String(fav.Rank || fav.rank) !== uniqueId);
        localStorage.setItem('smartFoodFavorites', JSON.stringify(favoriteFoods));
        alert(`"${recipe.Name}" removed from favorites.`);
        displayFavorites(favoriteFoods);
        favoritesActionBtn.textContent = 'Add to Favorites';
        favoritesActionBtn.onclick = handleAdd;
    };

    const isAlreadyFavorite = favoriteFoods.some(fav => String(fav.Rank || fav.rank) === uniqueId);
    if (isAlreadyFavorite) {
        favoritesActionBtn.textContent = 'Remove from Favorites';
        favoritesActionBtn.onclick = handleRemove;
    } else {
        favoritesActionBtn.textContent = 'Add to Favorites';
        favoritesActionBtn.onclick = handleAdd;
    }

    // --- MORE DETAILS BUTTON LOGIC ---
    const moreDetailsBtn = document.getElementById('moreDetailsBtn');
    const detailsContentSection = document.getElementById('detailsContentSection');
    const modalActionsContainer = document.getElementById('modalActionsContainer');

    moreDetailsBtn.addEventListener('click', () => {
        modalActionsContainer.innerHTML = `
            <button id="restaurantsBtn" class="save-btn" style="flex:1;">View Restaurants</button>
            <button id="recipeBtn" class="save-btn" style="flex:1;">View Recipe</button>
        `;

        // --- Restaurant Button Logic ---
        document.getElementById('restaurantsBtn').addEventListener('click', () => {
            const restaurants = recipe.Restaurants || [];

            const renderRestaurantList = (restaurantsArray, container) => {
                if (restaurantsArray.length > 0) {
                    container.innerHTML = restaurantsArray.map(r => `
                        <div class="restaurant-list-item">
                            <div class="restaurant-info">
                                <div class="restaurant-name">${r.Name}</div>
                                <div class="restaurant-rating">⭐ ${r.Rating.toFixed(1)}</div>
                            </div>
                            <div class="restaurant-price">₹${r.Price_for_2} for one</div>
                        </div>
                    `).join('');
                } else {
                    container.innerHTML = `<p style="color:#7f8c8d;">Restaurant information is not available for this item.</p>`;
                }
            };

            detailsContentSection.innerHTML = `
                <h4 style="margin-bottom:1rem;">Available At</h4>
                <div class="modal-sort-controls">
                    <span class="sort-tag" id="sortRatingBtn">Sort by Rating ⭐</span>
                    <span class="sort-tag" id="sortPriceAscBtn">Price: Low-High</span>
                    <span class="sort-tag" id="sortPriceDescBtn">Price: High-Low</span>
                </div>
                <div class="restaurant-list" id="restaurantListContainer"></div>
            `;
            detailsContentSection.style.display = 'block';

            const restaurantListContainer = document.getElementById('restaurantListContainer');
            const sortRatingBtn = document.getElementById('sortRatingBtn');
            const sortPriceAscBtn = document.getElementById('sortPriceAscBtn');
            const sortPriceDescBtn = document.getElementById('sortPriceDescBtn');

            renderRestaurantList(restaurants, restaurantListContainer);

            sortRatingBtn.addEventListener('click', () => {
                restaurants.sort((a, b) => b.Rating - a.Rating);
                renderRestaurantList(restaurants, restaurantListContainer);
                sortRatingBtn.classList.add('active');
                sortPriceAscBtn.classList.remove('active');
                sortPriceDescBtn.classList.remove('active');
            });

            sortPriceAscBtn.addEventListener('click', () => {
                restaurants.sort((a, b) => a.Price_for_2 - b.Price_for_2);
                renderRestaurantList(restaurants, restaurantListContainer);
                sortPriceAscBtn.classList.add('active');
                sortRatingBtn.classList.remove('active');
                sortPriceDescBtn.classList.remove('active');
            });

            sortPriceDescBtn.addEventListener('click', () => {
                restaurants.sort((a, b) => b.Price_for_2 - a.Price_for_2);
                renderRestaurantList(restaurants, restaurantListContainer);
                sortPriceDescBtn.classList.add('active');
                sortRatingBtn.classList.remove('active');
                sortPriceAscBtn.classList.remove('active');
            });
        });

        // --- Recipe Button Logic ---
        document.getElementById('recipeBtn').addEventListener('click', () => {
            const ingredientsHtml = (recipe.Ingredients || "Not available").split(',').map(i => `<li>${i.trim()}</li>`).join('');
            const instructionsHtml = (recipe.Instructions || "Not available").split('.').filter(s => s.trim()).map(s => {
                let clean = s.trim().replace(/^\d+\s*/, '').trim();
                if (clean.startsWith(',')) { clean = clean.substring(1).trim(); }
                if (clean) { clean = clean.charAt(0).toUpperCase() + clean.slice(1); }
                return `<li>${clean}.</li>`;
            }).join('');

            detailsContentSection.innerHTML = `
                <h4 style="margin-bottom:1rem;">Ingredients</h4>
                <ul style="list-style-position:outside;padding-left:1.5rem;margin-bottom:1.5rem;">${ingredientsHtml}</ul>
                <h4 style="margin-bottom:1rem;">Instructions</h4>
                <ol style="list-style-position:outside;padding-left:1.5rem;">${instructionsHtml}</ol>
            `;
            detailsContentSection.style.display = 'block';
        });
    });

    // 7. Ensure Close Button works by replacing it to clear previous listeners
    const newCloseBtn = closeModalBtn.cloneNode(true);
    closeModalBtn.parentNode.replaceChild(newCloseBtn, closeModalBtn);
    newCloseBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    });
}


// ====================================================================
// ---               FILTERING & SORTING                            ---
// ====================================================================

function applyFiltersAndSort() {
    // 1. Get the current values from the search bar and sort dropdown
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    currentFilters.sort = document.getElementById('sortFilter').value;

    // Start with a fresh copy of the original Health Recommendations
    let processedData = [...healthRecommendationsData];

    // 2. Apply Search Filter: Check for matches in Name and Keywords
    if (searchTerm) {
        processedData = processedData.filter(rec => {
            const nameMatch = (rec.Name || '').toLowerCase().includes(searchTerm);
            const keywordMatch = (rec.Keywords || '').toLowerCase().includes(searchTerm);
            return nameMatch || keywordMatch;
        });
    }

    // 3. Apply Sorting to the (potentially filtered) results
    const getPrice = (rec) => {
        if (!rec.Restaurants || rec.Restaurants.length === 0) return Infinity;
        const prices = rec.Restaurants.map(r => r.Price_for_2);
        return Math.min(...prices);
    };

    const getAvgRating = (rec) => {
        if (!rec.Restaurants || rec.Restaurants.length === 0) return 0;
        const totalRating = rec.Restaurants.reduce((sum, r) => sum + r.Rating, 0);
        return totalRating / rec.Restaurants.length;
    };

    switch (currentFilters.sort) {
        case 'price-asc':
            processedData.sort((a, b) => getPrice(a) - getPrice(b));
            break;
        case 'price-desc':
            processedData.sort((a, b) => getPrice(b) - getPrice(a));
            break;
        case 'rating-desc':
            processedData.sort((a, b) => getAvgRating(b) - getAvgRating(a));
            break;
        // 'default' case preserves the original recommended order.
    }

    // 4. Re-render the Health Recommendations grid
    const healthGridId = 'healthRecommendationsGrid';
    displayRecommendations(processedData, healthGridId, searchTerm);
}

// ====================================================================
// ---               INITIALIZATION & EVENT LISTENERS               ---
// ====================================================================
// All other initialization and navigation helper functions here...

// This is the main function that starts everything
function initDashboard() {
    initializeTheme();
    ensureModalStructure();

    // Initialize favorites from localStorage
    favoriteFoods = JSON.parse(localStorage.getItem('smartFoodFavorites')) || [];

    // Attach event listeners and fetch data
    setupEventListeners();
    fetchAndPopulateDashboard();

    // Display favorites, they might already be in storage
    displayFavorites(favoriteFoods);
}

function setupEventListeners() {
    const logoutButton = document.getElementById('popoverLogoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // --- Sidebar Navigation Listeners (placeholders, ensure views are implemented) ---
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            showView(section);
        });
    });

    // --- Filter and Search Listeners ---
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) sortFilter.addEventListener('change', applyFiltersAndSort);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                applyFiltersAndSort();
            }, 300);
        });
    }

    // --- Profile Modal Listeners ---
    profileAvatarEl = document.getElementById('profileAvatar');
    popoverProfileBtn = document.getElementById('popoverProfileBtn');

    if (profileAvatarEl) profileAvatarEl.addEventListener('click', populateAndOpenProfileModal);
    if (popoverProfileBtn) popoverProfileBtn.addEventListener('click', (e) => { e.preventDefault(); populateAndOpenProfileModal(); });
}

// Generic view handler (simplified)
// Generic view handler (simplified)
function showView(sectionId) {
    const mainDashboard = document.getElementById('mainDashboardView');
    // Include the health alert and search bar container in the list of elements to manage
    const contentElements = [
        document.querySelector('.health-alert'),
        document.querySelector('.search-container'),
        document.getElementById('healthSection'),
        document.getElementById('generalSection'),
        document.getElementById('favoritesSection'),
        document.getElementById('historySection'),
        document.getElementById('cartSection'),
        document.getElementById('settingsSection')
    ].filter(Boolean); // Filter out null/undefined elements

    // 1. Hide all main content sections initially
    contentElements.forEach(el => el.style.display = 'none');

    // Ensure the main container is visible for content views
    if (mainDashboard) mainDashboard.style.display = 'block';

    // 2. Determine what to show based on sidebar click

    if (sectionId === 'dashboard') {
        // Dashboard: Show Health Alert, Search, Health Section, AND General Section
        document.querySelector('.health-alert').style.display = 'flex';
        document.querySelector('.search-container').style.display = 'block';
        document.getElementById('healthSection').style.display = 'block';
        document.getElementById('generalSection').style.display = 'block';

    } else if (sectionId === 'health-recommendations') {
        // Health Recommendations: Show Health Alert, Search, ONLY Health Section
        document.querySelector('.health-alert').style.display = 'flex';
        document.querySelector('.search-container').style.display = 'block';
        document.getElementById('healthSection').style.display = 'block';
        // Note: generalSection remains hidden here

    } else if (sectionId === 'favorites') {
        // Favorites: Show Search, and Favorites Section
        document.querySelector('.search-container').style.display = 'block';
        document.getElementById('favoritesSection').style.display = 'block';
        document.querySelector('.health-alert').style.display = 'none'; // Hide alert for Favorites view

    } else if (sectionId === 'settings') {
        // Settings view
        if (mainDashboard) mainDashboard.style.display = 'none';
        document.getElementById('settingsSection').style.display = 'block';

    }
    // Implement other sections (cart, history) here if they exist

    // 3. Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    const active = document.querySelector(`.sidebar-item[data-section="${sectionId}"]`);
    if (active) active.classList.add('active');
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userId');
        sessionStorage.removeItem('userId');
        alert('Logging out...');
        window.location.href = 'login.html';
    }
}

// --- Theme functions (light / dark) ---
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
    applyTheme(rootEl.classList.contains('dark') ? 'light' : 'dark');
}

function initializeTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
}

function ensureModalStructure() {
    recipeModal = document.getElementById('recipeModal');
    if (!recipeModal) return;

    const content = recipeModal.querySelector('.modal-content') || recipeModal;

    modalTitle = content.querySelector('#modalTitle');
    if (!modalTitle) {
        modalTitle = document.createElement('div');
        modalTitle.id = 'modalTitle';
        modalTitle.className = 'modal-title';
        content.prepend(modalTitle);
    }

    modalBody = content.querySelector('#modalBody');
    if (!modalBody) {
        modalBody = document.createElement('div');
        modalBody.id = 'modalBody';
        modalBody.className = 'modal-body';
        content.appendChild(modalBody);
    }

    closeModalEl = document.getElementById('closeModal') || content.querySelector('.close-modal');
    recipeModal.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            recipeModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
}

// Fetch profile from backend (returns null on error)
async function fetchUserProfile(userId) {
    if (!userId) return null;
    try {
        const res = await fetch(`http://localhost:3000/api/dashboard-data/${userId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn('fetchUserProfile error', e);
        return null;
    }
}

// Populate and open profile modal (uses existing recipeModal/modalBody)
async function populateAndOpenProfileModal() {
    if (!recipeModal || !modalBody || !modalTitle) return;

    const userId = getLoggedInUserId();
    const remote = await fetchUserProfile(userId);
    const data = Object.assign({}, userHealthProfile, remote || {});

    const firstName = data.firstName || data.first_name || '';
    const lastName = data.lastName || data.last_name || '';
    const email = data.email || '';
    const conditions = Array.isArray(data.conditions) ? data.conditions : (data.conditions ? String(data.conditions).split(',') : []);
    const goals = Array.isArray(data.goals) ? data.goals : (data.goals ? String(data.goals).split(',') : []);
    const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || (document.getElementById('profileAvatar')?.textContent || 'JD');

    modalTitle.textContent = 'Health Profile';

    const conditionHtml = (conditions.length && conditions[0] !== 'none') ? conditions.map(c => `<span class="health-condition">${c.replace(/-/g, ' ')}</span>`).join('') : '<span style="color:#7f8c8d">None listed.</span>';
    const goalsHtml = (goals.length) ? goals.map(g => `<span class="health-benefit-tag">${g.replace(/-/g, ' ')}</span>`).join('') : '<span style="color:#7f8c8d">None listed.</span>';

    modalBody.innerHTML = `
        <div style="text-align:center;margin-bottom:1.5rem">
            <div class="profile-avatar" style="width:80px;height:80px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#3498db;color:#fff;font-size:1.75rem">${initials}</div>
            <h3 style="margin:.6rem 0 0">${(firstName + ' ' + lastName).trim() || 'User'}</h3>
            <p style="color:#7f8c8d;margin:6px 0 0">${email}</p>
        </div>

        <div style="margin-bottom:1rem">
            <h4 style="margin-bottom:0.5rem">Health Conditions</h4>
            <div class="food-tags">${conditionHtml}</div>
        </div>

        <div style="margin-bottom:1rem">
            <h4 style="margin-bottom:0.5rem">Health Goals</h4>
            <div class="food-tags">${goalsHtml}</div>
        </div>

        <div style="margin-bottom:1rem">
            <h4 style="margin-bottom:0.5rem">Physical Stats</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                <div style="text-align:center;padding:1rem;background:#f8f9fa;border-radius:8px">
                    <div style="font-size:1.5rem;font-weight:bold;color:#27ae60">${(data.weight || 0)} kg</div>
                    <div style="color:#7f8c8d;font-size:.9rem">Weight</div>
                </div>
                <div style="text-align:center;padding:1rem;background:#f8f9fa;border-radius:8px">
                    <div style="font-size:1.5rem;font-weight:bold;color:#3498db">${(data.height || 0)}</div>
                    <div style="color:#7f8c8d;font-size:.9rem">Height</div>
                </div>
            </div>
        </div>

        <button id="updateProfileBtn" class="save-btn" style="width:100%">Update Health Profile</button>
    `;

    const updateBtn = document.getElementById('updateProfileBtn');
    if (updateBtn) updateBtn.addEventListener('click', () => window.location.href = 'onBoarding.html');

    recipeModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    document.getElementById('closeModal')?.addEventListener('click', () => {
        recipeModal.classList.remove('show');
        document.body.style.overflow = '';
    });
}

// In health-recommendations.js, add this new function

async function fetchMoreRecommendations() {
    const userId = getLoggedInUserId();
    if (!userId) return;

    // Increment the page count for the next request
    currentPage++;

    const loadMoreBtn = document.getElementById('loadMoreHealthBtn');
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Loading...';
    }

    try {
        // Make the new API call with the incremented page number
        const response = await fetch(`http://localhost:3000/api/recommendations/${userId}?page=${currentPage}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load more recommendations.');
        }

        const data = await response.json();
        const newRecommendations = data.healthRecommendations || [];

        if (newRecommendations.length > 0) {
            // Append new data to the main array
            healthRecommendationsData = healthRecommendationsData.concat(newRecommendations);
        }

        // Re-render the entire list
        renderHealthRecommendations();

    } catch (error) {
        console.error('Error fetching more recommendations:', error);
        alert('Could not load more foods. Please try again.');
    } finally {
        // Restore button state (if button exists)
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
        }
    }
}

// --- This tells the browser to run the initDashboard function once the HTML page is fully loaded ---
document.addEventListener('DOMContentLoaded', initDashboard);