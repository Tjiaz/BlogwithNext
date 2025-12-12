// utils/cache.js
// Enhanced cache with localStorage persistence and data comparison

const CACHE_PREFIX = 'azbytegems_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

// In-memory cache for faster access
const memoryCache = new Map();

/**
 * Generate a cache key from URL and params
 */
export const getCacheKey = (url, params = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${CACHE_PREFIX}${url}${paramString ? `?${paramString}` : ''}`;
};

/**
 * Check if data has changed by comparing content
 */
const hasDataChanged = (oldData, newData) => {
  if (!oldData || !newData) return true;
  
  // For arrays, compare length and first item ID
  if (Array.isArray(oldData) && Array.isArray(newData)) {
    if (oldData.length !== newData.length) return true;
    if (oldData.length === 0) return false;
    
    // Compare first and last items
    const oldFirst = oldData[0]?.id || oldData[0]?._id;
    const newFirst = newData[0]?.id || newData[0]?._id;
    const oldLast = oldData[oldData.length - 1]?.id || oldData[oldData.length - 1]?._id;
    const newLast = newData[newData.length - 1]?.id || newData[newData.length - 1]?._id;
    
    return oldFirst !== newFirst || oldLast !== newLast;
  }
  
  // For objects with articles array
  if (oldData.articles && newData.articles) {
    return hasDataChanged(oldData.articles, newData.articles);
  }
  
  // Simple string comparison for other types
  return JSON.stringify(oldData) !== JSON.stringify(newData);
};

/**
 * Estimate the size of an object in bytes
 */
const estimateSize = (obj) => {
  const str = JSON.stringify(obj);
  return new Blob([str]).size;
};

/**
 * Store data in cache (both memory and localStorage)
 * Only stores in localStorage if data is under 1MB to avoid quota issues
 */
export const cacheData = (key, data, ttl = DEFAULT_TTL) => {
  if (typeof window === 'undefined') {
    // Server-side: only use memory cache
    memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    return;
  }

  const cacheItem = {
    data,
    timestamp: Date.now(),
    ttl,
  };

  // Always store in memory for fast access
  memoryCache.set(key, cacheItem);

  // Only store in localStorage if data is reasonably sized (< 1MB)
  try {
    const estimatedSize = estimateSize(cacheItem);
    const MAX_STORAGE_SIZE = 1024 * 1024; // 1MB limit
    
    if (estimatedSize > MAX_STORAGE_SIZE) {
      console.warn(`Cache item too large (${(estimatedSize / 1024).toFixed(2)}KB) for localStorage, using memory-only cache:`, key);
      return; // Skip localStorage, but keep in memory
    }

    // Store in localStorage for persistence
    const storageKey = key.replace(CACHE_PREFIX, '');
    localStorage.setItem(storageKey, JSON.stringify(cacheItem));
  } catch (error) {
    // localStorage might be full, disabled, or quota exceeded
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, using memory-only cache for:', key);
      // Try to clean up old cache entries
      cleanupExpiredCache();
    } else {
      console.warn('Failed to store in localStorage:', error);
    }
  }
};

/**
 * Retrieve data from cache (checks memory first, then localStorage)
 */
export const getCachedData = (key) => {
  // Check memory cache first
  const memoryItem = memoryCache.get(key);
  if (memoryItem) {
    const age = Date.now() - memoryItem.timestamp;
    if (age < memoryItem.ttl) {
      return memoryItem.data;
    } else {
      // Expired, remove from memory
      memoryCache.delete(key);
    }
  }

  // Check localStorage if available
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storageKey = key.replace(CACHE_PREFIX, '');
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) return null;

    const cacheItem = JSON.parse(stored);
    const age = Date.now() - cacheItem.timestamp;

    if (age < cacheItem.ttl) {
      // Restore to memory cache
      memoryCache.set(key, cacheItem);
      return cacheItem.data;
    } else {
      // Expired, remove from localStorage
      localStorage.removeItem(storageKey);
      return null;
    }
  } catch (error) {
    // Invalid data or localStorage error
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
};

/**
 * Optimize data for caching by removing unnecessary fields
 */
const optimizeForCache = (data) => {
  // Filter out base64 images that are too long
  const filterImages = (images) => {
    if (!Array.isArray(images)) return [];
    return images
      .filter(img => {
        // Reject base64 data URIs that are too long
        if (img && img.startsWith("data:image")) {
          if (img.length > 2000000) {
            return false; // Skip this image
          }
        }
        return true;
      })
      .slice(0, 3); // Limit to first 3 images
  };

  if (Array.isArray(data)) {
    return data.map(item => {
      // Only keep essential fields for articles
      if (item._id || item.id) {
        return {
          id: item.id || item._id,
          _id: item._id || item.id,
          title: item.title,
          description: item.description,
          author: item.author,
          date: item.date,
          topic: item.topic,
          filtered_images: filterImages(item.filtered_images),
          // Remove large content fields
        };
      }
      return item;
    });
  }
  
  // Handle object with articles array
  if (data.articles && Array.isArray(data.articles)) {
    return {
      ...data,
      articles: optimizeForCache(data.articles),
    };
  }
  
  return data;
};

/**
 * Fetch with caching - returns cached data if available and fresh, otherwise fetches new data
 */
export const fetchWithCache = async (url, options = {}, ttl = DEFAULT_TTL) => {
  const params = options.params || {};
  const cacheKey = getCacheKey(url, params);
  
  // Check cache first (memory and localStorage)
  const cachedData = getCachedData(cacheKey);
  if (cachedData !== null) {
    // Return cached data immediately
    return { data: cachedData, fromCache: true };
  }

  // Fetch fresh data
  try {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Optimize data for caching (remove large fields)
    const optimizedData = url.includes('latest_articles') || url.includes('moreRecent') 
      ? optimizeForCache(data) 
      : data;
    
    // Check if data has actually changed
    const hasChanged = hasDataChanged(cachedData, optimizedData);
    
    // Always cache (memory will always work, localStorage might fail for large data)
    if (hasChanged || cachedData === null) {
      cacheData(cacheKey, optimizedData, ttl);
    }

    return { data: optimizedData, fromCache: false, hasChanged };
  } catch (error) {
    console.error('Fetch error:', error);
    // If we have stale cache, return it as fallback
    if (cachedData !== null) {
      return { data: cachedData, fromCache: true, stale: true };
    }
    throw error;
  }
};

/**
 * Clear cache for a specific key or all cache
 */
export const clearCache = (key = null) => {
  if (key) {
    memoryCache.delete(key);
    if (typeof window !== 'undefined') {
      const storageKey = key.replace(CACHE_PREFIX, '');
      localStorage.removeItem(storageKey);
    }
  } else {
    // Clear all cache
    memoryCache.clear();
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(storageKey => {
        // Remove cache entries (they don't have the prefix in localStorage)
        if (storageKey.includes('cache') || storageKey.startsWith('azbytegems')) {
          localStorage.removeItem(storageKey);
        }
      });
    }
  }
};

/**
 * Clean up expired cache entries and free up space
 */
export const cleanupExpiredCache = () => {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove = [];
    let totalSize = 0;
    
    // First pass: find expired entries and calculate total size
    Object.keys(localStorage).forEach(storageKey => {
      if (storageKey.includes('cache') || storageKey.startsWith('/api/')) {
        try {
          const item = localStorage.getItem(storageKey);
          if (item) {
            totalSize += new Blob([item]).size;
            const cacheItem = JSON.parse(item);
            const age = Date.now() - cacheItem.timestamp;
            if (age >= cacheItem.ttl) {
              keysToRemove.push(storageKey);
            }
          }
        } catch (error) {
          // Invalid entry, remove it
          keysToRemove.push(storageKey);
        }
      }
    });
    
    // Remove expired entries
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // If still over quota, remove oldest entries
    if (keysToRemove.length === 0 && totalSize > 4 * 1024 * 1024) { // 4MB threshold
      const entries = [];
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.includes('cache') || storageKey.startsWith('/api/')) {
          try {
            const item = localStorage.getItem(storageKey);
            const cacheItem = JSON.parse(item);
            entries.push({ key: storageKey, timestamp: cacheItem.timestamp });
          } catch (error) {
            // Skip invalid entries
          }
        }
      });
      
      // Sort by timestamp (oldest first) and remove oldest 25%
      entries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.ceil(entries.length * 0.25);
      entries.slice(0, toRemove).forEach(entry => {
        localStorage.removeItem(entry.key);
      });
      
      console.log(`Cleaned up ${toRemove} old cache entries to free space`);
    }
  } catch (error) {
    console.warn('Failed to cleanup cache:', error);
  }
};

// Cleanup on load
if (typeof window !== 'undefined') {
  cleanupExpiredCache();
}
