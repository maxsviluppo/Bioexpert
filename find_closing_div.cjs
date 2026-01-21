const fs = require('fs');

const content = fs.readFileSync('index.tsx', 'utf8');

let balance = 0;
const lines = content.split('\n');

console.log('Scanning for premature div closure...');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip likely comment lines (naive)
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue;

    // Count Opens: <div ... >. exclude <div ... />
    const opensMatches = line.match(/<div\b[^>]*>/gi) || [];
    let opens = 0;
    for (const m of opensMatches) {
        if (!m.includes('/>')) opens++;
    }

    // Count Closes: </div>
    const closes = (line.match(/<\/div\s*>/gi) || []).length;

    balance += opens;
    balance -= closes;

    if (balance < 0) {
        console.log(`[FIRST NEGATIVE BALANCE] at Line ${i + 1}: ${line.trim()}`);
        console.log(`Context: ${lines[i - 1].trim()}`);
        process.exit(0);
    }
}

console.log('Scan complete. Final Balance:', balance);
