<template>
  <div id="app">
    <div class="wrapper">
      <div class="item">
        <div class="theme-toggle" @click="toggleTheme" title="Toggle Light/Dark Mode">
          <div class="toggle-label" :class="{ 'checked': isDarkMode }">
            <span class="toggle-inner"></span>
            <span class="toggle-switch"></span>
          </div>
        </div>
        <div class="icon"></div>
      </div>
      <div class="item search-container" :class="{ 'has-results': searchResults.length > 0 || isLoading || errorMessage }">
        <div class="search-bar">
          <input
              type="text"
              v-model="searchQuery"
              placeholder="Search for images..."
              @keyup.enter="handleSearch"
          >
          <button type="button" @click="handleSearch" :disabled="isLoading">
            <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div v-else class="loading-spinner"></div>
          </button>
        </div>

        <!-- Image Results Section inside the same item -->
        <div class="results-content" v-if="searchResults.length > 0 || isLoading || errorMessage">
          <div class="results-header" v-if="currentSearchTerm">
            <h3>Results for "{{ currentSearchTerm }}"</h3>
          </div>

          <!-- Loading state -->
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner large"></div>
            <p>Searching for images...</p>
          </div>

          <!-- Error state -->
          <div v-if="errorMessage" class="error-container">
            <p>{{ errorMessage }}</p>
            <button @click="retrySearch" class="retry-button">Retry</button>
          </div>

          <!-- Image grid -->
          <div v-if="searchResults.length > 0 && !isLoading" class="image-grid">
            <div
                v-for="(image, index) in searchResults"
                :key="index"
                class="image-item"
                @click="openImageModal(image)"
            >
              <img
                  :src="image.thumbnail"
                  :alt="image.title"
                  @error="handleImageError($event)"
                  loading="lazy"
              />

              <!-- Favorite button -->
              <button
                  class="favorite-btn"
                  @click.stop="toggleFavorite(image)"
                  :class="{ 'favorited': isFavorited(image.id) }"
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

          <!-- Load more button -->
          <div v-if="searchResults.length > 0 && !isLoading" class="load-more-container">
            <button @click="loadMoreImages" class="load-more-button" :disabled="isLoadingMore">
              <span v-if="!isLoadingMore">Load More</span>
              <span v-else>Loading...</span>
            </button>
          </div>
        </div>
      </div>
      <div class="hold">
        <div class="item">
          <h2>Favorites</h2>
          <button v-if="favoriteImages.length > 0" @click="clearFavorites" class="clear-btn">Clear</button>
        <div class="favorites-grid" v-if="favoriteImages.length > 0">
          <div
              v-for="favorite in favoriteImages.slice(0, 6)"
              :key="favorite.id"
              class="favorite-item"
              @click="openImageModal(favorite)"
          >
            <img :src="favorite.thumbnail" :alt="favorite.title" />
          </div>
        </div>
          <p v-else class="no-favorites">No favorite images yet</p>
        </div>

        <div class="item">
          <h2>Recent</h2>
          <button v-if="recentSearches.length > 0" @click="clearRecentSearches" class="clear-btn">Clear</button>

          <div class="list-wrapper">
            <ul id="search-list">
              <li v-for="(term, index) in recentSearches" :key="index" @click="searchFromRecent(term)">
                {{ term }}
              </li>
            </ul>
          </div>
        </div>
      </div>
  </div>



    <!-- Image Modal -->
    <div v-if="selectedImage" class="modal-overlay" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeImageModal">&times;</button>
        <img :src="selectedImage.fullSize" :alt="selectedImage.title" />
        <div class="modal-info">
          <h4>{{ selectedImage.title }}</h4>
          <p>{{ selectedImage.source }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

// Theme state
const isDarkMode = ref(false);
// Reactive state
const searchQuery = ref('');
const recentSearches = ref([]);
const searchResults = ref([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const errorMessage = ref('');
const currentSearchTerm = ref('');
const selectedImage = ref(null);
const currentPage = ref(1);
const favoriteImages = ref([]); // New: Add favorites functionality
const searchHistory = ref([]); // New: Detailed search history with timestamps


const MAX_RECENT_ITEMS = 30;

// Unsplash API configuration
const UNSPLASH_API_KEY = 'lGUS1kvWMuYXcYP1h9WmXiiSLwJ1qo39aKfuLPQQrIc'; // Replace with your actual API key
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// Storage keys
const STORAGE_KEYS = {
  RECENT_SEARCHES: 'imageSearch_recentSearches',
  DARK_MODE: 'imageSearch_darkMode',
  FAVORITE_IMAGES: 'imageSearch_favoriteImages',
  SEARCH_HISTORY: 'imageSearch_searchHistory'
};


// Helper functions for localStorage
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

// Load data on app mount
onMounted(() => {
  // Load recent searches
  const savedSearches = loadFromStorage(STORAGE_KEYS.RECENT_SEARCHES, []);
  recentSearches.value = savedSearches;

  // Load theme preference
  const savedDarkMode = loadFromStorage(STORAGE_KEYS.DARK_MODE, false);
  isDarkMode.value = savedDarkMode;

  // Apply theme immediately
  if (savedDarkMode) {
    enableDarkMode();
  } else {
    enableLightMode();
  }

  // Load favorite images
  const savedFavorites = loadFromStorage(STORAGE_KEYS.FAVORITE_IMAGES, []);
  favoriteImages.value = savedFavorites;

  // Load search history
  const savedHistory = loadFromStorage(STORAGE_KEYS.SEARCH_HISTORY, []);
  searchHistory.value = savedHistory;
});

// Enhanced toggle theme function
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;

  if (isDarkMode.value) {
    enableDarkMode();
  } else {
    enableLightMode();
  }

  // localStorage is automatically saved via watcher
}

// Enable dark mode
function enableDarkMode() {
  document.documentElement.classList.add('dark-mode');
  localStorage.setItem('darkMode', 'true');
}

// Enable light mode
function enableLightMode() {
  document.documentElement.classList.remove('dark-mode');
  localStorage.setItem('darkMode', 'false');
}

// Watch for changes and auto-save to localStorage
watch(recentSearches, (newSearches) => {
  saveToStorage(STORAGE_KEYS.RECENT_SEARCHES, newSearches);
}, { deep: true });

watch(isDarkMode, (newMode) => {
  saveToStorage(STORAGE_KEYS.DARK_MODE, newMode);
});

watch(favoriteImages, (newFavorites) => {
  saveToStorage(STORAGE_KEYS.FAVORITE_IMAGES, newFavorites);
}, { deep: true });

watch(searchHistory, (newHistory) => {
  saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, newHistory);
}, { deep: true });

// Enhanced addRecentSearch function
function addRecentSearch(term) {
  if (!term.trim()) return;

  // Remove if already exists
  const existingIndex = recentSearches.value.indexOf(term);
  if (existingIndex !== -1) {
    recentSearches.value.splice(existingIndex, 1);
  }

  // Add to beginning
  recentSearches.value.unshift(term);

  // Limit to MAX_RECENT_ITEMS
  if (recentSearches.value.length > MAX_RECENT_ITEMS) {
    recentSearches.value.pop();
  }

  // Add to detailed search history
  addToSearchHistory(term);
}


// New: Add to search history with timestamp
function addToSearchHistory(term) {
  const historyItem = {
    term: term,
    timestamp: new Date().toISOString(),
    count: 1
  };

  // Check if term already exists in history
  const existingIndex = searchHistory.value.findIndex(item => item.term === term);

  if (existingIndex !== -1) {
    // Increment count and update timestamp
    searchHistory.value[existingIndex].count++;
    searchHistory.value[existingIndex].timestamp = historyItem.timestamp;
  } else {
    // Add new entry
    searchHistory.value.unshift(historyItem);
  }

  // Keep only last 100 searches
  if (searchHistory.value.length > 100) {
    searchHistory.value = searchHistory.value.slice(0, 100);
  }
}

// New: Favorite image functionality
function toggleFavorite(image) {
  const existingIndex = favoriteImages.value.findIndex(fav => fav.id === image.id);

  if (existingIndex !== -1) {
    // Remove from favorites
    favoriteImages.value.splice(existingIndex, 1);
  } else {
    // Add to favorites
    const favoriteImage = {
      ...image,
      favoritedAt: new Date().toISOString()
    };
    favoriteImages.value.unshift(favoriteImage);
  }
}

// New: Check if image is favorited
function isFavorited(imageId) {
  return favoriteImages.value.some(fav => fav.id === imageId);
}

// New: Clear storage functions
function clearRecentSearches() {
  recentSearches.value = [];
}


function clearSearchHistory() {
  searchHistory.value = [];
}

function clearFavorites() {
  favoriteImages.value = [];
}

// New: Export data function (bonus feature)
function exportUserData() {
  const userData = {
    recentSearches: recentSearches.value,
    favoriteImages: favoriteImages.value,
    searchHistory: searchHistory.value,
    darkMode: isDarkMode.value,
    exportedAt: new Date().toISOString()
  };

  const dataStr = JSON.stringify(userData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'image-search-data.json';
  link.click();
}

// Search for images using Unsplash API
async function searchImages(query, page = 1) {
  try {
    // For demo purposes, we'll use a mock API response
    // Replace this with actual Unsplash API call
    // const mockImages = generateMockImages(query, page);
    //
    // // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 1000));
    //
    // return {
    //   results: mockImages,
    //   total: 100 // Mock total
    // };


    const response = await fetch(
      `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=12`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }

    const data = await response.json();

    return {
      results: data.results.map(photo => ({
        id: photo.id,
        title: photo.alt_description || photo.description || 'Untitled',
        thumbnail: photo.urls.small,
        fullSize: photo.urls.regular,
        source: `Photo by ${photo.user.name} on Unsplash`
      })),
      total: data.total
    };

  } catch (error) {
    console.error('Error searching images:', error);
    throw error;
  }
}

// Generate mock images for demo
function generateMockImages(query, page) {
  const mockImages = [];
  const baseIndex = (page - 1) * 12;

  for (let i = 0; i < 12; i++) {
    const imageId = baseIndex + i + 1;
    mockImages.push({
      id: `${query}-${imageId}`,
      title: `${query} image ${imageId}`,
      thumbnail: `https://picsum.photos/300/300?random=${query}-${imageId}`,
      fullSize: `https://picsum.photos/800/800?random=${query}-${imageId}`,
      source: `Mock image source`
    });
  }

  return mockImages;
}


// Modified handleSearch function to include history tracking
async function handleSearch() {
  const query = searchQuery.value.trim();
  if (!query || isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = '';
  currentSearchTerm.value = query;
  currentPage.value = 1;

  try {
    const result = await searchImages(query, 1);
    searchResults.value = result.results;
    addRecentSearch(query); // This now automatically saves to localStorage
    searchQuery.value = '';
  } catch (error) {
    errorMessage.value = 'Failed to search images. Please try again.';
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Search from recent searches
async function searchFromRecent(term) {
  searchQuery.value = term;
  await handleSearch();
}

// Load more images
async function loadMoreImages() {
  if (isLoadingMore.value || !currentSearchTerm.value) return;

  isLoadingMore.value = true;
  currentPage.value++;

  try {
    const result = await searchImages(currentSearchTerm.value, currentPage.value);
    searchResults.value = [...searchResults.value, ...result.results];
  } catch (error) {
    errorMessage.value = 'Failed to load more images.';
    currentPage.value--; // Revert page increment
  } finally {
    isLoadingMore.value = false;
  }
}

// Retry search
function retrySearch() {
  if (currentSearchTerm.value) {
    searchQuery.value = currentSearchTerm.value;
    handleSearch();
  }
}

// Handle image error
function handleImageError(event) {
  event.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
}

// Open image modal
function openImageModal(image) {
  selectedImage.value = image;
}

// Close image modal
function closeImageModal() {
  selectedImage.value = null;
}
</script>

<style scoped>
#app {
  height: calc(100vh - 20px);
  font-family: Arial, sans-serif;
  padding: 10px;
  background: var(--bg-app-gradient-end);
}

.wrapper {
  display: flex;

  gap: 13px;
  width: 100%;
  height: 100%;
}

.wrapper > div:nth-child(1) {
  flex: 0 0 40px;
  padding: 10px;
  gap: 10px;

}

.wrapper > div:nth-child(2) {
  flex: 1;
  flex-direction: column;
  background-color: var(--bg-main-panel);
  box-shadow: var(--shadow-main);

  justify-content: center;
  align-items: center;
  overflow-y: auto;


}

.results-content {
  border-radius: 10px;
  width: 92%;
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  margin-top: 10px;
}

.results-content .results-header {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 10px;
}

.results-content .results-header h3 {
  color: var(--text-color);
  margin: 0;
  font-size: 18px;
}

.wrapper > div:nth-child(3) {

  gap: 12px;
  flex: 0 0 30vw;


}

.item {
  display: flex;
  justify-content: end;
  flex-direction: column;
  position: relative;
  padding-top: 20px;
  border: 1px solid var(--border-color);
  border-radius: 15px;
  background-color: var(--bg-items);
  box-shadow: var(--item-shadow);
}

.icon {
  width: 35px;
  height: 35px;
  padding: 3px;
  background-color: lightgray;
  border-radius: 50%;

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

.item h2 {
  padding-left: 20px;
  color: var(--text-color);
  padding-bottom: 1px;
  border-bottom: 1px solid var(--border-line);
}

.list-wrapper {
  flex: 1 1 auto;
  overflow-y: auto;
  height: 100%;
  width: 100%;
}

#search-list {
  list-style-type: none;
  padding-top: 10px;
  margin: 0;
  padding-left: 0;
  display: flex;
  justify-content: start;
  flex-direction: column;
  text-align: start;
  overflow-y: auto;
  flex: 1;
}

#search-list li {
  color: var(--text-color);
  border-bottom: 1px solid var(--border-line);
  padding: 10px;
  align-items: start;


  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#search-list li:hover {
  background-color: var(--hover-bg);
}

#search-list li:last-child {
  border-radius: 0 0 10px 10px;
  border-bottom: none;
}

#search-list li:first-child {
  border-radius: 10px 10px 0 0;
}

#search-list li:last-child {
  border-radius: 0 0 10px 10px;
  border-bottom: none;
}

#search-list li:only-child {
  border-radius: 10px;
}


/* Results Section */

.results-header h3 {
  color: var(--text-color);
  margin-bottom: 20px;
  text-align: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #ccc;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: #ff6b6b;
}

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

.retry-button:hover {
  background-color: var(--button-primary-hover);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
  background-color: rgba(255, 255, 255, 0.1);
}

.image-item:hover {
  transform: scale(1.05);
}

.image-item img {
  width: 100%;
  height: 200px;
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

.image-item:hover .image-overlay {
  transform: translateY(0);
}

.image-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.load-more-button {
  padding: 10px 20px;
  background-color: var(--button-primary);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.load-more-button:hover:not(:disabled) {
  background-color: var(--button-primary-hover);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  background-color: var(--modal-bg);
  border-radius: 10px;
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  z-index: 1001;
}

.modal-content img {
  width: max-content;
  height: 100vh;
  display: block;
}

.modal-info {
  padding: 15px;
  color: white;
}

.modal-info h4 {
  margin: 0 0 5px 0;
}

.modal-info p {
  margin: 0;
  color: #ccc;
  font-size: 14px;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--scrollbar-thumb-hover);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  cursor: pointer;

}

/* Hide default checkbox */
#theme-toggle {
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;

}

.toggle-label {
  position: relative;
  width: 40px;
  height: 20px;
  background: var(--toggle-color);
  border-radius: 10px;
  display: inline-block;
  transition: background 0.3s ease;
  cursor: pointer;
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

/* Animate when dark mode is active */
.toggle-label.checked .toggle-switch {
  transform: translateX(20px);
}

.toggle-label.checked .toggle-inner {
  background: var(--toggle-color); /* Optional: change background color in dark mode */
}



/* Favorite button on images */
.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.favorite-btn svg {
  color: #fff;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.favorite-btn.favorited svg {
  fill: #e74c3c;
  color: #e74c3c;
}

.favorite-btn.favorited {
  background: rgba(231, 76, 60, 0.2);
}

/* Section headers with clear buttons */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-line);
}

.section-header h2,
.section-header h3 {
  margin: 0;
  color: var(--text-color);
}

.clear-btn {
  background: none;
  border: 1px solid var(--border-line);
  color: var(--text-color);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: var(--hover-bg);
  border-color: var(--icon-color);
}

/* Favorites section */
.favorites-section {
  max-height: 300px;
  overflow-y: auto;
}

.favorites-grid {


  flex: 1 1 auto;
  overflow-y: auto;
  height: 100%;


  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 10px;
  padding: 10px;
}

.favorite-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.favorite-item:hover {
  transform: scale(1.05);
}

.favorite-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-favorites {
  text-align: center;
  color: var(--input-placeholder);
  font-style: italic;
  margin: 20px 0;
}

/* Settings section */
.settings-section {
  padding: 15px;
}

.settings-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.export-btn {
  background: var(--button-primary);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.export-btn:hover {
  background: var(--button-primary-hover);
}

/* Update image item to accommodate favorite button */
.image-item {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .favorites-grid {

    grid-template-columns: repeat(3, 1fr);
  }

  .favorite-btn {
    width: 30px;
    height: 30px;
  }

  .favorite-btn svg {
    width: 16px;
    height: 16px;
  }
}

/* Dark mode adjustments for new elements */
.dark-mode .favorite-btn {
  background: rgba(255, 255, 255, 0.2);
}

.dark-mode .favorite-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dark-mode .no-favorites {
  color: var(--input-placeholder);
}
.hold{
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: stretch;

  align-items: stretch;

}
.hold > div:nth-child(1){
  max-height: 50vh;
  flex: 0 30vw;
  justify-content: start;
  padding: 20px;
}
.hold > div:nth-child(2){
  display: flex;
  flex: 1;
  height: max-content;
  padding: 20px;



}

</style>

