var vows   = require('vows'),
    should = require('should'),
    assert = require('assert');

var Card    = require('../lib/card'),
    Hand    = require('../lib/hand'),
    CardSet = require('../lib/cardset'),
    Eval    = require('../lib/naive-evaluator');

function value(hand) {
	return Eval.evaluate(CardSet(hand));
}

function type(hand) {
	var handValue = Eval.evaluate(CardSet(hand));

	return Eval.handType(handValue);
}

vows.describe('Evaluator').addBatch({

	'High Card': {
		'Correct type': function() {
			assert.equal(type('Ac Kh Qs Jd 9d 8s 7c'), Hand.Category.HIGH_CARD);
		},
		'Less than one pair': function() {
			assert.isTrue(value('Ac Kh Qs Jd 9d 8s 7c') < value('2c 2h 3s 4d 5d 6s 8c'));
		},
	},

	'One Pair': {
		'Correct type': function() {
			assert.equal(type('Ac Ah Js 9d 7d 5s 2c'), Hand.Category.ONE_PAIR);
		},
		'Less than two pairs': function() {
			assert.isTrue(value('Ac Ah Js 9d 7d 5s 2c') < value('Ac Ah Js Jd 7d 5s 2c'));
		},
		'Respect the kickers': function() {
			assert.isTrue(value('Ac Ah Js 9d 7d 5s 2c') < value('Ac Ah Js 9d 8d 5s 2c'));
		},
	},

	'Two Pair': {
		'Correct type': function() {
			assert.equal(type('Ac Ah Js Jd 7d 5s 2c'), Hand.Category.TWO_PAIR);
		},
		'Less than three of a kind': function() {
			assert.isTrue(value('Ac Ah Js Jd 7d 5s 2c') < value('7c 7h Js 9d 7d 5s 2c'));
		},
		'Respect the top pair': function() {
			assert.isTrue(value('Kc Kh Js Jd 7d 5s 2c') < value('Ac Ah Js Jd 8d 5s 2c'));
		},
		'Respect the bottom pair': function() {
			assert.isTrue(value('Ac Ah 10s 10d 7d 5s 2c') < value('Ac Ah Js Jd 8d 5s 2c'));
		},
		'Respect the kickers': function() {
			assert.isTrue(value('Ac Ah Js Jd 7d 5s 2c') < value('Ac Ah Js Jd 8d 5s 2c'));
		},
		'Do not value the extra cards': function() {
			assert.equal(value('Ac Ah Js Jd 7d 5s 2c'), value('Ac Ah Js Jd 7d 6s 2c'));
		},
	},
	
	'Three of a Kind': {
		'Correct type': function() {
			assert.equal(type('7c 7h Js 9d 7d 5s 2c'), Hand.Category.THREE_OF_A_KIND);
		},
		'Less than straight': function() {
			assert.isTrue(value('Ac Ah As Jd 7d 5s 2c') < value('7c 6h 5s 4d 3d 2s 2c'));
		},
		'Respect the kickers': function() {
			assert.isTrue(value('Ac Ah As Jd 7d 5s 2c') < value('Ac Ah As Qd 7d 5s 2c'));
			assert.isTrue(value('Ac Ah As Jd 7d 5s 2c') < value('Ac Ah As Jd 8d 5s 2c'));
		},
		'Do not value the extra cards': function() {
			assert.equal(value('Ac Ah As Jd 7d 5s 2c'), value('Ac Ah As Jd 7d 6s 2c'));
			assert.equal(value('Ac Ah As Jd 7d 5s 2c'), value('Ac Ah As Jd 7d 5s 3c'));
		},
	},

	'Straight': {
		'Correct type': function() {
			assert.equal(type('8h 7h 6s 5d 4d 4s 2c'), Hand.Category.STRAIGHT);
		},
		'High card not in straight': function() {
			assert.equal(type('8h 7h 6s 5d 4d 4s 10c'), Hand.Category.STRAIGHT);
		},
		'Less than flush': function() {
			assert.isTrue(value('8h 7h 6s 5d 4d 4s 2c') < value('4c 5c 9c 10c Kc 2d 4h'));
		},
		'Ace-high straight': function() {
			assert.equal(type('Ac Kd Qs Js 10d 3c 2c'), Hand.Category.STRAIGHT);
		},
		'Ace-low straight': function() {
			assert.equal(type('Qs Js 5s 4d 3c 2c Ac'), Hand.Category.STRAIGHT);
		},
		'Prefer suited low straight': function() {
			assert.equal(type('Ac Kc Qd Jd 10d 9d 8d'), Hand.Category.STRAIGHT_FLUSH);
		},
	},

	'Flush': {
		'Correct type': function() {
			assert.equal(type('4c 5c 9c 10c Kc 2d 4h'), Hand.Category.FLUSH);
		},
		'Respect the high card': function() {
			assert.isTrue(value('2c 5c 8c 10c Kc 2d 4h') < value('2c 5c 8c 10c Ac 2d 4h'));
			assert.isTrue(value('2c 5c 8c 10c Kc 2d 4h') < value('2c 5c 8c Jc Kc 2d 4h'));
			assert.isTrue(value('2c 5c 8c 10c Kc 2d 4h') < value('2c 5c 9c 10c Kc 2d 4h'));
			assert.isTrue(value('2c 5c 8c 10c Kc 2d 4h') < value('2c 6c 8c 10c Kc 2d 4h'));
			assert.isTrue(value('2c 5c 8c 10c Kc 2d 4h') < value('3c 5c 8c 10c Kc 2d 4h'));
		},
		'Less than full house': function() {
			assert.isTrue(value('4c 5c 9c 10c Kc 2d 4h') < value('4c 4d 4h 5d 5c 6d 8d'));
		},
	},

	'Full House': {
		'Correct type': function() {
			assert.equal(type('Ac Ah Js Jd Ad 5s 2c'), Hand.Category.FULL_HOUSE);
		},
		'Less than four of a kind': function() {
			assert.isTrue(value('Ac Ah Js Jd Ad 5s 2c') < value('7c 7h 7s 9d 7d 5s 2c'));
		},
		'Respect the high card': function() {
			assert.isTrue(value('Kc Kh Kd Js Jd 5s 2c') < value('Ac Ah Ad Js Jd 5s 2c'));
			assert.isTrue(value('Kc Kh Kd As Ad 5s 2c') < value('Ac Ah Ad Js Jd 5s 2c'));
		},
		'Respect the fill card': function() {
			assert.isTrue(value('Kc Kh Kd Js Jd 5s 2c') < value('Kc Kh Kd Qs Qd 5s 2c'));
		},
	},

	'Four of a Kind': {
		'Correct type': function() {
			assert.equal(type('Ac Ah As Jd Ad 5s 2c'), Hand.Category.FOUR_OF_A_KIND);
		},
		'Less than straight flush': function() {
			assert.isTrue(value('Ac Ah As Jd Ad 5s 2c') < value('8d 7d 6d 5d 4d 4s 4c'));
		},
		'Respect the kicker': function() {
			assert.isTrue(value('Ac Ah As Ad Jd 5s 2c') < value('Ac Ah As Ad Qd 5s 2c'));
		},
	},

	'Straight Flush': {
		'Correct type': function() {
			assert.equal(type('8d 7d 6d 5d 4d 4s 4c'), Hand.Category.STRAIGHT_FLUSH);
		},
		'Less than royal flush': function() {
			assert.isTrue(value('8d 7d 6d 5d 4d 4s 4c') < value('Ac Kc Qc Jc 10c 9c 3c'));
		},
		'Respect the rank': function() {
			assert.isTrue(value('8d 7d 6d 5d 4d 4s 4c') < value('9d 8d 7d 6d 5d 4s 4c'));
		},
	},

	'Royal Flush': {
		'Correct type': function() {
			assert.equal(type('Ac Kc Qc Jc 10c 2h 4d'), Hand.Category.ROYAL_FLUSH);
		},
	},

}).export(module);
