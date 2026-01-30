# MongoDB Shell: Delete NLP Articles

## Delete All NLP Articles Listed

```javascript
db.final_articles.deleteMany({
  title: {
    $in: [
      "Spotting Controversy with NLP",
      "Must-read NLP and Deep Learning articles for Data Scientists",
      "The NLP Model Forge: Generate Model Code On Demand",
      "Roadmap to Natural Language Processing (NLP)",
      "Production-Ready Machine Learning NLP API with FastAPI and spaCy",
      "7 Top Open Source Datasets to Train Natural Language Processing (NLP) & Text Models",
      "Where NLP is heading",
      "Cleaning and Preprocessing Text Data in Pandas for NLP Tasks",
    ],
  },
});
```

## Single Line Version (Copy-Paste Friendly)

```javascript
db.final_articles.deleteMany({
  title: {
    $in: [
      "Spotting Controversy with NLP",
      "Must-read NLP and Deep Learning articles for Data Scientists",
      "The NLP Model Forge: Generate Model Code On Demand",
      "Roadmap to Natural Language Processing (NLP)",
      "Production-Ready Machine Learning NLP API with FastAPI and spaCy",
      "7 Top Open Source Datasets to Train Natural Language Processing (NLP) & Text Models",
      "Where NLP is heading",
      "Cleaning and Preprocessing Text Data in Pandas for NLP Tasks",
    ],
  },
});
```

## Before Deleting: Check What Will Be Deleted

```javascript
// See which articles match
db.final_articles
  .find({
    title: {
      $in: [
        "Spotting Controversy with NLP",
        "Must-read NLP and Deep Learning articles for Data Scientists",
        "The NLP Model Forge: Generate Model Code On Demand",
        "Roadmap to Natural Language Processing (NLP)",
        "Production-Ready Machine Learning NLP API with FastAPI and spaCy",
        "7 Top Open Source Datasets to Train Natural Language Processing (NLP) & Text Models",
        "Where NLP is heading",
        "Cleaning and Preprocessing Text Data in Pandas for NLP Tasks",
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
      "Spotting Controversy with NLP",
      "Must-read NLP and Deep Learning articles for Data Scientists",
      "The NLP Model Forge: Generate Model Code On Demand",
      "Roadmap to Natural Language Processing (NLP)",
      "Production-Ready Machine Learning NLP API with FastAPI and spaCy",
      "7 Top Open Source Datasets to Train Natural Language Processing (NLP) & Text Models",
      "Where NLP is heading",
      "Cleaning and Preprocessing Text Data in Pandas for NLP Tasks",
    ],
  },
});
```
