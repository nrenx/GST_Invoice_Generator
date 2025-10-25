import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parse } from 'node-html-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.resolve(
  __dirname,
  '..',
  'Goods & Service Tax, CBIC, Government of India __ GST Goods and Services Rates.html'
);
const outputDir = path.resolve(__dirname, '..', 'src', 'data');
const outputPath = path.join(outputDir, 'gst-goods-rates.json');

function cleanText(value) {
  if (!value) {
    return '';
  }

  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const html = await readFile(htmlPath, 'utf8');
  const root = parse(html);

  const goodsTable = root.querySelector('#goods_table');
  if (!goodsTable) {
    throw new Error('Could not find goods table in source HTML.');
  }

  const rows = goodsTable.querySelectorAll('tbody tr');
  const items = rows
    .map((row) => {
      const cells = row
        .querySelectorAll('td')
        .map((cell) => cleanText(cell.text));

      if (!cells.length) {
        return null;
      }

      const cleaned = {
        chapterHeading: cells[2] ?? '',
        description: cells[3] ?? '',
        cgstRate: cells[4] ?? '',
        sgstRate: cells[5] ?? '',
        igstRate: cells[6] ?? '',
      };

      const hasContent = Object.values(cleaned).some((value) => value.length > 0);

      return hasContent ? cleaned : null;
    })
    .filter(Boolean);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(items, null, 2) + '\n', 'utf8');

  console.log(`Extracted ${items.length} GST goods rate entries to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
