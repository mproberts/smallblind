var Card = require('./card'),
    util = require('util');
/**
 * Constructs a cardset from the specified cards
 *
 * @param {Array|String} cards
 *
 * @return {CardSet} a cardset object
 * @api public
 */
function CardSet() {
	var result = this;

	if (!(this instanceof CardSet)) {
		result = new CardSet();
	}

	var args = Array.prototype.slice.apply(arguments);

	result.cards = [];
	result.lowBits = 0x0;
	result.highBits = 0x0;
	result.suitPrimes = 1;
	result.rankPrimes = 1;

	for (var i in args) {
		var cards = args[i];

		if (''+cards === cards) {
			result.addAll(CardSet.parse(cards).cards);
		} else if (util.isArray(cards)) {
			result.addAll(cards);
		} else {
			result.add(cards);
		}
	}

	return result;
};

// export
module.exports = exports.CardSet = CardSet;

CardSet.prototype.contains = function(card) {
	if ((this.lowBits & card.lowBits) != 0
	 || (this.highBits & card.highBits) != 0) {
	 	return true;
	}

	return false;
};

/**
 * Add all cards in the array to the CardSet
 *
 * @param {Array} cards
 *
 * @return {CardSet} this object for chaining
 * @api public
 */
CardSet.prototype.isEquivalent = function(cardset) {
	if (''+cardset === cardset) {
		return this.isEquivalent(CardSet.parse(cardset).cards);
	}

	return this.lowBits === cardset.lowBits && this.highBits === cardset.highBits;
};

/**
 * Sort the card order within the set
 *
 * @param {Function} comparator
 *
 * @return {CardSet} this object for chaining
 */
CardSet.prototype.sort = function(comparator) {
	this.cards.sort(comparator);

	return this;
};

CardSet.compareByRank = function(a, b) {
	return 4 * (b.rank - a.rank) + (b.suit - a.suit);
};

CardSet.compareBySuit = function(a, b) {
	return 15 * (b.suit - a.suit) + (b.rank - a.rank);
};

/**
 * Add all cards in the array to the CardSet
 *
 * @param {Array} cards
 *
 * @return {CardSet} this object for chaining
 * @api public
 */
CardSet.prototype.addAll = function(cards) {
	if (''+cards === cards) {
		this.addAll(CardSet.parse(cards).cards);
	}
	else if (util.isArray(cards)) {
		for (var i in cards) {
			this.add(cards[i]);
		}
	}
	else if (cards instanceof CardSet) {
		this.addAll(cards.cards);
	}

	return this;
};

/**
 * Add the card to the CardSet
 *
 * @param {Card} card 
 *
 * @return {CardSet} this object for chaining
 * @api public
 */
CardSet.prototype.add = function(card) {
	if (''+card === card) {
		return this.add(Card.parse(card));
	}

	if (!this.contains(card)) {
		this.cards.push(card);

		this.lowBits = this.lowBits | card.lowBits;
		this.highBits = this.highBits | card.highBits;

		this.rankPrimes *= card.rankPrime;
		this.suitPrimes *= card.suitPrime;
	}

	return this;
};

/**
 * Returns the position of the card in the card array
 *
 * @param {Card} card 
 *
 * @return {Number} the index of the card
 * @api public
 */
CardSet.prototype.indexOf = function(card) {
	if (''+card === card) {
		return this.indexOf(Card.parse(card));
	}

	var index = -1;
	var l = this.cards.length;

	if (this.contains(card)) {
		for (index = 0; index < l; ++index) {
			var c = this.cards[index];

			if (c.rank === card.rank && c.suit === card.suit) {
				break;
			}
		}
	}

	return index;
};

/**
 * Create a copy of the cardset
 *
 * @return {CardSet} a new card set
 */
CardSet.prototype.copy = function() {
	var cardset = new CardSet();

	cardset.cards = this.cards.slice(0);
	cardset.lowBits = this.lowBits;
	cardset.highBits = this.highBits;
	cardset.suitPrimes = this.suitPrimes;
	cardset.rankPrimes = this.rankPrimes;

	return cardset;
};

/**
 * Remove the card from the CardSet
 *
 * @param {Card} card 
 *
 * @return {CardSet} this object for chaining
 * @api public
 */
CardSet.prototype.remove = function(card) {
	if (''+card === card) {
		return this.remove(Card.parse(card));
	}

	if (this.contains(card)) {
		var index = this.indexOf(card);

		this.cards.splice(index, 1);

		this.lowBits = this.lowBits & ~card.lowBits;
		this.highBits = this.highBits & ~card.highBits;

		this.rankPrimes /= card.rankPrime;
		this.suitPrimes /= card.suitPrime;
	}

	return this;
};

/**
 * Returns a new cardset containing the range of cards from the existing cardset
 *
 * @param {Number} start
 * @param {Number} end
 *
 * @return {CardSet} a new cardset containing the cards selected from the range
 */
CardSet.prototype.subset = function(start, end) {
	if (typeof(end) === 'undefined') {
		end = this.cards.length;
	}

	var cards = this.cards.slice(start, end);
	var cardset = new CardSet(cards);

	return cardset;
};

/**
 * Parse the set of cards from the string
 *
 * @param {String} formatted 
 *
 * @return {CardSet} a new cardset containing the cards
 * @api public
 */
CardSet.parse = function(formatted) {
	// find all card matches
	var matched = formatted.match(/(?:[0-9]{1,2}|[AKQJ])[cdhs]/g);
	var cards = [];

	for (var i in matched) {
		cards.push(Card(matched[i]));
	}

	return new CardSet(cards);
};

/**
 * Shuffles the set of cards in place
 *
 * @return {CardSet} the cardset object for chaining
 */
CardSet.prototype.shuffle = function(random) {
	if (typeof(random) !== 'function') {
		random = Math.random.bind(Math);
	}

	for (var i = this.cards.length; --i >= 1; ) {
		var j = Math.round(random() * i);
		var swap = this.cards[i];

		this.cards[i] = this.cards[j];
		this.cards[j] = swap;
	}

	return this;
};

/**
 * Return a complete set of 52 cards
 *
 * @return {CardSet} a complete cardset object
 */
CardSet.fullDeck = function() {
	var cardset = new CardSet();

	for (var suit = 0; suit < 4; ++suit) {
		for (var rank = 2; rank < 15; ++rank) {
			cardset.add(new Card(rank, suit));
		}
	}

	return cardset;
};

/**
 * Return a random set of card
 *
 * @return {CardSet} a random cardset object
 * @api public
 */
CardSet.random = function(count, fn) {
	if (count > 52) {
		throw new Error('Maximum 52 cards per cardset');
	}

	// take the first count cards from a shuffled subset
	// of a complete deck of cards
	var cardset = CardSet.fullDeck().shuffle(fn).subset(0, count);

	return cardset;
};

function toString(fn) {
	var cardStrings = [];

	for (var i in this.cards) {
		cardStrings.push(fn.apply(this.cards[i]));
	}

	return cardStrings.join(' ');
};

/**
 * Write the cardset to a string
 *
 * @return {String} a string formatted for consumption
 * @api public
 */
CardSet.prototype.toString = function() {
	return toString.call(this, Card.prototype.toString);
};

/**
 * Write the cardset to a string
 *
 * @return {String} a string formatted for display
 * @api public
 */
CardSet.prototype.prettyString = function() {
	return toString.call(this, Card.prototype.prettyString);
};

function padZeros(value, length) {
	return new Array(Math.max(length - value.length + 1, 0)).join('0') + value;
}

/**
 * Write the cardset to a string
 *
 * @return {String} a string binary formatted
 * @api public
 */
CardSet.prototype.toBitString = function() {
	return padZeros(this.highBits.toString(2), 32) + padZeros(this.lowBits.toString(2), 32);
};
