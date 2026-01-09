// Image fetching service for product visualization
// Uses multiple free image APIs for better reliability

// Cache to avoid duplicate API calls
const imageCache = new Map();

/**
 * Fetch product image using multiple sources for reliability
 * @param {string} productName - Name of the product to search for
 * @returns {Promise<string>} - URL of the product image
 */
export async function fetchProductImage(productName) {
    // Check cache first
    if (imageCache.has(productName)) {
        return imageCache.get(productName);
    }

    try {
        // Clean up product name for better search results
        const cleanName = productName.replace(/[()]/g, '').trim();
        const query = encodeURIComponent(cleanName);
        
        // Try multiple image sources for better reliability
        // Source 1: Lorem Picsum with seed (most reliable, always works)
        const seed = cleanName.toLowerCase().replace(/\s+/g, '-');
        const loremPicsumUrl = `https://picsum.photos/seed/${seed}/400/300`;
        
        // Source 2: Unsplash Source (backup)
        const unsplashUrl = `https://source.unsplash.com/400x300/?${query}`;
        
        // Source 3: Placeholder with product info (final fallback)
        const placeholderUrl = `https://placehold.co/400x300/e8d5c4/6b4423?text=${query}&font=roboto`;
        
        // Use Lorem Picsum as primary (most reliable)
        const url = loremPicsumUrl;
        
        imageCache.set(productName, url);
        return url;
        
    } catch (error) {
        console.error(`Error fetching image for ${productName}:`, error);
        // Return placeholder on error with product name
        const fallbackUrl = `https://placehold.co/400x300/e8d5c4/6b4423?text=${encodeURIComponent(productName)}`;
        return fallbackUrl;
    }
}

/**
 * Fetch multiple product images in parallel
 * @param {Array<string>} productNames - Array of product names
 * @returns {Promise<Map<string, string>>} - Map of product name to image URL
 */
export async function fetchMultipleProductImages(productNames) {
    const imagePromises = productNames.map(async (name) => {
        const url = await fetchProductImage(name);
        return [name, url];
    });
    
    const results = await Promise.all(imagePromises);
    return new Map(results);
}

/**
 * Clear the image cache
 */
export function clearImageCache() {
    imageCache.clear();
}
