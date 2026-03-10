const http = require('http');

const data = JSON.stringify({
    location: "Library",
    description: "Test description",
    image_url: "data:image/jpeg;base64,123",
    user_id: "test"
});

const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/complaints',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
    });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
