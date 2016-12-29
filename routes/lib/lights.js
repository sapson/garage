var express = require('express');
var _ = require('underscore');
var log = require('winston');
var moment = require('moment');
var events = require('events');

var Gpio = require('onoff').Gpio ;   		// Constructor function for Gpio objects.
var led = new Gpio(17, 'out');       		// Export GPIO #17 as an output.
var button = new Gpio(18, 'in', 'both');		// Export GPIO #18 as an input.


module.exports = Lights;

button.watch(function (err, value) {
  self = this;	
  if (err) {
    throw err;
  }

  self.timed();
});


function Lights(config) {
	this.config = config;
	this.ON = 0;
	this.OFF = 1;
	this.TIME = 5000;
	this.myEmmiter = new events.EventEmitter();
	this.myEmmiter.on('Lights on', function(event,listener) {
		log.info('on ' + event);
	});	
	this.myEmmiter.on('Lights off', function(event,listener) {
		log.info('on ' + event);
	});
}

Lights.prototype.on = function() {
	self = this;
	self.myEmmiter.emit('Lights on', true);

	led.writeSync(self.ON);
};

Lights.prototype.off = function() {
	self = this;
	self.myEmmiter.emit('Lights off', false);
	led.writeSync(self.OFF);
};

Lights.prototype.timed = function(time) {
	self = this;
	time = time || this.TIME;
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
  //led.unexport();
  //button.unexport();
  log.info('Bye');
});