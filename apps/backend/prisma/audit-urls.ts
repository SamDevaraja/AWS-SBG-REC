import { seedServicesPart1 } from './seed-services-part1';
import { seedServicesPart2 } from './seed-services-part2';
import { seedServicesPart3 } from './seed-services-part3';
import { seedServicesPart4 } from './seed-services-part4';
import { seedServicesPart5 } from './seed-services-part5';
import axios from 'axios';

const allServices = [
  ...seedServicesPart1,
  ...seedServicesPart2,
  ...seedServicesPart3,
  ...seedServicesPart4,
  ...seedServicesPart5
];

console.log(`Total services found: ${allServices.length}`);

async function audit() {
  const broken: { slug: string; name: string; url: string; error: string }[] = [];
  const empty: { slug: string; name: string }[] = [];
  
  for (let i = 0; i < allServices.length; i++) {
    const s = allServices[i];
    const url = s.awsDocumentationUrl;
    
    if (!url || url.trim() === '') {
      empty.push({ slug: s.slug, name: s.name });
      console.log(`[EMPTY] ${s.name} (${s.slug}) has no URL`);
      continue;
    }
    
    try {
      // Use GET request to verify the URL
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });
      console.log(`[OK] ${i+1}/${allServices.length}: ${s.name} -> ${url} (${res.status})`);
    } catch (err: any) {
      broken.push({ slug: s.slug, name: s.name, url, error: err.message });
      console.log(`[BROKEN] ${i+1}/${allServices.length}: ${s.name} -> ${url} (Error: ${err.message})`);
    }
    
    // Tiny delay to avoid aggressive calling
    await new Promise(r => setTimeout(r, 50));
  }
  
  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Total: ${allServices.length}`);
  console.log(`Empty: ${empty.length}`);
  console.log(`Broken: ${broken.length}`);
  
  if (empty.length > 0) {
    console.log('\nEmpty URLs:');
    console.log(JSON.stringify(empty, null, 2));
  }
  
  if (broken.length > 0) {
    console.log('\nBroken/Error URLs:');
    console.log(JSON.stringify(broken, null, 2));
  }
}

audit();
