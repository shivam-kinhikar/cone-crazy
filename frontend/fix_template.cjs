const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if(file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let count = 0;
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Revert the accidentally broken template literals
  let newC = c.replace(/₹\{/g, '${');
  if(newC !== c) {
    fs.writeFileSync(f, newC);
    console.log('Fixed', f);
    count++;
  }
});
console.log('Total fixed:', count);
