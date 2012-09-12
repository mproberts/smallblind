var EventEmitter = require('events').EventEmitter,
    util         = require('util');

var ENABLE_LOGGING = true;

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

function FSM() {
	EventEmitter.call(this);

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

FSM.prototype.move = function(state) {
	if (this.has(state)) {
		var destination = this.get(state);

		if (ENABLE_LOGGING) {
			console.log('= ' + destination.name);
		}

		this._updateState(destination);
	}

	return this;
};

FSM.prototype.next = function(transition) {
	var args = Array.prototype.slice.call(arguments, 1);

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
	}

	return this;
};

FSM.prototype._updateState = function(state, args) {
	this.currentState = state;
	
	args = args || [];

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

FSM.prototype.from = function() {
	var self = this;
	var fromStates = Array.prototype.slice.call(arguments, 0);

	return {
		to: function() {
			var toStates = Array.prototype.slice.call(arguments, 0);

			return {
				when: function() {
					var transitions = Array.prototype.slice.call(arguments, 0);
					
					powerEach(function(from, to, transition) {
						self.attach(from, to, transition);
					}, fromStates, toStates, transitions);

					return self;
				}
			};
		}
	};
};

var stated = {
	FSM: FSM
};

// export
module.exports = exports.stated = stated;
