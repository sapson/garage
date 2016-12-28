var express = require('express');
var router = express.Router();
var _ = require('underscore');
var log = require('winston');

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/light')
    .get(function(req, res) {
        res.json({'light':'check'});
    });


module.exports = router;
