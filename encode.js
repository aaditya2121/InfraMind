const fs = require('fs');
const content = fs.readFileSync('firebase-service-account.json');
const b64 = content.toString('base64');
console.log('---B64_START---');
console.log(b64);
console.log('---B64_END---');
