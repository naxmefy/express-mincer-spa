'use strict';

var expressMincerSpa = require('..');
var app = module.exports = expressMincerSpa(__dirname, {
    precompile: {
        files: [
            'app.css',
            'app.js'
        ],
        
        views: true,
        viewFiles: [
            'index',
            'other'
        ]
    }
});

if(!module.parent) {
    app.start();
}
