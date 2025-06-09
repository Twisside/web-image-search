<template>
  <div class="grad"></div>
  <div class="svgs"></div>
  <!-- This outer div matches the #app from your original App.vue, now it's HomeView's root -->
  <div class="home-view-container">
    <div class="wrapper">
      <!-- Column 1: Theme Toggle & Icon -->
      <div class="item column-one">
        <div class="theme-toggle" @click="toggleTheme" title="Toggle Light/Dark Mode">
          <div class="toggle-label" :class="{ 'checked': isDarkMode }">
            <span class="toggle-inner"></span>
            <span class="toggle-switch"></span>
          </div>
        </div>
        <div class="icon">
          <!-- Placeholder for user icon or logout -->
          <button @click="authStore.logout()" class="logout-button-styled" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>

      <!-- Column 2: Search Bar & Results -->
      <div class="item search-container column-two" :class="{ 'has-results': externalSearchResults.length > 0 || isLoadingExternalSearch || externalApiError }">
        <div class="search-bar">
          <input
              type="text"
              v-model="searchQuery"
              placeholder="Search for images..."
              @keyup.enter="() => handleExternalSearch(false)"
          >
          <button
              type="button"
              @click="() => handleExternalSearch(false)"
              :disabled="isLoadingExternalSearch"
          >
            <svg v-if="!isLoadingExternalSearch" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div v-else class="loading-spinner"></div>
          </button>

        </div>

        <div class="results-content" v-if="externalSearchResults.length > 0 || isLoadingExternalSearch || externalApiError">
          <div class="results-header" v-if="currentExternalSearchTerm">
            <h3>Results for "{{ currentExternalSearchTerm }}"</h3>
          </div>

          <div v-if="isLoadingExternalSearch" class="loading-container">
            <div class="loading-spinner large"></div>
            <p>Searching for images...</p>
          </div>

          <div v-if="externalApiError" class="error-container">
            <p>{{ externalApiError }}</p>
            <button @click="retryExternalSearch" class="retry-button">Retry</button>
          </div>

          <div v-if="externalSearchResults.length > 0 && !isLoadingExternalSearch" class="image-grid">
            <div
                v-for="image in externalSearchResults"
                :key="image.id"
                class="image-item"
                @click="openImageModal(image)"
            >
              <img
                  :src="image.thumbnail"
                  :alt="image.title"
                  @error="handleImageError($event)"
                  loading="lazy"
              />
              <button
                  class="favorite-btn"
                  @click.stop="toggleBackendFavorite(image)"
                  :class="{ 'favorited': isBackendFavorited(image.id) }"
                  title="Add to favorites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <div class="image-overlay">
                <p class="image-title">{{ image.title }}</p>
              </div>
            </div>
          </div>

          <div v-if="externalSearchResults.length > 0 && !isLoadingExternalSearch && canLoadMoreExternal" class="load-more-container">
            <button @click="loadMoreExternalImages" class="load-more-button" :disabled="isLoadingMoreExternal">
              <span v-if="!isLoadingMoreExternal">Load More</span>
              <span v-else>Loading...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Column 3: Favorites & Recent (Backend Data) -->
      <div class="hold column-three">
        <div class="item favorites-panel">
          <div class="section-header">
            <h2>Favorites</h2>
            <button v-if="backendFavorites.length > 0" @click="clearAllBackendFavorites" class="clear-btn" :disabled="isLoadingBackendFavorites">Clear</button>
          </div>
          <div v-if="isLoadingBackendFavorites" class="panel-loading">Loading favorites...</div>
          <div class="favorites-grid" v-if="!isLoadingBackendFavorites && backendFavorites.length > 0">
            <div
                v-for="fav in backendFavorites.slice(0, 6)"
            :key="fav._id"
            class="favorite-item"
            @click="openBackendFavoriteModal(fav)"
            >
            <img :src="fav.url_s" :alt="fav.title" @error="handleImageError($event)" />
          </div>
        </div>
        <p v-if="!isLoadingBackendFavorites && backendFavorites.length === 0" class="no-favorites">No favorite images yet</p>
      </div>

      <div class="item recent-searches-panel">
        <div class="section-header">
          <h2>Recent</h2>
          <button v-if="backendRecentSearches.length > 0" @click="clearAllBackendRecentSearches" class="clear-btn" :disabled="isLoadingBackendRecentSearches">Clear</button>
        </div>
        <div v-if="isLoadingBackendRecentSearches" class="panel-loading">Loading recent searches...</div>
        <div class="list-wrapper" v-if="!isLoadingBackendRecentSearches && backendRecentSearches.length > 0">
          <ul id="search-list">
            <li v-for="search in backendRecentSearches" :key="search._id" @click="searchFromRecentBackend(search.term)">
              {{ search.term }}
            </li>
          </ul>
        </div>
        <p v-if="!isLoadingBackendRecentSearches && backendRecentSearches.length === 0" class="no-recent">No recent searches.</p>
      </div>
    </div>
  </div>

  <!-- Image Modal (shared for external and backend favorites) -->
  <div v-if="selectedImage" class="modal-overlay" @click="closeImageModal">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="closeImageModal">×</button>
      <img :src="selectedImage.fullSize || selectedImage.url_m || selectedImage.url_s" :alt="selectedImage.title" @error="handleImageError($event)" />
      <div class="modal-info">
        <h4>{{ selectedImage.title }}</h4>
        <p>{{ selectedImage.source }}</p>
      </div>
    </div>
  </div>
  </div>

</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import * as dataService from '../services/dataService'; // For backend favorites/recent
import { searchExternalImages } from '../services/externalImageService'; // For Unsplash

const authStore = useAuthStore();

// --- THEME STATE (From original App.vue) ---
const isDarkMode = ref(false);

// --- EXTERNAL IMAGE SEARCH STATE (From original App.vue, adapted) ---
const searchQuery = ref(''); // User input for search
const externalSearchResults = ref([]);
const isLoadingExternalSearch = ref(false);
const isLoadingMoreExternal = ref(false);
const externalApiError = ref('');
const currentExternalSearchTerm = ref(''); // The term that fetched current results
const currentExternalPage = ref(1);
const totalExternalPages = ref(0);
const canLoadMoreExternal = computed(() => currentExternalPage.value < totalExternalPages.value && externalSearchResults.value.length > 0);

// --- MODAL STATE (Shared) ---
const selectedImage = ref(null);

// --- BACKEND DATA STATE (From previous HomeView.vue) ---
const backendFavorites = ref([]);
const isLoadingBackendFavorites = ref(false);
const backendRecentSearches = ref([]);
const isLoadingBackendRecentSearches = ref(false);
const backendApiError = ref(''); // For backend specific errors if needed

// --- LOCALSTORAGE KEYS (From original App.vue) ---
const STORAGE_KEYS = {
  DARK_MODE: 'imageSearch_darkMode_v2', // Use a new key if structure changes
};

// Helper to load from storage
function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

// --- LIFECYCLE HOOK ---
onMounted(() => {
  // Load theme preference
  const savedDarkMode = loadFromStorage(STORAGE_KEYS.DARK_MODE, false);
  if (typeof savedDarkMode === 'boolean') { // Ensure it's a boolean
    isDarkMode.value = savedDarkMode;
  } else {
    isDarkMode.value = false; // Default to false if not a boolean
  }
  applyTheme();


  // Fetch initial data from backend if authenticated
  if (authStore.isAuthenticated) {
    fetchBackendFavorites();
    fetchBackendRecentSearches();
  }
});

// --- THEME LOGIC (From original App.vue) ---
function applyTheme() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  applyTheme();
  localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDarkMode.value));
}

watch(isDarkMode, (newMode) => {
  // This watcher might be redundant if toggleTheme handles saving,
  // but good for external changes to isDarkMode if any.
  localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(newMode));
  applyTheme();
});


// --- EXTERNAL IMAGE SEARCH LOGIC (Adapted from original App.vue) ---
async function handleExternalSearch(isLoadMore = false) {
  const query = isLoadMore ? currentExternalSearchTerm.value : searchQuery.value.trim();
  if (!query) return;

  if (!isLoadMore) {
    currentExternalSearchTerm.value = query;
    currentExternalPage.value = 1;
    externalSearchResults.value = []; // Clear previous results for new search
    externalApiError.value = '';
  }

  if (isLoadMore) {
    isLoadingMoreExternal.value = true;
  } else {
    isLoadingExternalSearch.value = true;
  }

  try {
    // Call the service from externalImageService.js
    const result = await searchExternalImages(query, currentExternalPage.value);

    if (isLoadMore) {
      externalSearchResults.value = [...externalSearchResults.value, ...result.photos];
    } else {
      externalSearchResults.value = result.photos;
    }
    totalExternalPages.value = result.pages;

    if (!isLoadMore && query) {
      // Add to backend recent searches
      await dataService.addRecentSearch(query);
      fetchBackendRecentSearches(); // Refresh list
    }
    if (!isLoadMore) searchQuery.value = ''; // Clear input only on new search

  } catch (error) {
    console.error('External search failed:', error);
    externalApiError.value = error.message || 'Failed to search images. Please try again.';
    if (!isLoadMore) externalSearchResults.value = []; // Clear results on error for new search
  } finally {
    if (isLoadMore) {
      isLoadingMoreExternal.value = false;
    } else {
      isLoadingExternalSearch.value = false;
    }
  }
}

function loadMoreExternalImages() {
  if (!canLoadMoreExternal.value || isLoadingMoreExternal.value) return;
  currentExternalPage.value++;
  handleExternalSearch(true);
}

function retryExternalSearch() {
  if (currentExternalSearchTerm.value) {
    // searchQuery.value = currentExternalSearchTerm.value; // No need to set, handleExternalSearch uses currentExternalSearchTerm for retry logic.
    handleExternalSearch(false); // Treat retry as a new search for the same term from page 1
  }
}

// --- BACKEND DATA LOGIC (From previous HomeView.vue) ---
const fetchBackendFavorites = async () => {
  isLoadingBackendFavorites.value = true;
  backendApiError.value = '';
  try {
    const response = await dataService.getFavorites(); // Add pagination if needed
    backendFavorites.value = response.data;
  } catch (error) {
    console.error('Failed to fetch backend favorites:', error);
    backendApiError.value = 'Failed to load favorites.'; // Display this somewhere if needed
  }
  isLoadingBackendFavorites.value = false;
};

const fetchBackendRecentSearches = async () => {
  isLoadingBackendRecentSearches.value = true;
  backendApiError.value = '';
  try {
    const response = await dataService.getRecentSearches(); // Add pagination if needed
    backendRecentSearches.value = response.data;
  } catch (error) {
    console.error('Failed to fetch backend recent searches:', error);
    backendApiError.value = 'Failed to load recent searches.';
  }
  isLoadingBackendRecentSearches.value = false;
};

async function toggleBackendFavorite(image) { // image is from external search
  const favoriteData = {
    imageId: image.id.toString(), // Unsplash ID
    title: image.title,
    url_s: image.thumbnail,
    url_m: image.fullSize,
    source: image.source,
  };

  const existingFavorite = backendFavorites.value.find(fav => fav.imageId === image.id.toString());

  try {
    if (existingFavorite) {
      await dataService.removeFavorite(existingFavorite._id);
    } else {
      await dataService.addFavorite(favoriteData);
    }
    fetchBackendFavorites(); // Refresh favorites list
  } catch (error) {
    console.error('Failed to toggle backend favorite:', error);
    alert('Could not update favorites.');
  }
}

function isBackendFavorited(externalImageId) {
  return backendFavorites.value.some(fav => fav.imageId === externalImageId.toString());
}

async function clearAllBackendFavorites() {
  if (confirm('Are you sure you want to clear all favorites?')) {
    try {
      await dataService.clearAllFavorites();
      fetchBackendFavorites();
    } catch (error) {
      console.error('Failed to clear backend favorites:', error);
      alert('Could not clear favorites.');
    }
  }
}

async function clearAllBackendRecentSearches() {
  if (confirm('Are you sure you want to clear all recent searches?')) {
    try {
      await dataService.clearAllRecentSearches();
      fetchBackendRecentSearches();
    } catch (error) {
      console.error('Failed to clear backend recent searches:', error);
      alert('Could not clear recent searches.');
    }
  }
}

function searchFromRecentBackend(term) {
  searchQuery.value = term; // Set search input
  handleExternalSearch(false); // Trigger a new external search
}


// --- MODAL LOGIC (Shared) ---
function openImageModal(image) { // Can be an external image or a backend favorite
  selectedImage.value = image;
}

function openBackendFavoriteModal(backendFav) {
  // Adapt backend favorite structure to match what modal expects, if different
  // Your current modal expects 'fullSize', 'title', 'source'
  selectedImage.value = {
    id: backendFav.imageId,
    title: backendFav.title,
    thumbnail: backendFav.url_s,
    fullSize: backendFav.url_m || backendFav.url_s, // Fallback if url_m is not present
    source: backendFav.source || 'Favorite',
  };
}


function closeImageModal() {
  selectedImage.value = null;
}

// --- UTILITY ---
function handleImageError(event) {
  event.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'; // Fallback
}


</script>

<style scoped>
/* Paste ALL styles from your original App.vue here */
/* Make sure CSS variables from base.css are available */

.home-view-container { /* Replaces #app from original */
  height: calc(100vh - 20px);
  font-family: Arial, sans-serif;
  padding: 10px;
  background: var(--bg-app-gradient-end);
  color: var(--text-color); /* Ensure text color is inherited */
}

.wrapper {
  display: flex;
  gap: 13px;
  width: 100%;
  height: 100%;
}

/* Column-specific flex rules from original .wrapper > div:nth-child(X) */
.column-one { /* Corresponds to original .wrapper > div:nth-child(1) */
  flex: 0 0 40px;
  padding: 10px; /* Padding was on parent div, now on child */
  display: flex; /* Added to align items in this column */
  flex-direction: column; /* Added */
  gap: 10px; /* Added */
  /* background-color: var(--bg-items);  Ensure this styling is intentional or remove if redundant with .item */
  /* box-shadow: var(--item-shadow); */
  /* border: 1px solid var(--border-color); */
  /* border-radius: 15px; */
  /* The above commented are now handled by .item class if this is also an .item */
}

.column-two { /* Corresponds to original .wrapper > div:nth-child(2) */
  flex: 1;
  flex-direction: column;
  background-color: var(--bg-main-panel);
  box-shadow: var(--shadow-main);
  /* justify-content: center; */ /* Removed to allow search bar at top */
  align-items: center;
  overflow-y: auto; /* Keep this for scrolling results */
  border-radius: 15px; /* Added for consistency with other items */
  padding-top: 20px; /* Added to push search bar down a bit */
}

.column-three { /* Corresponds to original .wrapper > div:nth-child(3) */
  gap: 12px;
  flex: 0 0 30vw;
  /* Styles from .hold from original App.vue */
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Changed from center to align panels at top */
  align-content: stretch;
  align-items: stretch;
}

/* .item styles from original App.vue */
.item {
  display: flex;
  /* justify-content: end; /* Often overridden by specific panel needs */
  flex-direction: column;
  position: relative;
  padding-top: 20px;
  border: 1px solid var(--border-color);
  border-radius: 15px;
  background-color: var(--bg-items);
  box-shadow: var(--item-shadow);
}

/* Specific styling for column-one elements */
.column-one .theme-toggle {
  margin-bottom: auto; /* Pushes icon to the bottom if column is taller */
}
.column-one .icon {
  width: 35px;
  height: 35px;
  padding: 3px;
  background-color: lightgray; /* Can be var(--icon-bg) */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto; /* If theme toggle is at top, this goes to bottom */
}
.logout-button-styled {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logout-button-styled svg {
  color: var(--icon-color); /* Or specific logout icon color */
}


.search-container { /* This is .column-two, already an .item */
  /* background-color: var(--bg-main-panel); */ /* Handled by .column-two directly */
  /* box-shadow: var(--shadow-main); */ /* Handled by .column-two directly */
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--search-bar-bg);
  border: 1px solid var(--search-bar-border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-search);
  padding-right: 6px;
  margin-bottom: 20px; /* Space between search bar and results */
}

.search-bar input[type="text"] {
  flex: 1;
  padding: 10px 16px;
  border: none;
  outline: none;
  background-color: transparent;
  color: var(--input-text);
  font-size: 16px;
}

.search-bar input[type="text"]::placeholder {
  color: var(--input-placeholder);
}

.search-bar button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.search-bar button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-bar button svg {
  color: var(--icon-color);
  width: 18px;
  height: 18px;
  transition: color 0.3s ease;
  border: 1px solid rgba(168, 168, 168, 0.5);
  padding: 5px;
  border-radius: 50%;
}

.search-bar button:hover:not(:disabled) svg {
  border: 1px solid var(--icon-border-hover);
  color: var(--icon-hover)
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--spinner-border);
  border-top: 2px solid var(--spinner-top);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.large {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.results-content {
  border-radius: 10px; /* Already on .column-two */
  width: 92%;
  flex: 1; /* Allows this section to grow and scroll */
  overflow-y: auto;
  padding: 15px;
  /* margin-top: 10px; */ /* Already spaced by search-bar margin */
}

.results-content .results-header {
  text-align: center;
  margin-bottom: 20px;
  /* margin-top: 10px; */ /* Handled by overall spacing */
}

.results-content .results-header h3 {
  color: var(--text-color);
  margin: 0;
  font-size: 18px;
}

/* Results Section states - loading, error, grid */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center content if results take full height */
  padding: 40px;
  text-align: center;
  min-height: 200px; /* Ensure some space when loading/error */
}
.loading-container p, .error-container p {
  margin-top: 10px;
}
.loading-container { color: var(--text-color); opacity: 0.7; }
.error-container { color: var(--error-color); }

.retry-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: var(--button-primary);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.retry-button:hover { background-color: var(--button-primary-hover); }

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Adjusted minmax */
  gap: 15px;
  margin-bottom: 20px;
}

.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Added box-shadow */
  background-color: var(--bg-items); /* Or transparent if items have their own BG */
  box-shadow: var(--item-shadow); /* Apply item shadow */
  aspect-ratio: 1 / 1; /* For square-ish items, adjust if needed */
}

.image-item:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2); /* Enhanced hover shadow */
}

.image-item img {
  width: 100%;
  height: 100%; /* Make image fill the item */
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 15px 10px 10px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}
.image-item:hover .image-overlay { transform: translateY(0); }
.image-title { margin: 0; font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.load-more-container { display: flex; justify-content: center; margin-top: 20px; }
.load-more-button { padding: 10px 20px; background-color: var(--button-primary); color: white; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s ease; }
.load-more-button:hover:not(:disabled) { background-color: var(--button-primary-hover); }
.load-more-button:disabled { opacity: 0.6; cursor: not-allowed; }

/* Column 3 panel styling */
.column-three .item { /* These are .favorites-panel and .recent-searches-panel */
  padding: 20px; /* Remove default .item padding, control internally */
  overflow: hidden; /* Important for list-wrapper scrolling */
}
/* Styles from original .hold > div */
.favorites-panel { /* Corresponds to .hold > div:nth-child(1) */
  /* max-height: 50vh; */ /* Removed to let content define height, or set a flex basis */
  flex: 1; /* Adjust flex basis as needed */
  /* justify-content: start; */ /* Default for flex-column */
  display: flex; /* To make it a flex container itself */
  flex-direction: column;
}
.recent-searches-panel { /* Corresponds to .hold > div:nth-child(2) */
  flex: 1;
  display: flex; /* To make it a flex container itself */
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px; /* Consistent padding */
  border-bottom: 1px solid var(--border-line);
  border-radius: 10px 10px 0 0;
  background-color: var(--bg-item-panel); /* Slight distinction for header */
}
.section-header h2 { margin: 0; font-size: 16px; color: var(--text-color); }

.clear-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}
.clear-btn:hover:not(:disabled) { background: var(--hover-bg); border-color: var(--icon-color); }
.clear-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.panel-loading, .no-favorites, .no-recent {
  text-align: center;
  padding: 20px;
  color: var(--input-placeholder);
  font-style: italic;
}

.favorites-grid {
  flex: 1 1 auto; /* Allow grid to take available space and scroll */
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* As per original */
  gap: 8px;
  padding: 15px; /* Padding inside the scrollable area */
}
.favorite-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
  background-color: var(--bg-main-panel); /* Slight bg */
}
.favorite-item:hover { transform: scale(1.05); }
.favorite-item img { width: 100%; height: 100%; object-fit: cover; }


.list-wrapper {
  flex: 1 1 auto; /* Allow list to take available space and scroll */
  overflow-y: auto;
  /* height: 100%; */ /* Not needed with flex:1 */
  /* width: 100%; */ /* Not needed with flex:1 */
  padding: 0 0 10px 0; /* Padding for scrollbar space bottom */
}
#search-list {
  list-style-type: none;
  padding: 0; /* Removed top padding, handled by list-wrapper */
  margin: 0;
  /* display: flex; */ /* Not needed, it's a ul */
  /* flex-direction: column; */ /* Default for ul>li */
}
#search-list li {
  color: var(--text-color);
  border-bottom: 1px solid var(--border-line);
  padding: 10px 15px; /* Consistent padding */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
#search-list li:hover { background-color: var(--hover-bg); }
#search-list li:last-child { border-bottom: none; border-radius: 0 0 10px 10px}


/* Theme Toggle (from original App.vue) */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  cursor: pointer;
}
.toggle-label {
  position: relative;
  width: 40px;
  height: 20px;
  background: var(--toggle-color);
  border-radius: 10px;
  display: inline-block;
  transition: background 0.3s ease;
}
.toggle-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: var(--toggle-color);
  transition: 0.4s;
}
.toggle-switch {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: var(--dot-color);
  border-radius: 50%;
  transition: all 0.4s ease;
}
.toggle-label.checked .toggle-switch { transform: translateX(20px); }
/* .toggle-label.checked .toggle-inner { background: var(--toggle-color); } */ /* Inner doesn't need to change usually */

/* Favorite button on images (from original App.vue) */
.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  opacity: 0.8;
}
.image-item:hover .favorite-btn { opacity: 1; }
.favorite-btn svg { color: #fff; width: 16px; height: 16px; }
.favorite-btn:hover { background: rgba(0, 0, 0, 0.8); transform: scale(1.1); }
.favorite-btn.favorited svg { fill: #e74c3c; color: #e74c3c; } /* Red for favorited */
.favorite-btn.favorited { background: rgba(231, 76, 60, 0.1); opacity: 1; } /* Slight bg tint when favorited */
.dark-mode .favorite-btn { background: rgba(255, 255, 255, 0.15); }
.dark-mode .favorite-btn:hover { background: rgba(255, 255, 255, 0.25); }
.dark-mode .favorite-btn.favorited { background: rgba(231, 76, 60, 0.25); }


/* Modal (from original App.vue) */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: var(--medal-overlay-bg, rgba(0,0,0,0.9)); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { position: relative; max-width: 85vw; max-height: 85vh; background-color: var(--modal-bg); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.modal-close { position: absolute; top: 10px; right: 15px; background: none; border: none; color: var(--text-color); font-size: 30px; cursor: pointer; z-index: 1001; line-height: 1; padding: 5px; }
.modal-close:hover { color: var(--icon-hover); }
.modal-content img {
  max-width: 100%; /* Fit within modal content width */
  max-height: calc(85vh - 80px); /* Adjust based on info height */
  object-fit: contain; /* Show full image without cropping */
  display: block;
  margin: auto; /* Center if image is smaller than container */
}
.modal-info { padding: 15px; color: var(--text-color); text-align: center; background-color: var(--bg-item-panel); border-top: 1px solid var(--border-line);}
.modal-info h4 { margin: 0 0 5px 0; font-size: 1.1em; }
.modal-info p { margin: 0; color: var(--input-placeholder); font-size: 0.9em; }

/* Scrollbar (from original App.vue) */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background-color: transparent; }
::-webkit-scrollbar-thumb { background-color: var(--scrollbar-thumb); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background-color: var(--scrollbar-thumb-hover); }

/* Responsive adjustments (from original App.vue) */
@media (max-width: 1024px) { /* Example breakpoint */
  .wrapper {
    flex-direction: column;
    height: auto; /* Allow content to define height */
  }
  .column-one{
    justify-content: space-between;
    align-content: center;
    padding: 10px;
  }
  .column-one, .column-three {
    flex-direction: row;
    max-height: 40%;
  }
  .column-three {
    flex-direction: row; /* Side by side panels on smaller screens if desired */
    max-height: none;
  }
  .column-three .item {
    flex: 1; /* Equal width for fav/recent panels */
  }
  .search-bar {
    width: 95%;
  }
  .theme-toggle{
    margin: 0;
    align-items: center;
  }
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .favorites-grid { grid-template-columns: repeat(2, 1fr); } /* Original had 3, changing to 2 for very small */
  .favorite-btn { width: 30px; height: 30px; }
  .favorite-btn svg { width: 14px; height: 14px; }
  .column-three {
    flex-direction: column; /* Stack fav/recent on very small screens */
  }
}

</style>