const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Case 1: icon="<Package className="icon-sm" />"
  // Should become icon={<Package className="icon-sm" />}
  content = content.replace(/="<([a-zA-Z0-9]+) className="icon-sm" \/>"/g, '={<$1 className="icon-sm" />}');

  // Case 2: icon='<Package className="icon-sm" />'
  content = content.replace(/='<([a-zA-Z0-9]+) className="icon-sm" \/>'/g, '={<$1 className="icon-sm" />}');

  // Case 3: Object properties: Electronics: "<Laptop className="icon-sm" />"
  // Should become Electronics: <Laptop className="icon-sm" />
  content = content.replace(/: "<([a-zA-Z0-9]+) className="icon-sm" \/>"/g, ': <$1 className="icon-sm" />');

  // Case 4: Inside template literals or strings like:
  // {added ? "<CheckCircle2 className="icon-sm" /> Added!" : "<ShoppingCart className="icon-sm" /> Add to Cart"}
  // Let's find any string starting with "<IconName..." and make it a React Fragment if it has mixed text, or just a component.
  // Actually, replacing `"<IconName className=\"icon-sm\" /> ` with `<><IconName className="icon-sm" /> ` is hard due to quotes.
  // Let's do a generic match for: "<IconName className="icon-sm" /> text"
  content = content.replace(/"<([a-zA-Z0-9]+) className="icon-sm" \/> (.*?)"/g, '<><$1 className="icon-sm" /> $2</>');
  
  // What if it's just text "<IconName className="icon-sm" />" (with no text after)?
  content = content.replace(/"<([a-zA-Z0-9]+) className="icon-sm" \/>"/g, '<$1 className="icon-sm" />');

  // Let's check for single quotes too
  content = content.replace(/'<([a-zA-Z0-9]+) className="icon-sm" \/> (.*?)'/g, '<><$1 className="icon-sm" /> $2</>');
  content = content.replace(/'<([a-zA-Z0-9]+) className="icon-sm" \/>'/g, '<$1 className="icon-sm" />');
  
  // Specific fix for " <span><IconName... /></span> " if it was stringified somehow.
  // Check if we have unescaped quotes like `"<IconName className="icon-sm" />"`
  content = content.replace(/"<([A-Z][a-zA-Z0-9]*) className="icon-sm" \/>"/g, '<$1 className="icon-sm" />');

  // Let's handle JSX `{added ? <><Check...> Added!</> : ...}`
  // If it's already inside `{ ... }`, then turning string into `<>...</>` is valid!
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${path.basename(filePath)}`);
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
