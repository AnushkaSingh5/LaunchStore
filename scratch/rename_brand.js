const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname, '..');
const EXCLUDE_DIRS = ['.git', '.next', 'node_modules', 'scratch'];
const INCLUDE_EXTS = ['.js', '.jsx', '.css', '.json', '.md', '.sql', '.html'];

// Brand mapping rules (from KreateStore variations to Kreatorstore variations)
const REPLACEMENTS = [
  { from: /KreateStore/g, to: 'Kreatorstore' },
  { from: /kreatestore/g, to: 'kreatorstore' },
  { from: /Kreate Store/g, to: 'Kreator Store' },
  { from: /KREATESTORE/g, to: 'KREATORSTORE' }
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    let newContent = content;

    for (const rule of REPLACEMENTS) {
      if (rule.from.test(newContent)) {
        newContent = newContent.replace(rule.from, rule.to);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Processed: ${path.relative(PROJECT_DIR, filePath)}`);
    }
  } catch (err) {
    console.error(`❌ Error processing ${filePath}:`, err.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (EXCLUDE_DIRS.includes(file)) continue;
      walkDir(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (INCLUDE_EXTS.includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

console.log('🔄 Starting brand renaming process...');
walkDir(PROJECT_DIR);
console.log('🎉 Brand renaming complete across all codebase files!');
