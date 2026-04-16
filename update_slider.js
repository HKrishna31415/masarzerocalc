const fs = require('fs');
const path = './components/InputPanel.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/<SliderInput\s/g, '<SliderInput darkMode={darkMode} ');
fs.writeFileSync(path, content);
console.log('Done');
