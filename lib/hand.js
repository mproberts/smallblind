var Card = require('./card');

function Hand(rank, suit) {
};

// export
module.exports = exports.Hand = Hand;

Hand.Category = {
	ROYAL_FLUSH:     9,
	STRAIGHT_FLUSH:  8,
	FOUR_OF_A_KIND:  7,
	FULL_HOUSE:      6,
	FLUSH:           5,
	STRAIGHT:        4,
	THREE_OF_A_KIND: 3,
	TWO_PAIR:        2,
	ONE_PAIR:        1,
	HIGH_CARD:       0
};

Hand.CategoryNames = [
	'High Card',
	'One Pair',
	'Two Pair',
	'Three of a Kind',
	'Straight',
	'Flush',
	'Full House',
	'Four of a Kind',
	'Straight Flush',
	'Royal Flush'
];

Hand.FlushComposites = [
	Math.pow(Card.SuitPrimes[0], 5),
	Math.pow(Card.SuitPrimes[1], 5),
	Math.pow(Card.SuitPrimes[2], 5),
	Math.pow(Card.SuitPrimes[3], 5)
];
