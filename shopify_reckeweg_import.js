/**
 * Mohan Health & Home — Reckeweg → Shopify Import Builder
 *
 * Builds a Shopify-compatible product CSV from the existing medicines.json.
 * ONLY products whose company/brand contains RECKWEG/RECKEWEG are included.
 *
 * Images are matched by product name against a local image folder when supplied.
 * No website scraping is performed by this importer.
 *
 * Output:
 *   exports/shopify_reckeweg_products.csv
 *
 * Run:
 *   node shopify_reckeweg_import.js
 *
 * Optional image folder:
 *   node shopify_reckeweg_import.js "C:\\path\\to\\reckeweg_images"
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INPUT = path.join(ROOT, 'medicines.json');
const OUTPUT_DIR = path.join(ROOT, 'exports');
const OUTPUT = path.join(OUTPUT_DIR, 'shopify_reckeweg_products.csv');
const imageFolder = process.argv[2] ? path.resolve(process.argv[2]) : null;

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

function imageIndex(folder) {
  if (!folder || !fs.existsSync(folder)) return [];
  return fs.readdirSync(folder)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(file => ({ file, key: normalize(path.parse(file).name) }));
}

function findImage(productName, images) {
  const target = normalize(productName);
  if (!target) return '';

  let exact = images.find(x => x.key === target);
  if (exact) return exact.file;

  let best = null;
  for (const item of images) {
    if (item.key.includes(target) || target.includes(item.key)) {
      if (!best || item.key.length > best.key.length) best = item;
    }
  }
  return best ? best.file : '';
}

if (!fs.existsSync(INPUT)) {
  console.error(`medicines.json not found: ${INPUT}`);
  process.exit(1);
}

const all = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const products = all.filter(p => {
  const company = safe(p.company || p.brand || '');
  return /reckweg/i.test(company) || /reckeweg/i.test(company);
});

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const images = imageIndex(imageFolder);

const header = [
  'Handle','Title','Body (HTML)','Vendor','Product Category','Type','Tags',
  'Published','Option1 Name','Option1 Value','Variant SKU','Variant Grams',
  'Variant Inventory Tracker','Variant Inventory Qty','Variant Inventory Policy',
  'Variant Fulfillment Service','Variant Price','Variant Compare At Price',
  'Variant Requires Shipping','Variant Taxable','Image Src','Image Position',
  'Image Alt Text','SEO Title','SEO Description','Status'
];

const rows = [header.join(',')];

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
  const imageFile = findImage(name, images);

  const description = [
    `<p><strong>${name}</strong></p>`,
    packing ? `<p>Pack: ${packing}</p>` : '',
    vendor ? `<p>Brand: ${vendor}</p>` : '',
    hsn ? `<p>HSN: ${hsn}</p>` : '',
    gst ? `<p>GST: ${gst}%</p>` : ''
  ].filter(Boolean).join('');

  const tags = [
    'Reckeweg',
    'Dr. Reckeweg',
    category,
    packing
  ].filter(Boolean).join(', ');

  rows.push([
    handle,
    name,
    description,
    vendor,
    'Health & Household > Health Care > Homeopathic Remedies',
    category,
    tags,
    'TRUE',
    'Title',
    packing || 'Default',
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
    imageFile,
    imageFile ? '1' : '',
    name,
    name,
    `${vendor} ${name}${packing ? ' ' + packing : ''}`,
    'draft'
  ].map(csv).join(','));
}

fs.writeFileSync(OUTPUT, rows.join('\n'), 'utf8');

console.log('==============================================');
console.log('MOHAN HEALTH & HOME — SHOPIFY RECKEWEG EXPORT');
console.log('==============================================');
console.log(`Source records: ${all.length}`);
console.log(`Reckeweg records exported: ${products.length}`);
console.log(`Image folder: ${imageFolder || '(not supplied)'}`);
console.log(`Images matched: ${products.filter(p => findImage(p.name, images)).length}`);
console.log(`Images unmatched: ${products.filter(p => !findImage(p.name, images)).length}`);
console.log(`FINAL FILE: ${OUTPUT}`);
console.log('Products are created as DRAFT so nothing is published accidentally.');
