/**
 * Utility functions for handling images and S3 URLs
 */

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_JOB_MATRIX_API_BASE_URL || '';

/**
 * Formats image URLs to handle both S3 and local development paths
 * @param {string} imageUrl - The image URL from the API
 * @param {string} fallbackImage - Optional fallback image if URL is invalid
 * @returns {string} The properly formatted image URL
 */
export const formatImageUrl = (imageUrl, fallbackImage = null) => {
  if (!imageUrl) return fallbackImage;
  
  // Check if it's already a full URL (starts with http or https)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's an S3 URL without protocol (amazonaws.com), add https
  if (imageUrl.includes('amazonaws.com')) {
    return imageUrl.startsWith('//') ? `https:${imageUrl}` : `https://${imageUrl}`;
  }
  
  // For relative URLs from Django, prepend the API base URL
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // For other relative paths without leading slash
  return `${API_BASE_URL}/${imageUrl}`;
};

/**
 * Checks if an image exists and is accessible
 * @param {string} url - The URL to check
 * @returns {Promise<boolean>} Whether the image exists
 */
export const checkImageExists = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    console.error('Error checking image:', e);
    return false;
  }
}; 