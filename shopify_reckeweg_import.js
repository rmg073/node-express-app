/**
 * Mohan Health & Home — Reckeweg -> Shopify CSV Builder
 *
 * Creates ONE Shopify product per medicine and combines different potencies
 * and pack sizes as Shopify variants.
 *
 * Example:
 *   ACONITUM NAP
 *     Potency: 30 | 200 | 1M | 10M | CM
 *     Pack Size: 10ML | 20ML | 30ML
 *
 * Source: medicines.json
 * Images: uploads/reckeweg
 * Output: exports/shopify_reckeweg_products.csv
 *
 * Run:
 *   node shopify_reckeweg_import.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INPUT = path.join(ROOT, 'medicines.json');
const OUTPUT_DIR = path.join(ROOT, 'exports');
const OUTPUT = path.join(OUTPUT_DIR, 'shopify_reckeweg_products.csv');
const IMAGE_DIR = path.join(ROOT, 'uploads', 'reckeweg');
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/rmg073/node-express-app/main/uploads/reckeweg';

function safe(v) {
  return v === null || v === undefined ? '' : String(v).trim();
}

function csv(v) {
  const s = safe(v).replace(/\r?\n/g, ' ');
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function slugify(v) {
  return safe(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

function normalize(v) {
  return safe(v).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function codes(v) {
  const s = safe(v).toUpperCase();
  const found = [];
  const re = /(?:^|[^A-Z0-9])R[\s_-]*(\d{1,3})(?=$|[^0-9])/g;
  let m;
  while ((m = re.exec(s)) !== null) found.push(`R${m[1]}`);
  return [...new Set(found)];
}

// Potencies are normally written at the end of the medicine name.
// R-numbers are deliberately NOT treated as potencies.
function extractPotency(name) {
  const s = safe(name).replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const m = s.match(/(?:^|\s)(\d+(?:\.\d+)?(?:X|M)|CM|MM|LM|Q)\s*$/i);
  return m ? m[1].toUpperCase() : '';
}

function baseMedicineName(name) {
  const s = safe(name).replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return extractPotency(s)
    ? s.replace(/\s+(\d+(?:\.\d+)?(?:X|M)|CM|MM|LM|Q)\s*$/i, '').trim()
    : s;
}

function imageIndex(folder) {
  if (!folder || !fs.existsSync(folder)) return [];
  return fs.readdirSync(folder)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(file => ({
      file,
      key: normalize(path.parse(file).name),
      codes: codes(path.parse(file).name)
    }));
}

function findImages(product, images) {
  const name = safe(product.name);
  const productCodes = codes(`${name} ${safe(product.packing)} ${safe(product.company)}`);

  if (productCodes.length) {
    const byCode = images.filter(img => img.codes.some(c => productCodes.includes(c)));
    if (byCode.length) {
      return byCode.sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }));
    }
  }

  const stop = new Set([
    'dr', 'reckeweg', 'reckweg', 'germany', 'drops', 'drop', 'ml', '22ml',
    'amp', 'ampoules', 'tablets', 'tablet', 'globules', 'germanydr'
  ]);
  const tokens = name.toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(x => x.length >= 3 && !stop.has(x));

  if (!tokens.length) return [];

  const scored = images.map(img => {
    const k = img.key;
    let score = 0;
    for (const t of tokens) if (k.includes(t)) score += Math.min(t.length, 8);
    return { img, score };
  })
    .filter(x => x.score >= 6)
    .sort((a, b) => b.score - a.score || a.img.file.localeCompare(b.img.file, undefined, { numeric: true }));

  return scored.slice(0, 10).map(x => x.img);
}

if (!fs.existsSync(INPUT)) {
  console.error(`medicines.json not found: ${INPUT}`);
  process.exit(1);
}

const all = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const products = all.filter(p => /reckeweg|reckweg/i.test(safe(p.company || p.brand || '')));
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const images = imageIndex(IMAGE_DIR);

const header = [
  'Handle','Title','Body (HTML)','Vendor','Product Category','Type','Tags',
  'Published','Option1 Name','Option1 Value','Option2 Name','Option2 Value',
  'Variant SKU','Variant Grams','Variant Inventory Tracker','Variant Inventory Qty',
  'Variant Inventory Policy','Variant Fulfillment Service','Variant Price',
  'Variant Compare At Price','Variant Requires Shipping','Variant Taxable',
  'Image Src','Image Position','Image Alt Text','SEO Title','SEO Description','Status'
];

const rows = [header.join(',')];

// Group records by medicine after removing the trailing potency.
const groups = new Map();
for (const p of products) {
  const originalName = safe(p.name);
  if (!originalName) continue;
  const title = baseMedicineName(originalName);
  const key = normalize(`${safe(p.company)}|${title}`);
  if (!groups.has(key)) groups.set(key, { title, records: [] });
  groups.get(key).records.push(p);
}

let variantCount = 0;
let matchedProducts = 0;
let matchedImages = 0;
let unmatchedProducts = 0;
let duplicateVariants = 0;

for (const group of groups.values()) {
  const first = group.records[0];
  const title = group.title;
  const vendor = safe(first.company) || 'Dr. Reckeweg';
  const category = safe(first.category) || 'Homeopathic Medicine';
  const handle = slugify(`${vendor}-${title}`);

  const variants = [];
  const seen = new Set();
  for (const p of group.records) {
    const potency = extractPotency(p.name) || 'Standard';
    const packing = safe(p.packing) || 'Standard';
    const key = `${normalize(potency)}|${normalize(packing)}`;
    if (seen.has(key)) {
      duplicateVariants++;
      continue;
    }
    seen.add(key);
    variants.push({ p, potency, packing });
  }

  const groupImages = [];
  const seenImages = new Set();
  for (const v of variants) {
    for (const img of findImages(v.p, images)) {
      if (!seenImages.has(img.file)) {
        seenImages.add(img.file);
        groupImages.push(img);
      }
    }
  }

  if (groupImages.length) {
    matchedProducts++;
    matchedImages += groupImages.length;
  } else {
    unmatchedProducts++;
  }

  const description = [
    `<p><strong>${title}</strong></p>`,
    `<p>Brand: ${vendor}</p>`,
    `<p>Potency and pack size can be selected above.</p>`,
    safe(first.hsn) ? `<p>HSN: ${safe(first.hsn)}</p>` : '',
    safe(first.igst) ? `<p>GST: ${safe(first.igst)}%</p>` : ''
  ].filter(Boolean).join('');

  const tags = ['Reckeweg', 'Dr. Reckeweg', category].filter(Boolean).join(', ');

  variants.forEach((v, variantIndex) => {
    const p = v.p;
    const sku = `${slugify(vendor)}-${slugify(title)}-${slugify(v.potency)}-${slugify(v.packing)}`;
    const mrp = safe(p.mrp);
    const image = groupImages[variantIndex] || groupImages[0] || null;
    const imageUrl = image
      ? `${IMAGE_BASE_URL}/${encodeURIComponent(image.file).replace(/%2F/g, '/')}`
      : '';

    rows.push([
      handle,
      title,
      description,
      vendor,
      'Health & Household > Health Care > Homeopathic Remedies',
      category,
      tags,
      'TRUE',
      'Potency',
      v.potency,
      'Pack Size',
      v.packing,
      sku,
      '',
      'shopify',
      '0',
      'deny',
      'manual',
      mrp,
      '',
      'TRUE',
      'TRUE',
      imageUrl,
      image ? String(variantIndex + 1) : '',
      `${vendor} ${title} ${v.potency} ${v.packing}`,
      title,
      `${title} - ${vendor} - Potency ${v.potency} - Pack Size ${v.packing}`,
      'draft'
    ].map(csv).join(','));
    variantCount++;
  });
}

fs.writeFileSync(OUTPUT, rows.join('\n'), 'utf8');

console.log('==============================================');
console.log('MOHAN HEALTH & HOME - SHOPIFY RECKEWEG EXPORT');
console.log('ONE MEDICINE = MULTIPLE VARIANTS');
console.log('==============================================');
console.log(`Source records: ${all.length}`);
console.log(`Reckeweg source records: ${products.length}`);
console.log(`Shopify products created: ${groups.size}`);
console.log(`Shopify variants created: ${variantCount}`);
console.log(`Duplicate variant combinations skipped: ${duplicateVariants}`);
console.log(`Image folder: ${IMAGE_DIR}`);
console.log(`Image files found: ${images.length}`);
console.log(`Products with images: ${matchedProducts}`);
console.log(`Images attached: ${matchedImages}`);
console.log(`Products without images: ${unmatchedProducts}`);
console.log(`FINAL FILE: ${OUTPUT}`);
console.log('Products remain DRAFT. Nothing is published automatically.');
