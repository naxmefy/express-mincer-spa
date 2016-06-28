var path = require('path');
var fs = require('fs');
var util = require('util');

var pkg = require('../package.json');

var debug = require('debug')('express-mincer-spa');
debug.log = console.log.bind(console);

var requireDir = require('require-dir');
var express = require('express');
var _ = require('lodash');
var favicon = require('serve-favicon');
var ConnectMincer = require('connect-mincer');
var Mincer = require('mincer');
var liveReload = require('livereload');

/**
 *
 * @param {string} root
 * @param {Object} opts
 * @return {Object} app
 */
exports = module.exports = function(root, opts) {
    if(_.isUndefined(root)) {
        throw new Error('Parameter "root" have to be defined');
    }

    debug('setup express application');
    var app = express();

    app.bootstrap = function(config) {
        debug('look for custom startup config');
        if(config == null) {
            config = {};
        }

        debug('setup default options');
        var defaultConfig = exports.getDefaultConfig(root, app.get('env'));

        debug('merge options to app configuration');
        app.config = _.assign({}, defaultConfig);
        _.merge(app.config, opts);
        _.merge(app.config, config);

        debug('scan directories and merge found asset paths');
        exports.scanDirectories(
            app.config.assets.root,
            app.config.assets.scanDirectories
        ).forEach(function(assetPath) {
            app.config.assets.paths.push(assetPath);
        });
        
        debug('asset paths %j', app.config.assets.paths);
        
        // view engine
        if(_.isArray(app.config.views)) {
            app.config.views.push(path.resolve(__dirname, 'views'));
        } else {
            app.config.views = [app.config.views, path.resolve(__dirname, 'views')];
        }
        app.set('views', app.config.views);
        app.set('view engine', app.config.engine);
        app.engine('jade', require('jade').__express);


        // setup AssetPipeline
        debug('setup asset pipeline');
        app.assetPipeline = new ConnectMincer(app.config.assets);
        if(_.isFunction(app.config.configureAssetPipeline)) {
            app.config.configureAssetPipeline(app.assetPipeline);
        }
    };

    app.setup = function(config) {
        app.bootstrap(config);

        // middlewares
        if(_.isFunction(app.config.configureExpressBeforeMiddlewares)) {
            app.config.configureExpressBeforeMiddlewares(app);
        }
        debug('setup express static for public folder');
        app.use(app.config.middlewareForStaticPublic, express.static(app.config.public, app.config.publicOptions));
        debug('setup favicon');
        app.use(favicon(app.config.favicon));

        app.use(app.assetPipeline.assets());

        if(app.get('env') !== 'production') {
            app.use(app.config.assets.mountPoint, app.assetPipeline.createServer());
            exports.livereload(app);
        }

        if(_.isFunction(app.config.configureExpress)) {
            app.config.configureExpress(app);
        }

        if(app.config.useSpaRoute !== false) {
            app.use('/*', function(req, res) {
                res.render('index');
            });
        }

        app.use(app.config.notFoundHandler);
        app.use(app.config.errorHandler);
    };

    app.start = function(config, done) {
        if(done == null) {
            done = function(err) {
                if(err) {
                    throw err;
                }

                if(app.log) {
                    app.log.info("Application running on %s", app.config.host());
                } else {
                    console.log("Application running on %s", app.config.host());
                }
            };
        }

        app.setup(config);
        app.listen(app.config.port, app.config.ip, done);
    };

    return app;
};

exports.getDefaultConfig = function(root, env) {
    return {
        port: process.env.PORT || 3000,
        ip: process.env.IP || '',

        host: function() {
            return exports.host(this.ip, this.port);
        },

        engine: 'jade',
        views: path.resolve(root, 'views'),
        public: path.resolve(root, 'public'),
        publicOptions: {
            index: false,
            redirect: false
        },
        favicon: path.resolve(root, 'public', 'favicon.ico'),

        useSpaRoute: true,
        middlewareForStaticPublic: [],
        configureAssetPipeline: function(assetPipeline)  {},
        configureExpressBeforeMiddlewares: function(app)  {},
        configureExpress: function(app)  {},

        notFoundHandler: function (req, res, next) {
            var error = new Error('Not Found');
            error.status = 404;
            next(error);
        },
        errorHandler: function(err, req, res, next) {
            res.status(err.status || 500);
            var resp = {
                message: err.message
            };
            if(req.app.get('env') !== 'production') {
                resp.error = err;
                resp.stack = err.stack.split('\n');
            }
            res.render('error.jade', resp);
        },

        assets: {
            mincer: Mincer,
            root: root,
            production: env === 'production',
            mountPoint: '/assets',
            manifestFile: path.resolve(root, 'public', 'assets', 'manifest.json'),
            paths: [],
            scanDirectories: [
                'assets'
            ]
        },

        precompile: {
            target: path.resolve(root, 'public', 'assets'),
            images: true,
            fonts: true,
            views: false,
            viewFiles: [
                'index'
            ],
            viewsTarget: path.resolve(root, 'public'),
            updateAppBeforePrecompileViews: function(app) {},
            files: [],
            options: {}
        },

        livereload: {
            active: env === 'development',
            ip: process.env.LIVERELOAD_IP || 'localhost',
            port: process.env.LIVERELOAD_PORT || 35729,
            script: function () {
                return util.format('//%s:%s/livereload.js', this.ip, this.port);
            },
            host: function() {
                return exports.host(this.ip, this.port);
            },
            watch: [],
            debug: env === 'development',
            exts: [
                'js',
                'coffee',
                'json',
                'html',
                'jade',
                'ejs',
                'css',
                'styl',
                'less',
                'png',
                'gif',
                'jpg',
                'svg',
                'ico',
                'eof',
                'ttf',
                'woff',
                'woff2'
            ]
        }
    };
};

/**
 *
 * @param {string} root
 * @param {Array} directories
 * @return {Array} asset paths
 */
exports.scanDirectories = function(root, directories) {
    var results = [];
    directories.forEach(function(directory) {
        var directoryPath = path.resolve(root, directory);
        if(fs.existsSync(directoryPath)) {
            fs.readdirSync(directoryPath).forEach(function(file) {
               var stat = fs.lstatSync(path.resolve(directoryPath, file));
               if(stat.isDirectory()) {
                   results.push(path.join(directory, file));
               }
            });
        } else {
            debug('Directory "%s" does not exist', directory);
        }
    });

    return results;
};

exports.livereload = function (app) {
    if(app.config.livereload.active) {
        debug('enable livereload server');
        // Bind LiveReload Server
        app.liveReloadServer = liveReload.createServer(_.merge({}, app.config.livereload));

        // Override Debug Logger
        // const _debug = app.liveReloadServer.debug;
        app.liveReloadServer.debug = function (str) {
            debug("LiveReload Server:", str);
        };

        // Load Watch Directories
        var watch = app.config.livereload.watch;
        exports.arrayPush(watch, app.get('views') + "/*");
        exports.arrayPush(watch, app.config.assets.paths, function(p) {
            return path.resolve(app.config.assets.root, p);
        });

        debug("LiveReload enabled.");
        debug("Watching:", watch);
        debug("LiveReload Server on", app.config.livereload.host());
        // Start Server
        app.liveReloadServer.watch(watch);

        // Bind LRScript Middleware
        app.use(function(req, res, next) {
            res.locals.LRScriptFile = app.config.livereload.script();
            res.locals.LRScriptTag = "<script src=\""+res.locals.LRScriptFile+"\"></'+'script>";
            res.locals.LRScript = "<script>document.write('"+res.locals.LRScriptTag+"')</script>";
            next();
        });
    } else {
        debug('disable livereload server');
        app.use(function (req, res, next) {
            res.locals.LRScript = "<!-- LiveReload disabled -->";
            next();
        });
    }
};

exports.arrayPush = function (target, item, transform) {
    if (_.isUndefined(transform)) {
        transform = function(x) { return x; };
    }
    item = _.isArray(item) ? item : [item];

    item.forEach(function (p) {
        target.push(transform(p));
    });

    return target;
};

exports.host = function(ip, port) {
    if(_.isEmpty(ip) === false) {
        return util.format('%s:%s', ip, port);
    }

    return util.format('localhost:%s', port);
};

exports.getPrecompileFonts = function() {
    return [
        '*.eot',
        '*.svg',
        '*.ttf',
        '*.woff',
        '*.woff2',
        '**/*.eot',
        '**/*.svg',
        '**/*.ttf',
        '**/*.woff',
        '**/*.woff2'
    ];
};

exports.getPrecompileImages = function() {
    return [
        '*.png',
        '*.gif',
        '*.jpg',
        '*.ico',
        '**/*.png',
        '**/*.gif',
        '**/*.jpg',
        '**/*.ico'
    ];
};

exports.toAssetUrl = function(source, config) {
    return (config.assetHost ? config.assetHost : '') + config.mountPoint + '/' + source;
};

exports.pkg = pkg;

exports.utils = requireDir(path.resolve(__dirname, 'utils'));
