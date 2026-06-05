const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');
let d = 0, p = 0;
for(let i=800; i<1185; i++) {
  const line = lines[i];
  let cl = line.replace(/`([^`]*?)`/g, '').replace(/"(.*?)"/g, '').replace(/'(.*?)'/g, '').replace(/\/\/.*/, '');
  p += (cl.match(/\(/g) || []).length - (cl.match(/\)/g) || []).length;
  if(p < 0 || p > 2) console.log(((i+1).toString().padStart(4)), 'p:', p, ' | ', line.trim());
}
