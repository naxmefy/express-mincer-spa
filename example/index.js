'use strict';

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
    app.start(function(error) {
        if(error) {
            throw error;
        }
        
        console.log("Application running on %s", app.config.host());
    });
}
