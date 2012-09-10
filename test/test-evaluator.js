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
	},

	'Two Pair': {
		'Correct type': function() {
			assert.equal(type('Ac Ah Js Jd 7d 5s 2c'), Hand.Category.TWO_PAIR);
		},
		'Less than three of a kind': function() {
			assert.isTrue(value('Ac Ah Js Jd 7d 5s 2c') < value('7c 7h Js 9d 7d 5s 2c'));
		},
	},
	
	'Three of a Kind': {
		'Correct type': function() {
			assert.equal(type('7c 7h Js 9d 7d 5s 2c'), Hand.Category.THREE_OF_A_KIND);
		},
		'Less than three of a kind': function() {
			assert.isTrue(value('Ac Ah Js Jd 7d 5s 2c') < value('7c 7h Js Jd 7d 5s 2c'));
		},
	},

	'Straight': {
		'Correct type': function() {
			assert.equal(type('8h 7h 6s 5d 4d 4s 4c'), Hand.Category.STRAIGHT);
		},
		'Less than flush': function() {
			assert.isTrue(value('8h 7h 6s 5d 4d 4s 4c') < value('4c 5c 9c 10c Kc 2d 4h'));
		},
	},

	'Flush': {
		'Correct type': function() {
			assert.equal(type('4c 5c 9c 10c Kc 2d 4h'), Hand.Category.FLUSH);
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
	},

	'Four of a Kind': {
		'Correct type': function() {
			assert.equal(type('Ac Ah As Jd Ad 5s 2c'), Hand.Category.FOUR_OF_A_KIND);
		},
		'Less than straight flush': function() {
			assert.isTrue(value('Ac Ah As Jd Ad 5s 2c') < value('8d 7d 6d 5d 4d 4s 4c'));
		},
	},

	'Straight Flush': {
		'Correct type': function() {
			assert.equal(type('8d 7d 6d 5d 4d 4s 4c'), Hand.Category.STRAIGHT_FLUSH);
		},
		'Less than royal flush': function() {
			//assert.isTrue(value('8d 7d 6d 5d 4d 4s 4c') < value('Ac Kc Qc Jc 10c 9c 3c'));
		},
	},

	'Royal Flush': {
		'Correct type': function() {
			console.log('---')
			assert.equal(type('Ac Kc Qc Jc 10c 2h 4d'), Hand.Category.ROYAL_FLUSH);
		},
	},

}).export(module);
