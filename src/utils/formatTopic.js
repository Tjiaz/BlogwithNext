/**
 * Formats topic names from database format to display format
 * Examples:
 * - "data_science" → "Data Science"
 * - "data_engineering" → "Data Engineering"
 * - "machine_learning" → "Machine Learning"
 * - "ai" → "AI"
 */
export function formatTopic(topic) {
  if (!topic) return "";
  
  // Handle already formatted topics
  if (topic.includes(" ") && !topic.includes("_")) {
    // Already formatted, just capitalize first letter of each word
    return topic
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  
  // Handle underscore-separated topics
  return topic
    .split("_")
    .map(word => {
      // Special cases for acronyms
      if (word.toLowerCase() === "ai" || word.toLowerCase() === "nlp" || word.toLowerCase() === "sql") {
        return word.toUpperCase();
      }
      // Capitalize first letter, lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
