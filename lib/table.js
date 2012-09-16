var Card         = require('./card')
    CardSet      = require('./cardset'),
    Pot          = require('./pot'),
    evaluator    = require('./naive-evaluator'),
    EventEmitter = require('events').EventEmitter,
    util         = require('util');

function Player(id, stack) {
	this.id = id;
	this.stack = stack;
	this.hand = new CardSet();
	this.bet = 0;
	this.isAllIn = false;

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

		self.pot.bet(amount);

		self.currentPlayer = (self.currentPlayer+1) % self.playersInHand.length;

		return true;
	}

	function call() {
		player.stack -= self.pot.betChips;
		player.bet += self.pot.betChips;

		self.pot.bet(self.pot.betChips);

		self.currentPlayer = (self.currentPlayer+1) % self.playersInHand.length;
		
		return true;
	}

	function allIn(amount) {
		player.stack -= amount;
		player.bet += amount;
		player.isAllIn = true;

		self.pot.bet(amount);

		self.currentPlayer = (self.currentPlayer+1) % self.playersInHand.length;
		
		return true;
	}

	function fold() {
		self.playersInHand.splice(self.currentPlayer, 1);
		self.currentPlayer = self.currentPlayer % self.playersInHand.length;
		
		return true;
	}

	// is the option available to the player
	if (typeof(options[move]) !== 'undefined') {
		if (move === 'check') {
			moved = check();
		} else if (move === 'raise') {
			moved = raise(amount);
		} else if (move === 'call') {
			moved = call();
		} else if (move === 'allIn') {
			moved = allIn(amount);
		} else if (move === 'fold') {
			moved = fold();
		}
	}

	if (moved) {
		if (this.isBettingFinished()) {
			if (this.nextCards()) {
				// finished the round, compute winner
				this.finishRound();
			}
		}
	}

	return moved;
};

Table.prototype.finishRound = function() {
	var ranks = [];
	var winningRank = 0;
	var winners = [];

	for (var i in this.playersInHand) {
		var player = this.playersInHand[i];
		var hand = player.hand.join(this.community);
		var handRank = evaluator.evaluate(hand);

		ranks[i] = handRank;

		winningRank = Math.max(handRank, winningRank);
	}

	for (var i in this.playersInHand) {
		if (ranks[i] === winningRank) {
			winners.push(i);
		}
	}
};

Table.prototype.moveOptions = function(playerId) {
	var player = this.player(playerId);

	var options = {};

	var call = this.pot.chipsToCall(player.bet);
	var raise = this.pot.minimumRaise();
	var allIn = player.stack;

	if (!player.isAllIn) {
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
	}

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

Table.fromJson = function(json) {
};

Table.prototype.toJson = function(includeHands) {
	if (typeof(includeHands) === 'undefined') {
		includeHands = true;
	}

	var obj = {
		players: [],
		community: this.community.toString().split(' '),
		pot: {
			bigBlind: this.pot.bigBlind,
			smallBlind: this.pot.smallBlind,
			chips: this.pot.chips,
		},
		currentPlayer: this.currentPlayer,
	};

	for (var i in this.seats) {
		var player = this.seats[i];
		var playerObj = {
			id: player.id,
			stack: player.stack,
			bet: player.bet
		};

		if (includeHands) {
			playerObj.hand = player.hand.toString().split(' ');
		}


		obj.players.push(playerObj);
	}

	return obj;
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

Table.prototype.isBettingFinished = function() {
	var maxBet = 0;
	var isFinished = true;

	for (var i in this.playersInHand) {
		var player = this.playersInHand[i];

		if (player.isAllIn) {
			continue;
		} else if (player.bet < maxBet) {
			isFinished = false;
			break;
		} else if (player.bet > maxBet && maxBet > 0) {
			isFinished = false;
			break;
		} else {
			maxBet = player.bet;
		}
	}

	return isFinished;
};

Table.prototype.hands = function() {
	var players = this.playersInHand;

	for (var i in players) {
		if (players[i].hand.count() >= 2) {
			throw new Error('Hands already dealt');
		}
	}

	// deal two cards to each player
	for (var j = 0; j < 2; ++j) {
		for (var i in players) {
			var card = this.deck.take();

			players[i].hand.add(card);
		}
	}

	this.emit('pre-flop');
}

Table.prototype.flop = function() {
	if (this.community.count() >= 3) {
		throw new Error('Flop already dealt');
	}

	var burn = this.deck.take();
	var flop = this.deck.take(3);

	this.community.add(flop);

	this.emit('flop');

	return flop;
};

Table.prototype.turn = function() {
	if (this.community.count() >= 4) {
		throw new Error('Turn already dealt');
	}

	var burn = this.deck.take();
	var turn = this.deck.take(1);

	this.community.add(turn);

	this.emit('turn');

	return turn;
};

Table.prototype.river = function() {
	if (this.community.count() >= 5) {
		throw new Error('River already dealt');
	}

	var burn = this.deck.take();
	var river = this.deck.take(1);

	this.community.add(river);

	this.emit('river');

	return river;
};

Table.prototype.nextCards = function() {
	var result = true;
	var self = this;

	if (this.playersInHand.length < 2) {
		result = false;
	}
	else if (this.playersInHand[0].hand.count() === 0) {
		// no hands have been dealt yet
		this.hands();
	}
	else {
		// deal the correct community cards
		switch (self.community.count()) {
			case 0:
				this.flop();
				break;
			case 3:
				this.turn();
				break;
			case 4:
				this.river();
				break;
			default:
				result = false;
				break;
		}
	}

	return result;
};
