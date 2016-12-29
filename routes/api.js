var express = require('express');
var router = express.Router();
var _ = require('underscore');
var log = require('winston');

var Lights = require('./lib/lights.js');

var light = new Lights({});

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/light/on')
    .get(function(req, res) {
    	light.on();
        res.json({'light':'on'});
    });

router.route('/light/off')
    .get(function(req, res) {
    	light.off();
        res.json({'light':'off'});
    });

router.route('/light/timed')
    .get(function(req, res) {
    	light.timed();
        res.json({'light':'timed'});
    });

module.exports = router;
