// Normalise a reflection string: trim, collapse whitespace, remove leading/trailing punctuation
export function normalise(str: string): string {
  return str
    .trim()
    .replace(/[\s\r\n]+/g, " ")
    .replace(/^[^\w]+|[^\w]+$/g, "");
}

// Slugify a string for use as a key (lowercase, replace spaces with _, remove non-alphanum)
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
