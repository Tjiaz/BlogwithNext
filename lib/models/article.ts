// lib/models/article.ts

// Define the article schema
// This will be used for database modeling and type definitions
export interface Article {
  id: string;
  title: string;
  content: string;
  headings: Heading[];
}

// Represents a heading in the article
export interface Heading {
  id: string;
  text: string;
  level: number;
  position: number;
}