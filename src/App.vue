<template>
  <div id="app">
    <div class="wrapper">
      <div class="item">
        <div class="icon"></div>
      </div>
      <div class="item">
        <div class="search-bar" >
          <input
              type="text"
              v-model="searchQuery"
              placeholder="Search"
              @keyup.enter="handleSearch"
          >
          <button type="button" @click="handleSearch">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="item">
        <h2>Recent</h2>
        <div class="list-wrapper">
          <ul id="search-list">
            <li v-for="(term, index) in recentSearches" :key="index">{{ term }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Reactive state for search query
const searchQuery = ref('');

// Reactive state for recent searches
const recentSearches = ref([]);

const MAX_RECENT_ITEMS = 30;

// Function to add a new search term to the list
function addRecentSearch(term) {
  if (!term.trim()) return;

  // Prevent duplicates
  const existingIndex = recentSearches.value.indexOf(term);
  if (existingIndex !== -1) {
    // Move to top if already exists
    recentSearches.value.splice(existingIndex, 1);
  }

  // Add to top
  recentSearches.value.unshift(term);

  // Remove last item if over limit
  if (recentSearches.value.length > MAX_RECENT_ITEMS) {
    recentSearches.value.pop();
  }
}

// Handle search button click
function handleSearch() {
  const query = searchQuery.value.trim();
  if (query) {
    addRecentSearch(query);
    searchQuery.value = '';
  }
}

</script>

<style scoped>

#app {
  height: calc(100vh - 20px);
  font-family: Arial, sans-serif;
  padding: 10px;
}

.wrapper {
  display: flex;
  gap: 13px;
  width: 100%;
  height: 100%;
}

.wrapper > div:nth-child(1) {
  flex: 0 0 40px; /* Fixed width of 67px, no grow/shrink */
}

.wrapper > div:nth-child(2) {
  flex: 1; /* Takes remaining space, equivalent to 'auto' in grid */
  background-color: rgba(10, 10, 10, 0.40);
  box-shadow: inset 0 0 25px 7px rgba(0, 0, 0, 0.25),
  0 0 20px 0 rgba(198, 198, 198, 0.31),
  0 4px 4px 0 rgba(0, 0, 0, 0.25);

  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper > div:nth-child(3) {
  flex: 0 0 30vh; /* Fixed width of 30vh, no grow/shrink */
  display: flex;
  justify-content: start;
  flex-direction: column;
  align-items: start;
  padding: 30px;
}

.item {
  display: flex;
  justify-content: center;
  align-items: end;

  position: relative;
  padding: 10px;
  border: 1px solid lightgray;
  border-radius: 15px;

  background-color: rgba(10, 10, 10, 0.5);

  box-shadow: 0 0 20px 0 rgba(198, 198, 198, 0.31),
  inset 0 0 20px 0 rgba(0, 0, 0, 0.25);
}

.icon {
  width: 35px;
  height: 35px;
  padding: 3px;
  background-color: lightgray;
  border-radius: 50%;
  position: absolute;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: rgba(161, 161, 161, 0.03);; /* Slightly lighter than body background */
  border: 1px solid #444;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 5px 9px 26px 1px rgba(0, 0, 0, 0.2);
  padding-right: 8px;
}

.search-bar input[type="text"] {
  flex: 1;
  padding: 10px 16px;
  border: none;
  outline: none;
  background-color: transparent;
  color: #ccc;
  font-size: 16px;
}

.search-bar input[type="text"]::placeholder {
  color: #999;
}

.search-bar button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-bar button svg {
  color: #aaa;
  width: 18px;
  height: 18px;
  transition: color 0.3s ease;
}

/* Optional: Hover effect for icon */
.search-bar button:hover svg {
  border: 1px solid rgba(168, 168, 168, 0.9);
  color: #ddd;
}

.search-bar button svg {
  border: 1px solid rgba(168, 168, 168, 0.5);
  padding: 5px;
  border-radius: 50%;

  transition: all 0.3s ease;
}

.item h2 {
  color: #fff;
  padding-bottom: 1px;
  border-bottom: 1px solid rgba(168, 168, 168, 0.4); /* Light gray line under the header */
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
  flex: 1; /* Take remaining space after header */
}

#search-list li {
  color: #fff; /* Light gray text color */
  padding: 10px 0;
  align-items: start;
  border-bottom: 1px solid rgba(168, 168, 168, 0.4); /* Light gray line between items */

  /* Add these styles to truncate text with ellipsis */
  white-space: nowrap; /* Prevent text from wrapping to a new line */
  overflow: hidden;    /* Hide any overflowing content */
  text-overflow: ellipsis; /* Add ellipsis (...) for truncated text */
  max-width: 100%;     /* Ensure the text doesn't exceed the container width */
}

#search-list li:last-child {
  border-bottom: none; /* Remove bottom border from the last item */
}

::-webkit-scrollbar {
  width: 5px; /* Width of the scrollbar */
}

::-webkit-scrollbar-track {

  background-color: transparent; /* Or use a subtle color */
}

::-webkit-scrollbar-thumb {

  background-color: rgba(100, 100, 100, 0.5); /* Thumb color */
  border-radius: 4px; /* Rounded thumb */
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(200, 200, 200, 0.8); /* Darker on hover */
}

</style>
