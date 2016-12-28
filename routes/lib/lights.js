var express = require('express');
var _ = require('underscore');
var log = require('winston');
var Gpio = require('onoff').Gpio ;   // Constructor function for Gpio objects.
var led = new Gpio(17, 'out');       // Export GPIO #14 as an output.

module.exports = Lights;

function Lights(config) {
	this.config = config;
}

Lights.on = function() {
	log.info('on');
	led.writeSync(1);
};

Lights.off = function() {
	log.info('off');
	led.writeSync(0);
};