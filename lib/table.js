var Card         = require('./card')
    CardSet      = require('./cardset'),
    Pot          = require('./pot'),
    EventEmitter = require('events').EventEmitter,
    util         = require('util');

function Player(id, stack) {
	this.id = id;
	this.stack = stack;
	this.hand = new CardSet();
	this.bet = 0;

	return this;
};

function Table() {
	EventEmitter.call(this);

	this.seats = [];
	this.playersInHand = [];
	this.buttonSeat = 0;

	this.community = new CardSet();

	this.pot = new Pot();

	return this;
};

util.inherits(Table, EventEmitter);

// export
module.exports = exports.Table = Table;

Table.prototype.player = function(id) {
	var result = undefined;

	for (var i in this.seats) {
		if (typeof(this.seats[i]) !== 'undefined'
		 && this.seats[i].id === id) {
		 	result = this.seats[i];
		}
	}

	return result;
};

Table.prototype.players = function() {
	var players = [];

	for (var i = 0; i < this.seats.length; ++i) {
		if (typeof(this.seats[i]) !== 'undefined') {
			players[i] = this.seats[i].id;
		}
	}

	return players;
};

Table.prototype.playersInHand = function() {
	var players = [];

	for (var i = 0; i < this.playersInHand.length; ++i) {
		if (typeof(this.playersInHand[i]) !== 'undefined') {
			players[i] = this.playersInHand[i].id;
		}
	}

	return players;
};

Table.prototype.addPlayer = function(seatNumber, stack, id) {
	id = id || 'player-' + (Math.rand() * 10000);

	var player = new Player(id, stack);
	var seated = false;

	if (typeof(this.seats[seatNumber]) === 'undefined') {
		this.seats[seatNumber] = player;
		seated = true;
	}

	if (seated) {
		this.emit('new-player', id);
	}

	return seated;
};

Table.prototype.setup = function() {
	// reset the table card state
	this.deck = CardSet.fullDeck().shuffle();
	this.community = new CardSet();

	// reset the player hands
	for (var i in this.seats) {
		this.seats[i].hand = new CardSet();
	}

	// put all seats in this hand
	this.playersInHand = this.seats.slice(0);
	this.pot.reset();

	return this;
};

Table.prototype.toString = function() {
	var str = '';

	for (var i in this.playersInHand) {
		var player = this.playersInHand[i];

		str += player.id + '\t';
		str += player.hand.prettyString() + '\t';
		str += player.bet + '\t';
		str += '\n';
	}

	str += '\n';
	str += 'Community\n' + this.community.prettyString() + '\n';

	return str;
};

Table.prototype.deal = function() {
	var result = true;
	var self = this;

	function hands() {
		for (var i in self.playersInHand) {
			self.playersInHand[i].hand.clear();
		}

		// deal two cards to each player
		for (var j = 0; j = 2; ++j) {
			for (var i in self.playersInHand) {
				var card = self.deck.take();

				self.playersInHand[i].hand.add(card);
			}
		}

		self.emit('pre-flop');
	}

	function flop() {
		var burn = self.deck.take();
		var flop = self.deck.take(3);

		community.addAll(flop);

		self.emit('flop');
	}

	function turn() {
		var burn = self.deck.take();
		var turn = self.deck.take();

		community.addAll(turn);

		self.emit('turn');
	}

	function river() {
		var burn = self.deck.take();
		var river = self.deck.take();

		community.addAll(river);

		self.emit('river');
	}

	if (this.playersInHand.length < 2) {
		result = false;
	}
	else if (this.playersInHand[0].hand.count() === 0) {
		// no hands have been dealt yet
		hands();
	}
	else {
		// deal the correct community cards
		switch (community.count()) {
			case 0:
				flop();
				break;
			case 3:
				turn();
				break;
			case 4:
				river();
				break;
			default:
				result = false;
				break;
		}
	}

	return result;
};
