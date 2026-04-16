import fs from 'fs';

const path = './components/Assumptions.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/text-navy-400/g, 'text-slate-500 dark:text-navy-400');
content = content.replace(/bg-navy-950\/50/g, 'bg-white dark:bg-navy-950/50');
content = content.replace(/border-white\/10/g, 'border-slate-200 dark:border-white/10');
content = content.replace(/text-white/g, 'text-slate-900 dark:text-white');
content = content.replace(/bg-navy-900/g, 'bg-slate-200 dark:bg-navy-900');
content = content.replace(/bg-card/g, 'bg-white dark:bg-navy-900');
content = content.replace(/text-navy-200/g, 'text-slate-700 dark:text-navy-200');
content = content.replace(/bg-white\/5/g, 'bg-slate-50 dark:bg-white/5');
content = content.replace(/divide-white\/5/g, 'divide-slate-200 dark:divide-white/5');

fs.writeFileSync(path, content);
console.log('Done');
