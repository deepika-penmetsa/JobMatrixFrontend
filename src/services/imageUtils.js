/**
 * Utility functions for handling images and S3 URLs
 */

// Default images for fallback
export const DEFAULT_PROFILE_IMAGE = '/default-profile.png';
export const DEFAULT_COMPANY_IMAGE = '/default-company.png';

/**
 * Formats image URLs to handle both S3 and local development paths
 * @param {string} imageUrl - The image URL from the API
 * @param {string} fallbackImage - Optional fallback image if URL is invalid
 * @returns {string} The properly formatted image URL
 */
export const formatImageUrl = (imageUrl, fallbackImage = null) => {
  // If imageUrl is null or undefined, return the fallback image
  if (!imageUrl) return fallbackImage;
  
  // If it's already a full URL (starts with http:// or https://), return it as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If we get here, something's wrong with the URL - the backend should have
  // formatted it properly. Return the fallback image.
  console.warn(`Invalid image URL format: ${imageUrl}`);
  return fallbackImage;
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