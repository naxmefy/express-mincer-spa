var lib = require('..');

before(function() {
    this.lib = lib;
});

describe('express-mincer-spa', function() {
    describe('scanDirectories', function() {
        it('should return an array of strings', function () {
            var results = this.lib.scanDirectories(__dirname, ['fixtures']);
            results.should.containEql('fixtures/foo');
            results.should.containEql('fixtures/bar');
        });
    });
});