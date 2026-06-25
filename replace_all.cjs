const fs = require('fs');
const path = require('path');

const EMOJI_MAP = {
  '🛍️': 'ShoppingBag', '🛍': 'ShoppingBag',
  '🗑️': 'Trash2', '🗑': 'Trash2',
  '📭': 'Inbox',
  '🏪': 'Store',
  '❤️': 'Heart', '❤': 'Heart',
  '✕': 'X',
  '🛒': 'ShoppingCart',
  '👤': 'User',
  '📦': 'Package',
  '🚀': 'Rocket',
  '🚪': 'LogOut',
  '☰': 'Menu',
  '🔍': 'Search',
  '📊': 'BarChart3',
  '➕': 'Plus',
  '🧾': 'Receipt',
  '⚙️': 'Settings', '⚙': 'Settings',
  '🎉': 'PartyPopper',
  '💳': 'CreditCard',
  '🅿️': 'CreditCard', '🅿': 'CreditCard',
  '🏦': 'Landmark',
  '💻': 'Laptop',
  '👗': 'Shirt',
  '🏠': 'HomeIcon', // Renamed since Home might conflict with page
  '⚽': 'Trophy',
  '💄': 'Sparkles',
  '📚': 'Book',
  '🧸': 'Smile',
  '🚗': 'Car',
  '💊': 'Pill',
  '✨': 'Sparkles',
  '📍': 'MapPin',
  '😕': 'Frown',
  '✅': 'CheckCircle2',
  '⚠️': 'AlertTriangle', '⚠': 'AlertTriangle',
  '❌': 'XCircle',
  '📅': 'Calendar',
  '💰': 'DollarSign',
  '⏳': 'Clock',
  '👋': 'Hand',
  '✏️': 'Pencil', '✏': 'Pencil',
  '📧': 'Mail',
  '📞': 'Phone'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let iconsNeeded = new Set();
  
  // Find emojis and replace them with <IconName />
  let newContent = content.replace(/([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F018}-\u{1F270}\u{238C}\u{2B06}\u{2194}\u{21A9}\u{2934}\u{2935}\u{2B05}\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}\u{25AA}\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}](\uFE0F)?)/gu, (match) => {
    let raw = match.replace(/\uFE0F/g, ''); // strip variation selector
    let comp = EMOJI_MAP[match] || EMOJI_MAP[raw];
    if (comp) {
      iconsNeeded.add(comp);
      return `<${comp} className="icon-sm" />`;
    }
    return match; // keep original if no map
  });

  if (iconsNeeded.size > 0 && newContent !== content) {
    let imports = `import { ${Array.from(iconsNeeded).join(', ')} } from 'lucide-react';\n`;
    // rename HomeIcon to Home on import
    imports = imports.replace('HomeIcon', 'Home as HomeIcon');
    
    // Find where to put the import
    let importIdx = newContent.lastIndexOf('import ');
    if (importIdx !== -1) {
      let endIdx = newContent.indexOf('\n', importIdx) + 1;
      newContent = newContent.slice(0, endIdx) + imports + newContent.slice(endIdx);
    } else {
      newContent = imports + newContent;
    }

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

scanDir(path.join(__dirname, 'src'));
