const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;
      
      const p1 = content.replace(/from\s+['"].*\/prisma\/prisma\.module['"]/g, "from '@/database/prisma.module'");
      if (p1 !== content) { content = p1; modified = true; }
      
      const p2 = content.replace(/from\s+['"].*\/prisma\/prisma\.service['"]/g, "from '@/database/prisma.service'");
      if (p2 !== content) { content = p2; modified = true; }

      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + fullPath);
      }
    }
  }
}

replaceInDir('C:/Users/Sam Devaraja/Desktop/EventRegistration/apps/backend/src/modules/admin');
