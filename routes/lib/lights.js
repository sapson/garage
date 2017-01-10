var express = require('express');
var _ = require('underscore');
var log = require('winston');
var moment = require('moment');
var events = require('events');

var Gpio = require('onoff').Gpio; // Constructor function for Gpio objects.
var lamp = new Gpio(17, 'out', 'none', true); // Export GPIO #17 as an output for the lights, this pin is attached to the relay board
var led = new Gpio(27, 'out'); // Status led on GPIO #27 (On = ligths on, blinking = ligths on with timer, Off = ligths off)
var button = new Gpio(18, 'in', 'rising'); // Export GPIO #18 as an input for the light switch
var motionsensor = new Gpio(22, 'in', 'rising'); // PIR motion sensor attached to GPIO #22

var timedaction = []; // array for timeout actions, used to cancel out multiple motion detections
var lastbuttonpressed = moment(); // time of the latest valid button pressed
var status = 2; // 0 = ON, 1 = TIME, 2 = OFF

module.exports = Lights;

setup();

function Lights(config) {
    this.config = config;
    this.ON = 0;
    this.OFF = 1;
    this.TIME = 5000;
}

function setup() {
	// after start, pin GPIO #17 is low

}

Lights.TIME = 5000;

// ------ events are unused for the moment
Lights.prototype.myEmmiter = new events.EventEmitter();

Lights.prototype.myEmmiter.on('Lights on', function(event, listener) {
    log.info('Lights turned on by', event);
});

Lights.prototype.myEmmiter.on('Lights off', function(event, listener) {
    log.info('Lights turned off ', event);
});
// ------ events are unused for the moment


Lights.prototype.button = button.watch(function(err, value) {

    if (err) {
        throw err;
    }

    // debounce with 50 ms
    if (lastbuttonpressed.add(50, 'ms').isAfter()) return;

    lastbuttonpressed = moment();

    cancel();
    // check if the light is already on
    // When the light is on (timed by default) then turn on the lamp permanently
    // when the lamp is ON permantently turn the lamp off

    // If the lamp is on, turn it off
    switch (status) {
        case 0:
            Lights.prototype.off('switch');
            break;
        case 1:
            Lights.prototype.on('switch');
            break;
        case 2:
            Lights.prototype.timed(15000, 'switch');
            status = 1;
    }

});

Lights.prototype.motion = motionsensor.watch(function(err, value) {
    if (err) {
        throw err;
    }

    cancel();

    // start new timed action
    Lights.prototype.timed(15000, 'motion');
});

Lights.prototype.on = function(source) {
    self = this;
    self.myEmmiter.emit('Lights on', source);

    cancel();

    status = 0;

    lamp.writeSync(0);
    led.writeSync(1);
};

Lights.prototype.off = function(source) {
    self = this;
    self.myEmmiter.emit('Lights off', source);

    cancel();

    lamp.writeSync(1);
    led.writeSync(0);

    status = 2;
};

Lights.prototype.timed = function(time, source) {
    self = this;

    if (status === 0) return;

    // duration in ms
    time = time || self.TIME;

    status = 1;

    self.myEmmiter.emit('Lights on', source);

    lamp.writeSync(0);
    //start blinking
    blink(true);

    timedaction.push(setTimeout(function() {
        self.off('after timeout');
    }, time));
};

Lights.prototype.getStatus = function() {
	return status;
};


function cancel() {
    //cancel all timed events
    _.each(timedaction, function(action) {
        log.debug('Cancelling action(s)');
        clearTimeout(timedaction.pop());
    });
}

function blink() {
	// toggle led
    led.writeSync(led.readSync() ^ 1); // 1 = on, 0 = off :)
    // repeat
    timedaction.push(setTimeout(function() {
        blink();
    }, 600));
}

// handle ctrl-c and unexport the GPIO

process.on('SIGINT', function() {
    lamp.unexport();
    button.unexport();
    log.info('Bye');
    process.exit();
});
