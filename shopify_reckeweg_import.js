/**
 * Mohan Health & Home — Reckeweg -> Shopify CSV Builder
 *
 * Reads medicines.json, keeps only Reckeweg products, matches phone images,
 * and creates a Shopify-compatible CSV.
 *
 * Matching priority:
 *   1) Reckeweg code (R1, R2 ... R95), accepting R-9, R_9, R 9, etc.
 *   2) Product-name token matching.
 *
 * IMPORTANT: Shopify needs public image URLs, not local filenames.
 * Images are therefore expected under uploads/reckeweg and are referenced
 * using the public GitHub raw URL for this repository.
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

// Accept R9, R-9, R_9, R 9, r9, etc. Return canonical codes such as R9.
function codes(v) {
  const s = safe(v).toUpperCase();
  const found = [];
  const re = /(?:^|[^A-Z0-9])R[\s_-]*(\d{1,3})(?=$|[^0-9])/g;
  let m;
  while ((m = re.exec(s)) !== null) found.push(`R${m[1]}`);
  return [...new Set(found)];
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

  // Strongest match: exact Reckeweg code.
  if (productCodes.length) {
    const byCode = images.filter(img => img.codes.some(c => productCodes.includes(c)));
    if (byCode.length) {
      return byCode.sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }));
    }
  }

  // Fallback: meaningful product-name tokens.
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
  'Published','Option1 Name','Option1 Value','Variant SKU','Variant Grams',
  'Variant Inventory Tracker','Variant Inventory Qty','Variant Inventory Policy',
  'Variant Fulfillment Service','Variant Price','Variant Compare At Price',
  'Variant Requires Shipping','Variant Taxable','Image Src','Image Position',
  'Image Alt Text','SEO Title','SEO Description','Status'
];

const rows = [header.join(',')];
let matchedProducts = 0;
let matchedImages = 0;
let unmatchedProducts = 0;

for (const p of products) {
  const name = safe(p.name);
  if (!name) continue;

  const handle = slugify(`${safe(p.company)}-${name}-${safe(p.packing)}`);
  const category = safe(p.category) || 'Homeopathic Medicine';
  const vendor = safe(p.company) || 'Dr. Reckeweg';
  const packing = safe(p.packing);
  const mrp = safe(p.mrp);
  const hsn = safe(p.hsn);
  const gst = safe(p.igst || '5');
  const sku = `${slugify(vendor)}-${slugify(name)}${packing ? '-' + slugify(packing) : ''}`;
  const productImages = findImages(p, images);

  if (productImages.length) {
    matchedProducts++;
    matchedImages += productImages.length;
  } else {
    unmatchedProducts++;
  }

  const description = [
    `<p><strong>${name}</strong></p>`,
    packing ? `<p>Pack: ${packing}</p>` : '',
    vendor ? `<p>Brand: ${vendor}</p>` : '',
    hsn ? `<p>HSN: ${hsn}</p>` : '',
    gst ? `<p>GST: ${gst}%</p>` : ''
  ].filter(Boolean).join('');

  const tags = ['Reckeweg', 'Dr. Reckeweg', category, packing].filter(Boolean).join(', ');
  const base = [
    handle, name, description, vendor,
    'Health & Household > Health Care > Homeopathic Remedies',
    category, tags, 'TRUE', 'Title', packing || 'Default', sku, '',
    'shopify', '0', 'deny', 'manual', mrp, '', 'TRUE', 'TRUE'
  ];

  const imgs = productImages.length ? productImages : [null];
  imgs.forEach((img, idx) => {
    const imageFile = img ? img.file : '';
    const imageUrl = imageFile
      ? `${IMAGE_BASE_URL}/${encodeURIComponent(imageFile).replace(/%2F/g, '/')}`
      : '';

    rows.push([
      ...base,
      imageUrl,
      imageFile ? String(idx + 1) : '',
      name,
      `${vendor} ${name}${packing ? ' ' + packing : ''}`,
      `${vendor} ${name}${packing ? ' ' + packing : ''}`,
      'draft'
    ].map(csv).join(','));
  });
}

fs.writeFileSync(OUTPUT, rows.join('\n'), 'utf8');

console.log('==============================================');
console.log('MOHAN HEALTH & HOME - SHOPIFY RECKEWEG EXPORT');
console.log('==============================================');
console.log(`Source records: ${all.length}`);
console.log(`Reckeweg products: ${products.length}`);
console.log(`Image folder: ${IMAGE_DIR}`);
console.log(`Image files found: ${images.length}`);
console.log(`Products matched: ${matchedProducts}`);
console.log(`Images matched: ${matchedImages}`);
console.log(`Products unmatched: ${unmatchedProducts}`);
console.log(`FINAL FILE: ${OUTPUT}`);
console.log('Products remain DRAFT. Nothing is published automatically.');
