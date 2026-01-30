# MongoDB Shell: Delete Articles by Title

## Correct Syntax

```javascript
// Delete articles matching specific titles
db.final_articles.deleteMany({
  title: {
    $in: [
      "Getting Started with SQL in 5 Steps",
      "5 Free Books to Master SQL",
      "Pandas vs SQL in 2025: A Data Scientist's Strategic Guide",
      "Analyzing Diversity & Inclusion with SQL",
      "5 Free University Courses to Learn Databases and SQL",
      "Pandas vs SQL: When Data Scientists Should Use Each Tool",
      "How to Optimize SQL Queries for Faster Data Retrieval",
      "10 GitHub Repositories to Master SQL",
    ],
  },
});
```

## Alternative: Single Line (for easier copy-paste)

```javascript
db.final_articles.deleteMany({
  title: {
    $in: [
      "Getting Started with SQL in 5 Steps",
      "5 Free Books to Master SQL",
      "Pandas vs SQL in 2025: A Data Scientist's Strategic Guide",
      "Analyzing Diversity & Inclusion with SQL",
      "5 Free University Courses to Learn Databases and SQL",
      "Pandas vs SQL: When Data Scientists Should Use Each Tool",
      "How to Optimize SQL Queries for Faster Data Retrieval",
      "10 GitHub Repositories to Master SQL",
    ],
  },
});
```

## Before Deleting: Check What Will Be Deleted

```javascript
// First, see which articles match (dry run)
db.final_articles
  .find({
    title: {
      $in: [
        "Getting Started with SQL in 5 Steps",
        "5 Free Books to Master SQL",
        "Pandas vs SQL in 2025: A Data Scientist's Strategic Guide",
        "Analyzing Diversity & Inclusion with SQL",
        "5 Free University Courses to Learn Databases and SQL",
        "Pandas vs SQL: When Data Scientists Should Use Each Tool",
        "How to Optimize SQL Queries for Faster Data Retrieval",
        "10 GitHub Repositories to Master SQL",
      ],
    },
  })
  .pretty();
```

## Count How Many Will Be Deleted

```javascript
db.final_articles.countDocuments({
  title: {
    $in: [
      "Getting Started with SQL in 5 Steps",
      "5 Free Books to Master SQL",
      "Pandas vs SQL in 2025: A Data Scientist's Strategic Guide",
      "Analyzing Diversity & Inclusion with SQL",
      "5 Free University Courses to Learn Databases and SQL",
      "Pandas vs SQL: When Data Scientists Should Use Each Tool",
      "How to Optimize SQL Queries for Faster Data Retrieval",
      "10 GitHub Repositories to Master SQL",
    ],
  },
});
```

## Notes:

1. **Use `deleteMany()`** - This deletes entire documents matching the criteria
2. **Use `$in` operator** - Matches any of the titles in the array
3. **No `$pull` needed** - `$pull` is only for removing items from arrays within documents
4. **Case-sensitive** - Title matching is case-sensitive. If titles don't match exactly, they won't be deleted
5. **Check first** - Always run `find()` or `countDocuments()` first to verify what will be deleted

## If Titles Don't Match Exactly:

If the exact titles don't match (due to extra spaces, different casing, etc.), you can use regex:

```javascript
// Delete articles with titles containing these keywords
db.final_articles.deleteMany({
  $or: [
    { title: /Getting Started with SQL/i },
    { title: /5 Free Books to Master SQL/i },
    { title: /Pandas vs SQL in 2025/i },
    { title: /Analyzing Diversity.*SQL/i },
    { title: /5 Free University Courses.*SQL/i },
    { title: /Pandas vs SQL: When Data Scientists/i },
    { title: /How to Optimize SQL Queries/i },
    { title: /10 GitHub Repositories.*SQL/i },
  ],
});
```
