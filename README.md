# express-mincer-spa

easy generator of frontend application with express backend and mincer
supported asset pipeline.

[![npm version](https://badge.fury.io/js/express-mincer-spa.svg)](https://badge.fury.io/js/express-mincer-spa)
[![Dependency Status](https://gemnasium.com/naxmefy/express-mincer-spa.svg)](https://gemnasium.com/naxmefy/express-mincer-spa)

[![Build Status](https://travis-ci.org/naxmefy/express-mincer-spa.svg?branch=master)](https://travis-ci.org/naxmefy/express-mincer-spa)
[![Coverage Status](https://coveralls.io/repos/github/naxmefy/express-mincer-spa/badge.svg?branch=master)](https://coveralls.io/github/naxmefy/express-mincer-spa?branch=master)


[![NPM](https://nodei.co/npm/express-mincer-spa.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/express-mincer-spa/)

## installation

```
$ npm install --global express-mincer-spa
```

## usage

Generate new application

```
$ ems new my-spa-application
```

Start application

```
$ ems start my-spa-application

// or

$ node my-spa-application

// or

$ cd my-spa-application
$ node index.js
```

Precompile assets

```
$ ems precompile
```

## example font fix

e.g. Font-Awesome

```Stylus
//= require font-awesome/css/font-awesome.css

@font-face {
  font-family: 'FontAwesome';
  src: url(asset_path('font-awesome/fonts/fontawesome-webfont.eot')+'?v=4.4.0');
  src: url(asset_path('font-awesome/fonts/fontawesome-webfont.eot')+'?#iefix&v=4.4.0') format('embedded-opentype'), 
       url(asset_path('font-awesome/fonts/fontawesome-webfont.woff2')+'?v=4.4.0') format('woff2'), 
       url(asset_path('font-awesome/fonts/fontawesome-webfont.woff')+'?v=4.4.0') format('woff'), 
       url(asset_path('font-awesome/fonts/fontawesome-webfont.ttf')+'?v=4.4.0') format('truetype'), 
       url(asset_path('font-awesome/fonts/fontawesome-webfont.svg')+'?v=4.4.0#fontawesomeregular') format('svg');
  font-weight: normal;
  font-style: normal;
}

body
  padding-top: 60px
```

## contributing

* Found a bug? Create an issue!
* Missing Feature? Create an issue or fork the repo, implement the feature and start an pull request.

## license

[MIT](https://github.com/naxmefy/express-mincer-spa/blob/master/LICENSE)