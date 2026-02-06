const dns = require('dns');
const fs = require('fs');

// Force usage of Google DNS to bypass local resolver issues
dns.setServers(['8.8.8.8']);

const hostname = 'cluster0.v9yf9bo.mongodb.net';
const srvName = `_mongodb._tcp.${hostname}`;

console.log(`Resolving ${hostname}...`);

Promise.all([
    new Promise((resolve, reject) => {
        dns.resolveSrv(srvName, (err, addresses) => {
            if (err) resolve({ error: err.message, type: 'SRV' });
            else resolve({ type: 'SRV', data: addresses });
        });
    }),
    new Promise((resolve, reject) => {
        dns.resolveTxt(hostname, (err, records) => {
            if (err) resolve({ error: err.message, type: 'TXT' });
            else resolve({ type: 'TXT', data: records });
        });
    })
]).then(results => {
    fs.writeFileSync('resolve_output.json', JSON.stringify(results, null, 2));
    console.log('Done writing to resolve_output.json');
});
