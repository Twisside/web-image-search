// frontend/src/services/externalImageService.js
const UNSPLASH_API_KEY = 'lGUS1kvWMuYXcYP1h9WmXiiSLwJ1qo39aKfuLPQQrIc'; // Replace with your actual Unsplash API key
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

export const searchExternalImages = async (query, page = 1, perPage = 12) => {
  if (!query) return { photos: [], page: 1, pages: 0, total: 0 }; // Return expected structure

  try {
    const response = await fetch(
        `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
          }
        }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error
      console.error('Unsplash API Error:', response.status, errorData);
      throw new Error(`Failed to fetch images from Unsplash: ${response.statusText} ${errorData.errors ? errorData.errors.join(', ') : ''}`);
    }

    const data = await response.json();

    const formattedPhotos = data.results.map(photo => ({
      id: photo.id, // Keep original ID for Unsplash
      title: photo.alt_description || photo.description || 'Untitled',
      thumbnail: photo.urls.small,
      fullSize: photo.urls.regular,
      source: `Photo by ${photo.user.name} on Unsplash`,
      // Add any other fields your template might use directly from the original App.vue logic
      // For example, if you used photo.user.links.html for source link
      // or photo.links.html for the image link
    }));

    return {
      photos: formattedPhotos, // Ensure this key matches what HomeView expects (e.g., results or photos)
      page: data.page || page, // Unsplash might not return page in search/photos
      pages: data.total_pages || 0,
      total: data.total || 0
    };

  } catch (error) {
    console.error('Error in searchExternalImages:', error);
    // Re-throw or return an error structure HomeView can handle
    // To match the previous structure, we might need to ensure a consistent error return
    // For now, re-throwing and letting HomeView catch it.
    throw error;
  }
};