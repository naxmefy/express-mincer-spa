var expressMincerSpa = require('..');
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
