// A simple placeholder for a profanity filter.
// In a real-world application, you would use a more sophisticated library
// or an external API for more comprehensive filtering.
const bannedWords = [
  "badword",
  "inappropriate",
  "offensive",
  "spam",
  "profane",
  "unwanted",
  "ugly",
  "crap"
];

export function containsProfanity(input: string): boolean {
  const lowercasedInput = input.toLowerCase();
  return bannedWords.some(word => lowercasedInput.includes(word));
}

export function sanitizeInput(input: string, maxLength = 300): string {
  // 1. Trim whitespace from start and end.
  // 2. Remove characters that aren't letters, numbers, spaces, or basic punctuation.
  // 3. Slice to the maximum length.
  return input
    .trim()
    .replace(/[^\p{L}\p{N}\s\-.,!?]/gu, "") // Use Unicode property escapes for broader language support
    .slice(0, maxLength);
}
