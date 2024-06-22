const { test: base } = require('@playwright/test');
const app = require('../backend/server');
const supertest = require('supertest');
const path = require('path');
const serveStatic = require('serve-static');
const http = require('http');

let request;
let server;

const test = base.extend({
    // Extend the base test with the Playwright fixtures
    request: async ({ }, use) => {
        request = supertest(app);
        await use(request);
    },
    server: async ({ }, use) => {
        const serve = serveStatic(path.join(__dirname, '../dist'), { index: ['index.html'] });
        server = http.createServer((req, res) => serve(req, res, () => res.end()));

        await new Promise((resolve, reject) => {
            server.listen(3000, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Static file server running on http://localhost:3000');
                    resolve();
                }
            });
        });

        await use(server);

        server.close();
    }
});

test.beforeAll(async () => {
    // Additional setup if needed
});

test.afterAll(() => {
    if (server) {
        server.close();
    }
});

module.exports = { test, expect: base.expect };
