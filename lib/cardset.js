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
	var args = Array.prototype.slice.apply(arguments);

	this.cards = [];

	for (var i in args) {
		var cards = args[i];

		if (''+cards === cards) {
			this.addAll(CardSet.parse(cards).cards);
		} else if (util.isArray(cards)) {
			this.addAll(cards);
		} else {
			this.add(cards);
		}
	}

	return this;
};

// export
module.exports = exports.CardSet = CardSet;

/**
 * Add all cards in the array to the CardSet
 *
 * @param {Array} cards
 *
 * @return {CardSet} this object for chaining
 * @api public
 */
CardSet.prototype.addAll = function(cards) {
	for (var i in cards) {
		this.add(cards[i]);
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
	this.cards.push(card);

	return this;
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
