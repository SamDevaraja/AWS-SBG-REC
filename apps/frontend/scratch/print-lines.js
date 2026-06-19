const fs = require('fs');
const content = fs.readFileSync('c:/Users/Sam Devaraja/Desktop/EventRegistration/apps/frontend/src/app/crew/(admin)/events/[eventId]/page.tsx', 'utf8');
const lines = content.split(/\r?\n/);
lines.forEach((line, i) => {
  if (line.includes('</div>') || line.includes('<div')) {
    console.log(`${i + 1}: ${line.trim()}`);
  }
});
