# MongoDB Performance Optimization Guide

## Indexes to Create

To improve query performance, create the following indexes in MongoDB:

### For Articles Collection

```javascript
// Connect to your MongoDB cluster
use ARTICLES

// Index on topic for faster topic-based queries
db.Articles.createIndex({ topic: 1 })

// Index on date for faster sorting
db.Articles.createIndex({ date: -1 })

// Compound index for topic + date queries
db.Articles.createIndex({ topic: 1, date: -1 })

// Index on _id (usually already exists, but ensure it's there)
db.Articles.createIndex({ _id: 1 })
```

### For Topic Collection (if still using it)

```javascript
// Index on name for faster lookups
db.Topic.createIndex({ name: 1 })

// Index on articles._id for faster article lookups
db.Topic.createIndex({ "articles._id": 1 })
```

## Performance Improvements Made

1. **Connection Pooling**: Created `src/utils/mongodb.js` with connection reuse
2. **MongoDB Aggregation**: Using aggregation pipelines instead of fetching all data
3. **Field Projections**: Only fetching needed fields (excluding large content fields)
4. **Using Articles Collection**: Preferring the flattened `Articles` collection over embedded `Topic` collection
5. **Server-Side Pagination**: Pagination now happens in MongoDB, not in JavaScript
6. **Date Handling**: Properly handling different date formats in queries

## Expected Performance Gains

- **Query Time**: Reduced from 5-10 seconds to < 1 second
- **Data Transfer**: Reduced by 80-90% (excluding content field)
- **Memory Usage**: Reduced by 70-80%
- **Vercel Timeout**: Should no longer timeout on Vercel

## Testing

After deploying, monitor:
1. API response times in Vercel logs
2. Database query times
3. Overall page load times

If issues persist, consider:
- Adding more specific indexes
- Implementing caching (Redis)
- Using MongoDB Atlas search indexes

