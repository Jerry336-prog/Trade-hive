const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F018}-\u{1F270}\u{238C}\u{2B06}\u{2194}\u{21A9}\u{2934}\u{2935}\u{2B05}\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}]/gu;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = [...content.matchAll(emojiRegex)];
      if (matches.length > 0) {
        console.log(fullPath);
        const uniqueEmojis = [...new Set(matches.map(m => m[0]))];
        console.log('Emojis found:', uniqueEmojis.join(' '));
      }
    }
  }
}

scanDir(path.join(__dirname, 'src'));
