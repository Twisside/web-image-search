import axios from 'axios';

// Favorites
export const getFavorites = async (page = 1, limit = 10) => {
  const response = await axios.get(`/favorites?page=${page}&limit=${limit}`);
  return response.data; // Expected: { data: [], total: N, page: N, limit: N }
};

export const addFavorite = async (imageData) => {
  const response = await axios.post('/favorites', imageData);
  return response.data;
};

export const removeFavorite = async (favoriteId) => {
  await axios.delete(`/favorites/${favoriteId}`);
};

export const clearAllFavorites = async () => {
    await axios.delete('/favorites/all'); // Example endpoint for clearing all user's favorites
};

// Recent Searches
export const getRecentSearches = async (page = 1, limit = 10) => {
  const response = await axios.get(`/recent-searches?page=${page}&limit=${limit}`);
  return response.data;
};

export const addRecentSearch = async (searchTerm) => {
  const response = await axios.post('/recent-searches', { term: searchTerm });
  return response.data;
};

export const clearAllRecentSearches = async () => {
  await axios.delete('/recent-searches/all'); // Example endpoint for clearing all user's recent searches
};