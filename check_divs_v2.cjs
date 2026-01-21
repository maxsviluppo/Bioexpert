const fs = require('fs');

const content = fs.readFileSync('index.tsx', 'utf8');

let balance = 0;
let rootOpen = false;
let rootStartLine = -1;

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Simple regex for div tags. NOTE: This is naive and might catch comments or strings, but usually good enough for structure.
    // We ignore self-closing <div /> though rare.

    // Count Opens
    const opens = (line.match(/<\s*div[^>]*>/g) || []).filter(m => !m.includes('/>'));
    // Count Closes
    const closes = (line.match(/<\/\s*div\s*>/g) || []);

    if (JSON.stringify(opens).length > 2 || JSON.stringify(closes).length > 2) {
        // console.log(`Line ${i+1}: +${opens.length} -${closes.length} | Balance: ${balance}`);
    }

    for (const open of opens) {
        if (balance === 0 && !rootOpen && line.includes('return')) {
            // rough heuristic for start
            // actually we can just track balance drops
        }
    }

    balance += opens.length;
    balance -= closes.length;

    if (balance === 0 && opens.length === 0 && closes.length > 0) {
        console.log(`[BALANCE 0] at Line ${i + 1}: ${line.trim()}`);
    }
    if (balance < 0) {
        console.log(`[BALANCE NEGATIVE] at Line ${i + 1}: ${line.trim()}`);
    }
}

console.log('Final Balance:', balance);
