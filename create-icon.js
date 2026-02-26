const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

const source = path.join(__dirname, 'public', 'logo512.png');
const dest = path.join(__dirname, 'build-resources', 'icon.ico');
const destDir = path.dirname(dest);

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

if (!fs.existsSync(source)) {
    console.warn(`Warning: Source image not found at ${source}. Creating dummy icon.`);
    // Create dummy if missing, or specific logic?
    // The previous context said "public/logo.png" exists.
    // I'll stick to error if missing to be safe per logic.
    console.error(`Source image not found: ${source}`);
    process.exit(1);
}

fs.readFile(source, (err, input) => {
    if (err) {
        console.error('Error reading source:', err);
        process.exit(1);
    }
    toIco(input, {
        resize: true,
        sizes: [16, 24, 32, 48, 64, 128, 256]
    }).then(buf => {
        fs.writeFile(dest, buf, (err) => {
            if (err) {
                console.error('Error writing icon:', err);
                process.exit(1);
            }
            console.log(`Icon successfully created at ${dest}`);
        });
    }).catch(err => {
        console.error('Error converting icon:', err);
        // Continue even if icon fails? No, better fail or warn.
        // But for automation, warn is safer.
        console.warn('Continuing without icon.ico');
    });
});
