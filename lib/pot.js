function Pot(smallBlind, bigBlind) {
	this.chips = 0;
	this.smallBlind = smallBlind;
	this.bigBlind = bigBlind;

	this.betChips = 0;
};

// export
module.exports = exports.Pot = Pot;

Pot.prototype.bet = function(amount) {
	this.betChips = amount;
	this.addToPot(amount);
};

Pot.prototype.addToPot = function() {
	this.chips += this.betChips;
};

Pot.prototype.minimumRaise = function(bet) {
	return this.bigBlind + this.chipsToCall(bet);
};

Pot.prototype.maximumRaise = function() {
	return this.minimumRaise();
};

Pot.prototype.chipsToCall = function(bet) {
	if (typeof(bet) === 'undefined') {
		bet = 0;
	}

	return this.betChips-bet;
};

Pot.prototype.splitPot = function(contributions) {
	var pots = [];

	for (var i in contributions) {
		pots[i] = this.chips / contributions.length;
	}

	return pots;
};

Pot.prototype.reset = function() {
	var chips = this.chips;

	this.chips = 0;
	this.betChips = 0;

	return chips;
};
