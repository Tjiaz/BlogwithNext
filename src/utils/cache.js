// utils/cache.js
const cache = new Map();

export const cacheData = (key, data, ttl = 1800000) => {
  // 30 minutes default TTL
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

export const getCachedData = (key) => {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() - item.timestamp > item.ttl) {
    cache.delete(key);
    return null;
  }

  return item.data;
};
