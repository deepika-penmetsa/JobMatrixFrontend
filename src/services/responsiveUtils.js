/**
 * Utilities for handling responsive behaviors and browser compatibility
 */

/**
 * Fix for mobile viewport height issues
 * This fixes the 100vh problem on mobile browsers
 */
export const fixMobileViewportHeight = () => {
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Set initial value
  setVh();
  
  // Update on resize and orientation change
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);
  
  // Clean up function to remove event listeners
  return () => {
    window.removeEventListener('resize', setVh);
    window.removeEventListener('orientationchange', setVh);
  };
};

/**
 * Detect browser type
 * @returns {Object} Object with boolean flags for each browser
 */
export const detectBrowser = () => {
  const userAgent = window.navigator.userAgent;
  
  return {
    isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent) && !/Edg/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
    isEdge: /Edge/.test(userAgent) || /Edg/.test(userAgent),
    isIE: /Trident/.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent)
  };
};

/**
 * Add browser-specific classes to document root for CSS targeting
 */
export const addBrowserClasses = () => {
  const browser = detectBrowser();
  const html = document.documentElement;
  
  if (browser.isChrome) html.classList.add('chrome');
  if (browser.isSafari) html.classList.add('safari');
  if (browser.isFirefox) html.classList.add('firefox');
  if (browser.isEdge) html.classList.add('edge');
  if (browser.isIE) html.classList.add('ie');
  if (browser.isIOS) html.classList.add('ios');
  if (browser.isAndroid) html.classList.add('android');
};

/**
 * Check if the device supports touch events
 * @returns {boolean} True if touch is supported
 */
export const isTouchDevice = () => {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
};

/**
 * Adds a class to the document body if the device supports touch
 */
export const addTouchClass = () => {
  if (isTouchDevice()) {
    document.body.classList.add('touch-device');
  } else {
    document.body.classList.add('no-touch');
  }
};

/**
 * Initialize all responsive utilities
 * Call this once in your app's entry point (e.g., App.jsx)
 */
export const initResponsiveUtils = () => {
  fixMobileViewportHeight();
  addBrowserClasses();
  addTouchClass();
}; 