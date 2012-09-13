var EventEmitter = require('events').EventEmitter,
    util         = require('util');

var ENABLE_LOGGING = false;

function powerEach(fn) {
	_powerEach(fn, [], Array.prototype.slice.call(arguments, 1));
};

function _powerEach(fn, bound, dimensions) {
	var array = dimensions[0];

	if (dimensions.length === 0) {
		fn.apply(this, bound);
	} else {
		dimensions = dimensions.slice(1);

		for (var i in array) {
			var val = array[i];
			var newBound = bound.slice(0);

			newBound.push(val);

			_powerEach(fn, newBound, dimensions);

			newBound.pop();
		}
	}
};

function State(fsm, name) {
	this.fsm = fsm;
	this.name = name;
	this.transitions = {};

	return this;
};

function FSM(callback) {
	if (!(this instanceof FSM)) {
		return new FSM(callback);
	}

	EventEmitter.call(this);

	this.callback = callback;
	this.currentState = undefined;

	return this;
};

util.inherits(FSM, EventEmitter);

FSM.prototype.is = function(state) {
	if (typeof(this.currentState) === 'undefined') {
		return false;
	}

	return this.currentState.name === state;
}

FSM.prototype.has = function(state) {
	return this[state] instanceof State;
};

FSM.prototype.get = function(state) {
	return this[state];
};

FSM.prototype.set = function(state) {
	if (this.has(state)) {
		var destination = this.get(state);

		if (ENABLE_LOGGING) {
			console.log('= ' + destination.name);
		}

		this._updateState(destination);
	}

	return this;
};

FSM.prototype.advance = function() {
	this.tryAdvance.apply(this, Array.prototype.slice.call(arguments, 0));

	return this;
};

FSM.prototype.tryAdvance = function(transition) {
	var args = Array.prototype.slice.call(arguments, 0);

	if (typeof(this.currentState) !== 'undefined') {
		var destination = this.currentState.transitions[transition];

		// found a matching transition
		if (typeof(destination) === 'undefined') {
			destination = this.currentState.transitionAny;
		}

		if (typeof(destination) !== 'undefined') {
			if (ENABLE_LOGGING) {
				console.log(this.currentState.name + ' -> ' + destination.name + ' on ' + transition);
			}

			// follow
			return this._updateState(destination, args);
		}
	}

	return false;
};

FSM.prototype._updateState = function(state, args) {
	var oldState = this.currentState;
	var result = true;

	this.currentState = state;
	
	args = args || [];
	
	if (typeof(this.callback) !== 'undefined') {
		if (typeof(this.callback[state.name]) === 'function') {
			var shouldContinue = this.callback[state.name].apply(this.callback, args);

			if (typeof(shouldContinue) === 'undefined' || shouldContinue) {
				result = true;
			}
		}
	}

	if (result) {
		args.unshift('state-'+state.name);

		this.emit.apply(this, args);

		if (state.transitionAuto && state.transitionAuto !== state) {
			result = result && this._updateState(state.transitionAuto, args);
		}
	}

	return result;
};

FSM.prototype.attach = function(from, to, transition) {
	this.state(from);
	this.state(to);

	this[from].transitions[transition] = this[to];

	this[transition] = function() {
		var args = Array.prototype.slice.call(arguments, 0);

		args.unshift(transition);

		return this.tryAdvance.apply(this, args);
	};

	return this;
};

FSM.prototype.state = function(name) {
	if (!this.has(name)) {
		this[name] = new State(this, name);
	}

	if (typeof(this.currentState) === 'undefined') {
		this.currentState = this[name];
	}

	return this[name];
};

FSM.prototype.loop = function(state) {
	return this.transition(state, state);
};

FSM.prototype.transition = function(from, to) {
	var self = this;

	if (''+from === from) {
		from = [from];
	}

	if (''+to === to) {
		to = [to];
	}

	return {
		when: function() {
			var transitions = Array.prototype.slice.call(arguments, 0);
			
			powerEach(function(fromState, toState, transition) {
				self.attach(fromState, toState, transition);
			}, from, to, transitions);

			return self;
		},
		epslion: function() {
			var transitions = Array.prototype.slice.call(arguments, 0);
			
			powerEach(function(fromState, toState) {
				this.state(fromState).transitionAuto = this.state(toState);
			}, from, to);

			return self;
		},
		any: function() {
			var transitions = Array.prototype.slice.call(arguments, 0);
			
			powerEach(function(fromState, toState) {
				this.state(fromState).transitionAny = this.state(toState);
			}, from, to);

			return self;
		},
	};
};

// export
module.exports = exports.fsm = FSM;
