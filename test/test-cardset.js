var vows   = require('vows'),
    should = require('should'),
    assert = require('assert');

var Card    = require('../lib/card'),
    CardSet = require('../lib/cardset');

vows.describe('CardSet').addBatch({
	'Construction': {
		'Single card': function() {
			var cardset = new CardSet(Card('2s'));

			assert.deepEqual(cardset.cards, [Card('2s')]);
		},
	},
}).run();
