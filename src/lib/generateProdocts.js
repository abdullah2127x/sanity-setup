// generate-products.js
// Node.js script to generate 1000 product objects matching the provided Sanity schema shape.
// Usage: node generate-products.js
// Output: ./products.json

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const OUT_FILE = path.join(process.cwd(), "src/data/forSanity/products.json");
const COUNT = 1000;

// Try to load fabric.json and colors.json if present, otherwise use built-in lists
function tryLoadJson(filename, fallback) {
  const p = path.join(__dirname, filename);
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf8");
      return JSON.parse(raw);
    }
  } catch (err) {
    // ignore and fallback
  }
  return fallback;
}

const fabricsFallback = [
  "Chiffon", "Cotton", "Silk", "Linen", "Wool", "Polyester",
  "Velvet", "Satin", "Georgette", "Denim", "Organza", "Tulle",
  "Crepe", "Jersey", "Rayon", "Nylon", "Leather", "Fleece",
  "Chambray", "Poplin",
];

const colorsFallback = [
  { name: "Red", code: "#FF0000" },
  { name: "Blue", code: "#0000FF" },
  { name: "Green", code: "#008000" },
  { name: "Yellow", code: "#FFFF00" },
  { name: "Black", code: "#000000" },
  { name: "White", code: "#FFFFFF" },
  { name: "Pink", code: "#FFC0CB" },
  { name: "Purple", code: "#800080" },
  { name: "Orange", code: "#FFA500" },
  { name: "Brown", code: "#A52A2A" },
  { name: "Grey", code: "#808080" },
  { name: "Beige", code: "#F5F5DC" },
  { name: "Maroon", code: "#800000" },
  { name: "Turquoise", code: "#40E0D0" },
  { name: "Navy Blue", code: "#000080" },
  { name: "Olive", code: "#808000" },
  { name: "Teal", code: "#008080" },
  { name: "Lavender", code: "#E6E6FA" },
  { name: "Gold", code: "#FFD700" },
  { name: "Silver", code: "#C0C0C0" },
];

const fabrics = tryLoadJson(
  path.join(__dirname, "src/data/forSanity/fabrics.json"),
  fabricsFallback
);

const colorsJson = tryLoadJson(
  path.join(__dirname, "src/data/forSanity/colors.json"),
  colorsFallback
);

// We'll use color names for variant.color (like your examples)
const colorNames = Array.isArray(colorsJson)
  ? colorsJson.map((c) => (typeof c === "string" ? c : c.name))
  : colorsFallback.map((c) => c.name);

// Image pools separated by audience
const imagePoolCommon = [
  "/images/categories/bottom.webp",
  "/images/categories/full.webp",
  "/images/categories/readyToWear.webp",
  "/images/categories/top.webp",
  "/images/categories/unStitched.webp",
  "/images/fabrics/Chambray.webp",
  "/images/fabrics/Chiffon.webp",
  // ... more fabric images
];

const imagePoolMen = [
  "/images/men/formal-shirt.jpg",
  "/images/men/formal-suit.jpg",
  "/images/men/hodie.jpg",
  "/images/men/jeans.jpg",
  "/images/men/kurta.jpg",
  "/images/men/polo.jpg",
  "/images/men/sherwani.jpg",
  "/images/men/t-shirt.jpg",
  "/images/men/tracksuit.jpg",
  "/images/men/trouser.jpg",
];

const imagePoolWomen = [
  "/images/women/2-piece-suit.jpg",
  "/images/women/3-piece-suit.jpg",
  "/images/women/anarkali.jpg",
  "/images/women/dress.jpg",
  "/images/women/gown.jpg",
  "/images/women/jeans-trousers.jpg",
  "/images/women/kurti.jpg",
  "/images/women/lehenga.jpg",
  "/images/women/polo.jpg",
  "/images/women/skirt.jpg",
  "/images/women/t-shirt.jpg",
  "/images/women/tracksuit.jpg",
];

// Utility functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randPick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function randPickMany(arr, min = 1, max = Math.min(3, arr.length)) {
  const n = randInt(min, max);
  const out = new Set();
  while (out.size < n) out.add(arr[randInt(0, arr.length - 1)]);
  return Array.from(out);
}
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Schema-like option sets
const audiences = ["men", "women"];
const categories = ["unStitched", "stitched", "readyToWear"];
const subCategories = ["top", "bottom", "2piece", "3piece"];
const menOutfitTypes = [
  "polo", "tshirt", "shirt", "kurta", "waistcoat",
  "2pieceSuit", "3pieceSuit", "sherwani", "jeans",
  "trousers", "shorts", "tracksuit", "jogger", "hoodie", "blazer",
];
const womenOutfitTypes = [
  "kurti", "polo", "tshirt", "blouse", "dress", "gown",
  "saree", "lehenga", "anarkali", "2pieceSuit", "3pieceSuit",
  "jeansTrousers", "skirt", "leggings", "tracksuit",
];
const seasonsList = ["summer", "winter"];
const designsList = [
  "plain", "printed", "embroidered", "block_print",
  "digital_print", "geometric", "floral", "abstract", "minimalist", "striped",
];
const occasionsList = [
  "casual", "formal", "party", "wedding", "office", "eid", "gym",
];

// Helper to generate a title that looks varied
const titleAdjs = [
  "Classic", "Modern", "Elegant", "Casual", "Premium", "Urban",
  "Comfort", "Essential", "Sport", "Formal", "Festive", "Smart",
  "Cozy", "Chic", "Vintage",
];
const productNounsMen = [
  "Shirt", "Polo", "T-Shirt", "Kurta", "Suit", "Sherwani",
  "Jeans", "Tracksuit", "Hoodie", "Blazer", "Waistcoat", "Jogger", "Pants", "Jumpsuit",
];
const productNounsWomen = [
  "Kurti", "Dress", "Gown", "Saree", "Lehenga", "Anarkali",
  "Top", "Blouse", "Skirt", "Jeans", "Trousers", "Leggings", "Maxi", "Tunic",
];

function makeTitle(i, audience) {
  const adj = randPick(titleAdjs);
  const noun =
    audience === "men"
      ? randPick(productNounsMen)
      : randPick(productNounsWomen);
  // ensure uniqueness by index
  return `${adj} ${noun} ${i}`;
}

function makeVariantPool(productIndex, audience) {
  const numVariants = randInt(1, 4);
  const colorChoices = [...colorNames].sort(() => Math.random() - 0.5);
  const chosen = colorChoices.slice(0, numVariants);

  // Choose correct image pool
  const genderPool =
    audience === "men"
      ? [...imagePoolMen, ...imagePoolCommon]
      : [...imagePoolWomen, ...imagePoolCommon];

  return chosen.map((color) => {
    const featured = randPick(genderPool);
    const addCount = randInt(0, 3);
    const additional = Array.from({ length: addCount }, () =>
      randPick(genderPool)
    );
    return {
      color,
      featuredImage: featured,
      additionalImages: additional,
      stock: randInt(0, 100),
    };
  });
}

function makeProduct(i) {
  const audience = randPick(audiences);
  const title = makeTitle(i, audience);
  const subTitle = `${title} is the sub title of this product`;
  const slug = slugify(title) + "-" + i;
  const price = +(Math.random() * (15990 - 1200) + 1200).toFixed(2);
  const category = randPick(categories);
  const subCategory = randPick(subCategories);
  const menOutfitType =
    audience === "men" ? randPick(menOutfitTypes) : undefined;
  const womenOutfitType =
    audience === "women" ? randPick(womenOutfitTypes) : undefined;
  const season = randPickMany(seasonsList, 1, 2);
  const designs = randPickMany(designsList, 1, 2);
  const occasions = randPickMany(occasionsList, 1, 2);
  const fabric = randPick(fabrics);
  const discount = randInt(0, 50);
  const variants = makeVariantPool(i, audience);
  const description = `${title} — Comfortable, stylish and made from ${fabric}. Perfect for ${occasions.join(", ")}.`;
  const relevantTags = [
    title.split(" ")[1] || "Apparel",
    ...designs.slice(0, 1),
    ...occasions.slice(0, 1),
  ].map((t) => String(t));
  const isFeatured = Math.random() < 0.12; // ~12% featured
  const isNewArrival = Math.random() < 0.18;
  const isPopular = Math.random() < 0.2;

  const product = {
    _id: crypto.randomUUID
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex"),
    title,
    subTitle,
    slug,
    price,
    audience,
    category,
    subCategory,
    ...(menOutfitType ? { menOutfitType } : {}),
    ...(womenOutfitType ? { womenOutfitType } : {}),
    season,
    designs,
    occasions,
    fabric,
    discount,
    isNewArrival,
    variants,
    description,
    relevantTags,
    isFeatured,
    isPopular,
  };

  return product;
}

console.log(`Generating ${COUNT} products...`);
const out = [];
for (let i = 1; i <= COUNT; i++) {
  out.push(makeProduct(i));
  if (i % 100 === 0) process.stdout.write(` ${i}`);
}
console.log("\nWriting to", OUT_FILE);
fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
console.log("Done. File created:", OUT_FILE);