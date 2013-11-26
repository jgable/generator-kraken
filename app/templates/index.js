'use strict';


var kraken = require('kraken-js'),
    app = {};


app.configure = function configure(nconf, next) {
    // Fired when an app configures itself
    next(null);
};


app.requestStart = function requestStart(server) {
    // Fired before most middleware has been registered
};


app.requestBeforeRoute = function requestBeforeRoute(server) {
    // Fired before routing occurs
};


app.requestAfterRoute = function requestAfterRoute(server) {
    // Fired after routing occurs
};


kraken.create(app).listen(function (err) {
    if (err) {
        console.error(err);
    }
});
