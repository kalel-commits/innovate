// Image generation service for product visualization using Gemini AI
// Uses Gemini 2.5 Flash to generate images from text prompts

import { generateImageWithGemini } from './gemini';
import { fetchProductImage } from './googleImageService';

// Cache to avoid duplicate API calls
const generatedImageCache = new Map();

/**
 * Generate product image using Gemini's AI image generation
 * @param {string} productName - Name of the product
 * @param {string} visualPrompt - Detailed visual prompt from Gemini analysis
 * @param {string} beforeAfterPrompt - Before/after comparison prompt (optional)
 * @returns {Promise<{url: string, source: string, prompt: string}>} - Image URL and metadata
 */
export async function generateProductImage(productName, visualPrompt, beforeAfterPrompt = null) {
    // Create cache key from product name and prompt
    const cacheKey = visualPrompt ? `${productName}_${visualPrompt.substring(0, 50)}` : productName;
    
    if (generatedImageCache.has(cacheKey)) {
        console.log('✓ Image found in cache:', productName);
        return generatedImageCache.get(cacheKey);
    }

    try {
        // Priority 1: Try Gemini AI image generation with detailed visual prompt
        if (visualPrompt && visualPrompt.trim()) {
            console.log('🎨 Generating AI image for:', productName);
            console.log('📝 Using visual prompt (length):', visualPrompt.length);
            console.log('📝 Visual prompt preview:', visualPrompt.substring(0, 200) + '...');
            
            try {
                const aiImageUrl = await generateImageWithGemini(visualPrompt);
                
                console.log('🔍 Gemini response type:', typeof aiImageUrl);
                console.log('🔍 Gemini response starts with data:image?', aiImageUrl?.startsWith('data:image'));
                
                if (aiImageUrl && aiImageUrl.startsWith('data:image')) {
                    const result = {
                        url: aiImageUrl,
                        source: 'ai-generated',
                        prompt: visualPrompt,
                        generatedAt: new Date().toISOString()
                    };
                    generatedImageCache.set(cacheKey, result);
                    console.log('✅ AI image generated successfully for:', productName);
                    return result;
                } else {
                    console.warn('⚠️ Gemini returned non-image data for:', productName);
                }
            } catch (error) {
                console.error(`❌ Gemini image generation failed for "${productName}":`, error.message);
                console.error('Full error:', error);
                console.log('Falling back to alternative methods...');
            }
        } else {
            console.log('⚠️ No visual prompt available for:', productName);
        }

        // Priority 2: Try with simplified prompt if detailed prompt failed
        if (productName) {
            console.log('🎨 Trying simplified prompt for:', productName);
            try {
                const simplifiedPrompt = `A photorealistic image of a ${productName}, made from recycled materials, in a home setting, professional product photography, well-lit, high quality`;
                console.log('📝 Simplified prompt:', simplifiedPrompt);
                
                const aiImageUrl = await generateImageWithGemini(simplifiedPrompt);
                
                console.log('🔍 Simplified Gemini response type:', typeof aiImageUrl);
                
                if (aiImageUrl && aiImageUrl.startsWith('data:image')) {
                    const result = {
                        url: aiImageUrl,
                        source: 'ai-generated-simple',
                        prompt: simplifiedPrompt,
                        generatedAt: new Date().toISOString()
                    };
                    generatedImageCache.set(cacheKey, result);
                    console.log('✅ AI image generated with simplified prompt for:', productName);
                    return result;
                } else {
                    console.warn('⚠️ Simplified Gemini also returned non-image data');
                }
            } catch (error) {
                console.error(`❌ Simplified Gemini generation also failed for "${productName}":`, error.message);
                console.error('Full error:', error);
            }
        }

        // Priority 3: Fall back to generic image search
        console.log('📷 Falling back to generic image search for:', productName);
        const genericImage = await fetchProductImage(productName);
        const result = {
            url: genericImage,
            source: 'generic-search',
            prompt: `Generic search for: ${productName}`,
            generatedAt: new Date().toISOString()
        };
        generatedImageCache.set(cacheKey, result);
        console.log('✓ Generic image fetched for:', productName);
        return result;

    } catch (error) {
        console.error(`❌ All image generation methods failed for ${productName}:`, error);
        
        // Ultimate fallback: placeholder
        const fallbackUrl = `https://placehold.co/400x300/e8d5c4/6b4423?text=${encodeURIComponent(productName)}&font=roboto`;
        console.log('📦 Using placeholder for:', productName);
        return {
            url: fallbackUrl,
            source: 'placeholder',
            prompt: productName,
            generatedAt: new Date().toISOString()
        };
    }
}

/**
 * Generate both product and before/after images
 * @param {string} productName - Name of the product
 * @param {string} visualPrompt - Visual product prompt
 * @param {string} beforeAfterPrompt - Before/after comparison prompt
 * @returns {Promise<{product: {url, source}, beforeAfter: {url, source}}>}
 */
export async function generateProductImagesSet(productName, visualPrompt, beforeAfterPrompt) {
    const [productImage, beforeAfterImage] = await Promise.all([
        generateProductImage(productName, visualPrompt),
        beforeAfterPrompt 
            ? generateProductImage(`${productName}-transformation`, beforeAfterPrompt)
            : Promise.resolve(null)
    ]);

    return {
        product: productImage,
        beforeAfter: beforeAfterImage
    };
}

/**
 * Clear the image generation cache
 */
export function clearImageGenerationCache() {
    generatedImageCache.clear();
    console.log('🗑️ Image cache cleared');
}

/**
 * Get cache statistics for debugging
 * @returns {Object} - Cache stats
 */
export function getImageCacheStats() {
    return {
        size: generatedImageCache.size,
        keys: Array.from(generatedImageCache.keys())
    };
}
