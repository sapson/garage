var express = require('express');
var _ = require('underscore');
var log = require('winston');
var moment = require('moment');
var events = require('events');

var Gpio = require('onoff').Gpio ;   				// Constructor function for Gpio objects.
var led = new Gpio(17, 'out','none', true);       	// Export GPIO #17 as an output for the lights, this pin is attached to the relay board
var button = new Gpio(18, 'in', 'rising');			// Export GPIO #18 as an input for the light switch
var motionsensor = new Gpio(22, 'in', 'rising');    // PIR motion sensor attached to GPIO #22

var timedaction = [];								// array for timeout actions, used to cancel out multiple motion detections

module.exports = Lights;

function Lights(config) {
	this.config = config;
	this.ON = 0;
	this.OFF = 1;
	this.TIME = 5000;
}

Lights.TIME = 5000;

// ------ events are unused for the moment
Lights.prototype.myEmmiter = new events.EventEmitter();

Lights.prototype.myEmmiter.on('Lights on', function(event,listener) {
		log.info('Lights turned on by', event);
	});	

Lights.prototype.myEmmiter.on('Lights off', function(event,listener) {
		log.info('Lights turned off ', event);
	});
// ------ events are unused for the moment


Lights.prototype.button = button.watch(function (err, value) {
  		if (err) {
   			 throw err;
  		}
  		Lights.prototype.timed(15000,'switch');
  	});

Lights.prototype.motion = motionsensor.watch(function (err, value) {
  		if (err) {
   			 throw err;
  		}

  		//cancel all running time events
  		
  		_.each(timedaction,function(action){
  			log.debug('Cancelling action(s)');
  			clearTimeout(action);
  		});
  		
  		// start new timed action
  		Lights.prototype.timed(15000,'motion');
  	});

Lights.prototype.on = function(source) {
	self = this;
	self.myEmmiter.emit('Lights on', source);

	led.writeSync(0);
};

Lights.prototype.off = function(source) {
	self = this;
	self.myEmmiter.emit('Lights off', source);

	led.writeSync(1);
};

Lights.prototype.timed = function(time,source) {
	self = this;
	
	// duration in ms
	time = time || self.TIME;
	
	self.on(source);

	timedaction.push(setTimeout(function() {
		self.off('after timeout');
	},time));
};

// handle ctrl-c and unexport the GPIO

process.on('SIGINT', function () {
  led.unexport();
  button.unexport();
  log.info('Bye');
  process.exit();
});
