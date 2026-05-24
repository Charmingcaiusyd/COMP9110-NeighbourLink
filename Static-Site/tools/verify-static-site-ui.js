const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlRoot = path.join(root, 'html');
const htmlFiles = fs.readdirSync(htmlRoot).filter((name) => name.endsWith('.html'));
const hrefPattern = /href="(\.\/[^"]+\.html)"/gi;
const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

for (const file of htmlFiles) {
  const fullPath = path.join(htmlRoot, file);
  const html = fs.readFileSync(fullPath, 'utf8');
  const scripts = Array.from(html.matchAll(scriptPattern));
  for (const match of scripts) {
    const attrs = match[1] || '';
    const body = (match[2] || '').trim();
    const srcMatch = attrs.match(/\ssrc="([^"]+)"/i);
    if (!srcMatch) {
      throw new Error(`${file} contains an inline script block.`);
    }
    if (body) {
      throw new Error(`${file} contains script body content instead of a pure external reference.`);
    }
    const src = srcMatch[1];
    const target = path.resolve(path.dirname(fullPath), src);
    if (!fs.existsSync(target)) {
      throw new Error(`${file} references a missing script file: ${src}`);
    }
  }
  if (!/<title>[^<]+<\/title>/i.test(html)) {
    throw new Error(`${file} is missing a <title>.`);
  }
  if (!/<h1>[^<]+<\/h1>/i.test(html)) {
    throw new Error(`${file} is missing a page <h1>.`);
  }
  const matches = Array.from(html.matchAll(hrefPattern));
  for (const match of matches) {
    const href = match[1];
    const target = path.resolve(path.dirname(fullPath), href);
    if (!fs.existsSync(target)) {
      throw new Error(`${file} links to a missing page: ${href}`);
    }
  }
}

console.log(`Verified ${htmlFiles.length} HTML pages: titles and h1 headings present, local links resolved, and only external script references are used.`);
