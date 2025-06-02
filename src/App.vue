<template>
  <div id="app">
    <div class="wrapper">
      <div class="item">
        <div class="theme-toggle" title="Toggle Light/Dark Mode">
          <input type="checkbox" id="theme-toggle" v-model="isDarkMode" @change="toggleTheme">
          <label for="theme-toggle" class="toggle-label">
            <span class="toggle-inner"></span>
            <span class="toggle-switch"></span>
          </label>
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
      <div class="item">
        <h2>Recent</h2>
        <div class="list-wrapper">
          <ul id="search-list">
            <li v-for="(term, index) in recentSearches" :key="index" @click="searchFromRecent(term)">
              {{ term }}
            </li>
          </ul>
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
import { ref, onMounted } from 'vue';

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

const MAX_RECENT_ITEMS = 30;

// Unsplash API configuration
const UNSPLASH_API_KEY = 'lGUS1kvWMuYXcYP1h9WmXiiSLwJ1qo39aKfuLPQQrIc'; // Replace with your actual API key
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';


// Apply theme on mounted
onMounted(() => {
  if (localStorage.getItem('darkMode') === 'true' ||
      (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    enableDarkMode();
    isDarkMode.value = true;
  }
});

// Toggle theme function
function toggleTheme() {
  if (isDarkMode.value) {
    enableDarkMode();
  } else {
    enableLightMode();
  }
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



// Function to add a new search term to the list
function addRecentSearch(term) {
  if (!term.trim()) return;

  const existingIndex = recentSearches.value.indexOf(term);
  if (existingIndex !== -1) {
    recentSearches.value.splice(existingIndex, 1);
  }

  recentSearches.value.unshift(term);

  if (recentSearches.value.length > MAX_RECENT_ITEMS) {
    recentSearches.value.pop();
  }
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

// Handle search button click
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
    addRecentSearch(query);
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
  flex: 0 0 30vh;
  display: flex;
  justify-content: start;
  flex-direction: column;
  align-items: start;
  padding: 30px;
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
  padding: 0;
  margin: 0;
  width: 100%;
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
  padding: 10px 10px;
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
  transition: 0.4s;
}

#theme-toggle:checked + .toggle-label .toggle-switch {
  transform: translateX(20px);
}

#theme-toggle:checked + .toggle-label .toggle-inner {
  background: var(--toggle-color);
}

</style>

