const app = require('../../server'); // Import your backend server
const supertest = require('supertest');
const path = require('path');
const fs = require('fs');

describe('User List', () => {
    let request;

    before(() => {
        // Initialize Supertest with the Express app
        request = supertest(app);
    });

    it('should display users on the frontend', () => {
        // Intercept the API request and mock the response
        cy.intercept('GET', '/users', (req) => {
            request.get('/users').end((err, res) => {
                if (err) {
                    req.reply({
                        statusCode: 500,
                        body: 'Error fetching users'
                    });
                } else {
                    req.reply({
                        statusCode: 200,
                        body: res.body
                    });
                }
            });
        }).as('getUsers');

        // Serve the frontend static files directly using Cypress
        cy.intercept('GET', '/', (req) => {
            const indexPath = path.join(__dirname, '../dist/index.html');
            req.reply({
                statusCode: 200,
                body: fs.readFileSync(indexPath, 'utf8'),
                headers: { 'content-type': 'text/html' }
            });
        }).as('getIndex');

        cy.intercept('GET', '/**/*', (req) => {
            const filePath = path.join(__dirname, '../dist', req.url.replace('/', ''));
            req.reply({
                statusCode: 200,
                body: fs.readFileSync(filePath, 'utf8'),
                headers: { 'content-type': 'text/javascript' }
            });
        }).as('getStatic');

        // Visit the root URL to load the index.html
        cy.visit('/');

        // Wait for the intercepted request to be completed
        cy.wait('@getUsers');

        // Verify that the users are displayed correctly
        cy.get('ul#user-list li').should('have.length', 3);
        cy.get('ul#user-list li').eq(0).should('contain', 'Alice');
        cy.get('ul#user-list li').eq(1).should('contain', 'Bob');
        cy.get('ul#user-list li').eq(2).should('contain', 'Charlie');
    });
});
