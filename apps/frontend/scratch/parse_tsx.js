const fs = require('fs');

const content = fs.readFileSync('c:/Users/Sam Devaraja/Desktop/EventRegistration/apps/frontend/src/app/crew/(admin)/events/[eventId]/page.tsx', 'utf8');

const lines = content.split('\n');
const startLineIndex = lines.findIndex(line => line.includes('return ('));
if (startLineIndex === -1) {
  console.log('Could not find return statement');
  process.exit(1);
}

const relevantContent = lines.slice(startLineIndex).join('\n');

const tokens = [];
let pos = 0;
while (pos < relevantContent.length) {
  const nextOpen = relevantContent.indexOf('<div', pos);
  const nextClose = relevantContent.indexOf('</div', pos);
  
  if (nextOpen === -1 && nextClose === -1) break;
  
  if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
    const endOfTag = relevantContent.indexOf('>', nextOpen);
    const tagContent = relevantContent.slice(nextOpen, endOfTag + 1);
    
    // Check if it is self-closing (ends with />)
    const isSelfClosing = tagContent.trim().endsWith('/>') || relevantContent.slice(nextOpen, endOfTag + 1).includes('/>');
    
    if (!isSelfClosing) {
      const classNameMatch = tagContent.match(/className="([^"]+)"/) || tagContent.match(/className=\{([^}]+)\}/);
      const className = classNameMatch ? classNameMatch[1] : 'no-class';
      tokens.push({ type: 'open', className, pos: nextOpen });
    }
    pos = endOfTag + 1;
  } else {
    const endOfTag = relevantContent.indexOf('>', nextClose);
    tokens.push({ type: 'close', pos: nextClose });
    pos = endOfTag + 1;
  }
}

// Print hierarchy
let indent = 0;
for (const token of tokens) {
  const linesBefore = relevantContent.slice(0, token.pos).split('\n');
  const lineNum = startLineIndex + linesBefore.length;
  if (token.type === 'open') {
    console.log('  '.repeat(indent) + `DIV (Line ${lineNum}): ${token.className}`);
    indent++;
  } else {
    indent--;
    console.log('  '.repeat(indent) + `CLOSE DIV (Line ${lineNum})`);
  }
}
console.log('Final indent level:', indent);
