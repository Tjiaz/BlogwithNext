# MongoDB Shell: Delete ML Articles (Keep 3 Specific Ones)

## Delete All ML Articles EXCEPT These 3

**Keep these articles:**

1. "Launch Your AI Career in 2024: 5 Free Microsoft Learning Paths"
2. "Master AI & ChatGPT: 5 Free Courses to Launch Your Expertise in 2024"
3. "8 Incredible YouTube Channels to Demystify Artificial Intelligence"

## Delete Query

```javascript
db.final_articles.deleteMany({
  $and: [
    {
      $or: [
        { topic: { $regex: /^ML$/i } },
        { topic: { $regex: /^Machine\s+Learning$/i } },
        { topic: { $regex: /^machine\s+learning$/i } },
        { topic: "ML" },
        { topic: "ml" },
        { topic: "Machine Learning" },
        { topic: "machine learning" },
      ],
    },
    {
      title: {
        $nin: [
          "Launch Your AI Career in 2024: 5 Free Microsoft Learning Paths",
          "Master AI & ChatGPT: 5 Free Courses to Launch Your Expertise in 2024",
          "8 Incredible YouTube Channels to Demystify Artificial Intelligence",
        ],
      },
    },
  ],
});
```

## Alternative: More Comprehensive Query (Handles More Variations)

```javascript
db.final_articles.deleteMany({
  $and: [
    {
      $or: [
        { topic: /^ML$/i },
        { topic: /^Machine\s+Learning$/i },
        { topic: /^machine\s+learning$/i },
        { topic: /^ml$/i },
      ],
    },
    {
      title: {
        $nin: [
          "Launch Your AI Career in 2024: 5 Free Microsoft Learning Paths",
          "Master AI & ChatGPT: 5 Free Courses to Launch Your Expertise in 2024",
          "8 Incredible YouTube Channels to Demystify Artificial Intelligence",
        ],
      },
    },
  ],
});
```

## Before Deleting: Check What Will Be Deleted

```javascript
// See which ML articles will be deleted (excluding the 3 to keep)
db.final_articles
  .find({
    $and: [
      {
        $or: [
          { topic: /^ML$/i },
          { topic: /^Machine\s+Learning$/i },
          { topic: /^machine\s+learning$/i },
          { topic: /^ml$/i },
        ],
      },
      {
        title: {
          $nin: [
            "Launch Your AI Career in 2024: 5 Free Microsoft Learning Paths",
            "Master AI & ChatGPT: 5 Free Courses to Launch Your Expertise in 2024",
            "8 Incredible YouTube Channels to Demystify Artificial Intelligence",
          ],
        },
      },
    ],
  })
  .pretty();
```

## Count How Many Will Be Deleted

```javascript
db.final_articles.countDocuments({
  $and: [
    {
      $or: [
        { topic: /^ML$/i },
        { topic: /^Machine\s+Learning$/i },
        { topic: /^machine\s+learning$/i },
        { topic: /^ml$/i },
      ],
    },
    {
      title: {
        $nin: [
          "Launch Your AI Career in 2024: 5 Free Microsoft Learning Paths",
          "Master AI & ChatGPT: 5 Free Courses to Launch Your Expertise in 2024",
          "8 Incredible YouTube Channels to Demystify Artificial Intelligence",
        ],
      },
    },
  ],
});
```

## Verify Articles to Keep Will NOT Be Deleted

```javascript
// Check that the 3 articles to keep exist and have ML topic
db.final_articles
  .find({
    title: {
      $in: [
        "Launch Your AI Career in 2024: 5 Free Microsoft Learning Paths",
        "Master AI & ChatGPT: 5 Free Courses to Launch Your Expertise in 2024",
        "8 Incredible YouTube Channels to Demystify Artificial Intelligence",
      ],
    },
  })
  .pretty();
```

## See All ML Articles Before Deletion

```javascript
// See ALL ML articles (including the ones to keep)
db.final_articles
  .find({
    $or: [
      { topic: /^ML$/i },
      { topic: /^Machine\s+Learning$/i },
      { topic: /^machine\s+learning$/i },
      { topic: /^ml$/i },
    ],
  })
  .pretty();
```
