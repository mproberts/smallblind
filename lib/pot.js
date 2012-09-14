function Pot(smallBlind, bigBlind) {
	this.chips = 0;
	this.smallBlind = smallBlind;
	this.bigBlind = bigBlind;

	this.betChips = 0;
};

// export
module.exports = exports.Pot = Pot;

Pot.prototype.bet = function(amount) {
	this.betChips += amount;
};

Pot.prototype.addToPot = function() {
	this.chips += this.betChips;
	this.betChips = 0;
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
