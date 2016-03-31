var expressMincerSpa = require('express-mincer-spa');
var app = module.exports = expressMincerSpa(__dirname, {
    precompile: {
        files: [
            'app.css',
            'app.js'
        ]
    }
});

if(!module.parent) {
    app.start();
}
