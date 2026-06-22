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
  // We want to replace '$' with '₹' ONLY if it's NOT followed by '{'
  // and NOT part of 'window.$' or similar (though unlikely in React).
  // A safe way is to replace '>$' or ' $' or '$' followed by a number or '{Number' or '{item' etc.
  
  // Replace literally \$ with ₹ (if escaped in JSX)
  let newC = c.replace(/\\\$/g, '₹');
  
  // Replace $ followed by { or number
  // Be careful: template literal string interpolation is `${var}`
  // We want to replace `<text>$<text>` or `$100` or `${price}` where $ is text, but not `${...}`
  
  // Easiest is to replace:
  // >$< (unlikely)
  // \$\d (e.g. $10)
  // \$\{ (Wait, no, `${` is JS interpolation! We don't want to replace JS interpolation.
  // Actually, we can just replace ' $ ' with ' ₹ ', '>$' with '>₹', '+$' with '+₹', '\$' with '₹', 
  // '$\{' is tricky because if it's JSX text `<span>${price}</span>`, the $ is outside the {}. It's literally `$` followed by `{price}`.
  
  newC = newC.replace(/>\$/g, '>₹');
  newC = newC.replace(/ \$/g, ' ₹');
  newC = newC.replace(/\$([0-9])/g, '₹$1');
  newC = newC.replace(/\$\{(Number|product|item|c\.total|order|salesReport)/g, '₹{$1');
  
  if(newC !== c) {
    fs.writeFileSync(f, newC);
    console.log('Updated', f);
    count++;
  }
});
console.log('Total updated:', count);
