var express = require('express');
var _ = require('underscore');
var log = require('winston');
var moment = require('moment');
var events = require('events');

var Gpio = require('onoff').Gpio ;   		// Constructor function for Gpio objects.
var led = new Gpio(17, 'out');       		// Export GPIO #17 as an output.
var button = new Gpio(18, 'in', 'rising');		// Export GPIO #18 as an input.


module.exports = Lights;

function Lights(config) {
	this.config = config;
	this.ON = 0;
	this.OFF = 1;
	this.TIME = 5000;
}

Lights.prototype.myEmmiter = new events.EventEmitter();

Lights.prototype.myEmmiter.on('Lights on', function(event,listener) {
		log.info('on ' + event);
	});	

Lights.prototype.myEmmiter.on('Lights off', function(event,listener) {
		log.info('on ' + event);
	});

Lights.prototype.button = button.watch(function (err, value) {
  		if (err) {
   			 throw err;
  		}
  		Lights.prototype.timed(15000);
  	});


Lights.prototype.on = function() {
	self = this;
	self.myEmmiter.emit('Lights on', true);

	led.writeSync(0);
};

Lights.prototype.off = function() {
	self = this;
	self.myEmmiter.emit('Lights off', false);

	led.writeSync(1);
};

Lights.prototype.timed = function(time) {
	self = this;
	time = time || self.TIME;
	log.info('Timed on for ' + time + ' ms');
	
	self.on();
	
	var start = moment();

	setTimeout(function() {
		console.log(moment().diff(start));
		self.off();
	},time);
};

function handleEevent(event) {
	log.info(event);
}

process.on('SIGINT', function () {
  led.unexport();
  button.unexport();
  log.info('Bye');
});
