var EventEmitter = require('events').EventEmitter,
    util         = require('util');

var ENABLE_LOGGING = false;

function powerEach(fn, array1, array2, array3) {
	for (var i in array1) {
		var v1 = array1[i];

		for (var j in array2) {
			var v2 = array2[j];

			for (var k in array3) {
				var v3 = array3[k];
			
				fn(v1, v2, v3);
			}
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
		if (typeof(destination) !== 'undefined') {
			if (ENABLE_LOGGING) {
				console.log(this.currentState.name + ' -> ' + destination.name + ' on ' + transition);
			}

			// follow
			this._updateState(destination, args);
		}

		return true;
	}

	return false;
};

FSM.prototype._updateState = function(state, args) {
	this.currentState = state;
	
	args = args || [];
	
	if (typeof(this.callback) !== 'undefined') {
		if (typeof(this.callback[state.name]) === 'function') {
			this.callback[state.name].apply(this.callback, args);
		}
	}

	args.unshift(state.name);

	this.emit.apply(this, args);
};

FSM.prototype.attach = function(from, to, transition) {
	this.state(from);
	this.state(to);

	this[from].transitions[transition] = this[to];

	return this;
};

FSM.prototype.state = function(name) {
	if (!this.has(name)) {
		this[name] = new State(this, name);
	}

	if (typeof(this.currentState) === 'undefined') {
		this.currentState = this[name];
	}

	return this;
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
		}
	};
};

// export
module.exports = exports.fsm = FSM;
