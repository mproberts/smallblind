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

function Table(init) {
	EventEmitter.call(this);

	this.seats = [];
	this.playersInHand = [];
	this.buttonSeat = 0;

	this.community = new CardSet();

	this.pot = new Pot(1, 2);
	this.currentPlayer = 0;

	return this;
};

util.inherits(Table, EventEmitter);

// export
module.exports = exports.Table = Table;

Table.prototype.player = function(id) {
	var result = undefined;

	for (var i in this.seats) {
		if (typeof(this.seats[i]) !== 'undefined'
		 && this.seats[i].id == id) {
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

Table.prototype.move = function(playerId, move, amount) {
	var options = this.moveOptions(playerId);
	var player = this.player(playerId);
	var moved = false;
	var self = this;

	if (playerId !== this.playersInHand[this.currentPlayer].id) {
		return false;
	}

	function check() {
		self.currentPlayer = (self.currentPlayer+1) % self.playersInHand.length;
		
		return true;
	}

	function raise(amount) {
		player.stack -= amount;
		player.bet += amount;
		self.currentPlayer = (self.currentPlayer+1) % self.playersInHand.length;

		return true;
	}

	function call(amount) {
		player.stack -= amount;
		player.bet += amount;
		self.currentPlayer = (self.currentPlayer+1) % self.playersInHand.length;
		
		return true;
	}

	function allIn(amount) {
		player.stack -= amount;
		player.bet += amount;
		self.currentPlayer = (self.currentPlayer+1) % self.playersInHand.length;
		
		return true;
	}

	function fold() {
		self.playersInHand.splice(self.currentPlayer, 1);
		self.currentPlayer = self.currentPlayer % self.playersInHand.length;
		
		return true;
	}

	if (typeof(options[move]) !== 'undefined') {
		if (move === 'check') {
			moved = check();
		} else if (move === 'raise') {
			moved = raise(amount);
		} else if (move === 'call') {
			moved = call(amount);
		} else if (move === 'allIn') {
			moved = allIn(amount);
		} else if (move === 'fold') {
			moved = fold();
		}
	}

	return moved;
};

Table.prototype.moveOptions = function(playerId) {
	var player = this.player(playerId);

	var options = {};

	var call = this.pot.chipsToCall(player.bet);
	var raise = this.pot.minimumRaise();
	var allIn = player.stack;
	
	if (call === 0) {
		options['check'] = true;
	} else if (player.stack > call) {
		options['call'] = call;
	}

	if (player.stack > raise) {
		options['raise'] = raise;
	}

	options['all-in'] = allIn;
	options['fold'] = true;

	return options;
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

	if (typeof(id) === 'undefined') {
		id = 'player-' + Math.floor(Math.random() * 10000);
	}

	var player = new Player(id, stack);
	var seated = false;

	if (typeof(this.seats[seatNumber]) === 'undefined') {
		this.seats[seatNumber] = player;
		seated = true;
	}

	if (seated) {
		this.emit('player-joined', id, seatNumber);
	}

	return seated;
};

Table.prototype.removePlayer = function(id) {
	var seatNumber;
	var removed = false;

	for (var i in this.seats) {
		if (this.seats[i].id == id) {
			seatNumber = i;
			removed = true;
			break;
		}
	}

	if (removed) {
		this.emit('player-left', id, seatNumber);
	}

	return removed;
};

Table.prototype.reset = function() {
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

		str += player.id;
		str += (+i === this.currentPlayer ? ' *' : '') + '\t';
		str += player.hand.prettyString() + '\t';
		str += '$' + player.bet + '\t';
		str += '\n';
	}

	str += '\n';
	str += 'Community\n' + this.community.prettyString() + '\n';

	return str;
};

Table.prototype.nextPhase = function() {
	var result = true;
	var self = this;

	function hands(players) {
		for (var i in players) {
			players[i].hand.clear();
		}

		// deal two cards to each player
		for (var j = 0; j < 2; ++j) {
			for (var i in players) {
				var card = self.deck.take();

				players[i].hand.add(card);
			}
		}

		self.emit('pre-flop');
	}

	function flop(community) {
		var burn = self.deck.take();
		var flop = self.deck.take(3);

		community.add(flop);

		self.emit('flop');
	}

	function turn(community) {
		var burn = self.deck.take();
		var turn = self.deck.take();

		community.add(turn);

		self.emit('turn');
	}

	function river(community) {
		var burn = self.deck.take();
		var river = self.deck.take();

		community.add(river);

		self.emit('river');
	}

	if (this.playersInHand.length < 2) {
		result = false;
	}
	else if (this.playersInHand[0].hand.count() === 0) {
		// no hands have been dealt yet
		hands(self.playersInHand);
	}
	else {
		// deal the correct community cards
		switch (self.community.count()) {
			case 0:
				flop(self.community);
				break;
			case 3:
				turn(self.community);
				break;
			case 4:
				river(self.community);
				break;
			default:
				result = false;
				break;
		}
	}

	return result;
};
