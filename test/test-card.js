var vows   = require('vows'),
    should = require('should'),
    assert = require('assert');

var Card = require('../lib/card');

vows.describe('Card').addBatch({
	'Construction': {
		'2 of spades': function() {
			var card = new Card(2, Card.Suit.SPADES);

			assert.equal(card.rank, 2);
			assert.equal(card.suit, Card.Suit.SPADES);
		},
		'Invalid range for rank': function() {
			Card.bind({}, 1, 1).should.throwError(/^Invalid/);
		},
		'Invalid range for rank (upper)': function() {
			Card.bind({}, 15, 1).should.throwError(/^Invalid/);
		},
		'Invalid range for suit': function() {
			Card.bind({}, 1, 5).should.throwError(/^Invalid/);
		},
	},

	'Parsing': {
		'Face cards': function() {
			assert.equal(Card.parse('As').rank, Card.Rank.ACE);
		},
		'Number cards': function() {
			assert.equal(Card.parse('7h').rank, 7);
		},
		'Double-digit cards': function() {
			assert.equal(Card.parse('10c').rank, 10);
		},
		'Clubs': function() {
			assert.equal(Card.parse('2c').suit, Card.Suit.CLUBS);
		},
		'Hearts': function() {
			assert.equal(Card.parse('3h').suit, Card.Suit.HEARTS);
		},
		'Diamonds': function() {
			assert.equal(Card.parse('4d').suit, Card.Suit.DIAMONDS);
		},
		'Spades': function() {
			assert.equal(Card.parse('5s').suit, Card.Suit.SPADES);
		},
		'Overloaded construtor': function() {
			assert.deepEqual(Card('5d'), Card.parse('5d'));
		}
	},

	'Stringify': {
		'Face cards': function() {
			assert.equal(Card('Qs').toString(), 'Qs');
		},
		'Number cards': function() {
			assert.equal(Card('8h').toString(), '8h');
		},
		'Double-digit cards': function() {
			assert.equal(Card('10d').toString(), '10d');
		},
		'Pretty-printing': function() {
			assert.equal(Card('6d').prettyString(), '6\u2666');
		}
	},
}).run();
