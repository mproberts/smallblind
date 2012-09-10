var Card    = require('./card'),
    CardSet = require('./cardset'),
    Hand    = require('./hand'),
    util    = require('util');

var ENABLE_MEASUREMENT = false;
var measurements = {};

function measure(fn, name) {
	if (ENABLE_MEASUREMENT) {
		if (typeof(name) === 'undefined') {
			name = fn.name;
		}

		measurements[name] = [];

		return function() {
			var start = process.hrtime(), end;
			
			var result = fn.call(this, arguments[0], arguments[1], arguments[2]);
			
			end = process.hrtime();

			var secs = end[0] - start[0];
			var nanos = end[1] - start[1];

			var diff = secs + (nanos / 1000000000.0);

			measurements[name].push(diff);

			return result;
		};
	} else {
		return fn;
	}
};

/*
var TypeCounts = {
	'ROYAL_FLUSH':     1,
	'STRAIGHT_FLUSH':  9,
	'FOUR_OF_A_KIND':  156,
	'FULL_HOUSE':      156,
	'FLUSH':           1277,
	'STRAIGHT':        10,
	'THREE_OF_A_KIND': 858,
	'TWO_PAIR':        858,
	'ONE_PAIR':        2860,
	'HIGH_CARD':       1277
};
*/
var TypeCounts = {
	'ROYAL_FLUSH':     1 << 30,
	'STRAIGHT_FLUSH':  1 << 30,
	'FOUR_OF_A_KIND':  1 << 30,
	'FULL_HOUSE':      1 << 30,
	'FLUSH':           1 << 30,
	'STRAIGHT':        1 << 30,
	'THREE_OF_A_KIND': 1 << 30,
	'TWO_PAIR':        1 << 30,
	'ONE_PAIR':        1 << 30,
	'HIGH_CARD':       1 << 30
};

var TypeOrder = [
	'HIGH_CARD',
	'ONE_PAIR',
	'TWO_PAIR',
	'THREE_OF_A_KIND',
	'STRAIGHT',
	'FLUSH',
	'FULL_HOUSE',
	'FOUR_OF_A_KIND',
	'STRAIGHT_FLUSH',
	'ROYAL_FLUSH',
];

var TypeBoundaries = {};

function setup() {
	var total = 0;

	// compute the boundaries for each hand type
	for (var i in TypeOrder) {
		var type = TypeOrder[i];

		TypeBoundaries[type] = {
			lower: total,
			upper: total + TypeCounts[type]
		};

		total += TypeCounts[type];
	}
}

function computeHistogram(hand, dim, start, end) {
	var cards = hand.cards;
	var bins = [];

	for (var i = start; i <= end; ++i) {
		bins[i] = {
			value: i,
			cards: []
		};
	}

	for (var i = 0, l = cards.length; i < l; ++i) {
		var card = cards[i];
		var v = card[dim];

		bins[v].cards.push(card);
	}

	return bins;
};

var computeSuitHistogram = measure(function(hand) {
	return computeHistogram(hand, 'suit', 0, 3);
}, 'suit historgram');

var computeRankHistogram = measure(function(hand) {
	return computeHistogram(hand, 'rank', 2, 14);
}, 'rank histogram');

function compareByCount(a, b) {
	return b.cards.length - a.cards.length;
};

function filterBySuit(suit, cards) {
	var filtered = [];

	for (var i = 0; i < cards.length; ++i) {
		var card = cards[i];

		if (card.suit === suit) {
			filtered.push(card);
		}
	}

	return filtered;
}

var sumCardRanks = function(input, excluded) {
	var kicker = 0;
	var cards = [];
	var count = input.length;

	// remove excluded cards from the card list up front
	if (typeof(excluded) !== 'undefined') {
		for (var i = 0; i < input.length; ++i) {
			var card = input[i];
			var exists = false;

			for (var j = 0; j < excluded.length; ++j) {
				if (card == excluded[j]) {
					exists = true;
					break;
				}
			}

			if (!exists) {
				cards.push(card);
			}
		}

		count = Math.min(cards.length, 5 - excluded.length);
	} else {
		cards = input;
		count = Math.min(cards.length, 5);
	}

	for (var i = 0; i < count; ++i) {
		var card = cards[i];

		kicker = 13 * kicker + card.rank-2;
	}

	return kicker;
};

function findFlushedSuit(hand) {
	var flushedSuit = -1;

	for (var suit = 0; suit < 4; ++suit) {
		var composite = Math.pow(Card.SuitPrimes[suit], 5);

		// if the same suit prime is a repeated factor
		// we have a flush
		if (hand.suitPrimes % composite === 0) {
			flushedSuit = suit;
			break;
		}
	}

	return flushedSuit;
};

var checkPairs = measure(function(hand, rankHistogram) {
	var handValue = 0;

	// search for rank-grouped cards (pairs, full house, etc.)
	if (rankHistogram[0].cards.length === 4) {
		// four-of-a-kind
		handValue = 13 * (rankHistogram[0].value-2) // base value
		          + sumCardRanks(hand.cards, rankHistogram[0].cards) // kicker card
	 	          + TypeBoundaries.FOUR_OF_A_KIND.lower; // category value
	}
	else if (rankHistogram[0].cards.length === 3) {
		if (rankHistogram[1].cards.length === 2) {
			// full house
			// a 3's full of 2's is the lowest possible full house
			handValue = 13 * (rankHistogram[0].value-3)
			          + (rankHistogram[1].value-2)
			          + TypeBoundaries.FULL_HOUSE.lower;
		} else {
			// three-of-a-kind
			handValue = 13 * 13 * (rankHistogram[0].value-2)
			          + sumCardRanks(hand.cards, rankHistogram[0].cards)
			          + TypeBoundaries.THREE_OF_A_KIND.lower;
		}
	}
	else if (rankHistogram[0].cards.length === 2) {
		if (rankHistogram[1].cards.length === 2) {
			// two pair
			handValue = 13 * (rankHistogram[0].value-2)
			          + (rankHistogram[1].value-2)
			          + TypeBoundaries.TWO_PAIR.lower;
		} else {
			// one pair
			handValue = 13 * (rankHistogram[0].value-2)
			          + sumCardRanks(hand.cards, rankHistogram[0].cards)
			          + TypeBoundaries.ONE_PAIR.lower;
		}
	}

	return handValue;
}, 'check pairs');

var checkStraights = measure(function(hand) {
	var handValue = 0;
	var highStraight = 0;

	for (var i = 0; i < 3; ++i) {
		var last = -1;
		var highCard = 0;
		var isStraight = true;
		var isFlushed = false;
		var suitComposite = 1;
		var count = 5;

		for (var j = i; j < hand.cards.length && count >= 0 ; ++j) {
			var card = hand.cards[j];

			if (last === -1 || last === card.rank + 1) {
				// continuing the straight, check if it
				// is flushed with the suit
				suitComposite *= card.suitPrime;
				last = card.rank;
				highCard = Math.max(highCard, card.rank);
				count--;
			} else if (last === card.rank) {
				// ignore this card, except for the suit
				suitComposite *= card.suitPrime;
				continue;
			} else {
				if (count != 0) {
					// this card breaks the straight
					isStraight = false;
				}
				break;
			}
		}

		// check for flush from range
		for (var i = 0; i < 4; ++i) {
			if ((suitComposite % Hand.FlushComposites[i]) === 0) {
				flushedSuit = i;
				isFlushed = true;
				break;
			}
		}

		isStraight = isStraight && count <= 0;

		// if this is a straight or royal flush, it is
		// guaranteed to be the high straight, otherwise it
		// will be the high straight if no other straights
		// are flushed
		if (isStraight) {
			if (isFlushed) {
				if (hand.cards[i].rank === Card.Rank.ACE) {
					// royal flush
					handValue = TypeBoundaries.ROYAL_FLUSH.lower;
					break;
				} else {
					// just a plain old straight flush
					handValue = highCard - 2
					          + TypeBoundaries.STRAIGHT_FLUSH.lower;
					break;
				}
			} else {
				highStraight = highCard - 2
				          + TypeBoundaries.STRAIGHT.lower;
			}
		}

		handValue = Math.max(handValue, highStraight);
	}

	return handValue;
}, 'check straights');

var checkFlushes = measure(function(hand) {
	var handValue = 0;
	var suit = findFlushedSuit(hand);

	if (suit >= 0) {
		handValue = sumCardRanks(filterBySuit(hand.cards, suit))
		          + TypeBoundaries.FLUSH.lower;
	}

	return handValue;
}, 'check flushes');

var naiveEvaluate = measure(function naiveEvaluate(input) {
	var handValue = 0;

	var hand = input.copy().sort(CardSet.compareByRankDesc);

	// setup histograms for straight and pair detection
	var suitHistogram = computeSuitHistogram(hand);
	var rankHistogram = computeRankHistogram(hand);
	var wrappedRankHistogram;

	// sort for best card count then high card
	rankHistogram.sort(compareByCount);
	
	wrappedRankHistogram = rankHistogram.slice(0);

	// map low-ace to high-ace
	wrappedRankHistogram[1] = wrappedRankHistogram[14];

	handValue = checkPairs(hand, rankHistogram);

	// if we have more than three of a kind, a flush or straight
	// is impossible
	if (handValue <= TypeBoundaries.THREE_OF_A_KIND.upper) {
		// find straights (including straight flush)
		handValue = Math.max(checkStraights(hand), handValue);

		if (handValue < TypeBoundaries.STRAIGHT_FLUSH.lower) {
			handValue = Math.max(checkFlushes(hand), handValue);
		}
	}

	// if we haven't managed to get anything better
	// we just have the high card to rely on
	if (handValue === 0) {
		handValue = sumCardRanks(hand.cards);
	}

	return handValue;
});

function handType(handValue) {
	var type;

	if (handValue < TypeBoundaries.HIGH_CARD.upper) {
		type = Hand.Category.HIGH_CARD;
	}
	else if (handValue < TypeBoundaries.ONE_PAIR.upper) {
		type = Hand.Category.ONE_PAIR;
	}
	else if (handValue < TypeBoundaries.TWO_PAIR.upper) {
		type = Hand.Category.TWO_PAIR;
	}
	else if (handValue < TypeBoundaries.THREE_OF_A_KIND.upper) {
		type = Hand.Category.THREE_OF_A_KIND;
	}
	else if (handValue < TypeBoundaries.STRAIGHT.upper) {
		type = Hand.Category.STRAIGHT;
	}
	else if (handValue < TypeBoundaries.FLUSH.upper) {
		type = Hand.Category.FLUSH;
	}
	else if (handValue < TypeBoundaries.FULL_HOUSE.upper) {
		type = Hand.Category.FULL_HOUSE;
	}
	else if (handValue < TypeBoundaries.FOUR_OF_A_KIND.upper) {
		type = Hand.Category.FOUR_OF_A_KIND;
	}
	else if (handValue < TypeBoundaries.STRAIGHT_FLUSH.upper) {
		type = Hand.Category.STRAIGHT_FLUSH;
	}
	else if (handValue < TypeBoundaries.ROYAL_FLUSH.upper) {
		type = Hand.Category.ROYAL_FLUSH;
	}
	else {
		throw new Error('Invalid range');
	}

	return type;
};

setup();

// export
module.exports = exports.evaluator = {
	evaluate: naiveEvaluate,
	handType: handType
};

if (ENABLE_MEASUREMENT) {
	exports.evaluator.measurements = measurements;
}
