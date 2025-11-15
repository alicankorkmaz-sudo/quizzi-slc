const fs = require('fs');

// Minimal 1x1 PNG (base64)
const minimalPNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

// Create all required assets (they'll all be 1x1 for now, just to pass validation)
fs.writeFileSync('icon.png', minimalPNG);
fs.writeFileSync('splash.png', minimalPNG);
fs.writeFileSync('adaptive-icon.png', minimalPNG);
fs.writeFileSync('favicon.png', minimalPNG);

console.log('Placeholder assets created');
