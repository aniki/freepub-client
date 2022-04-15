const fs = require('fs');
fs.writeFileSync('./public/config.json', `{"ENV":"${process.env.ENV}", "API_URL":"${process.env.API_URL}"}`);
