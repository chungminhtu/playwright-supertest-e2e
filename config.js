
let PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === 'frontend_e2e' || process.env.NODE_ENV === 'backend_e2e') {
    console.log('mmmmmmmmmmmmmmmmmmmmmm');
    PORT = 3001
}
module.exports = PORT;
