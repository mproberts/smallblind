var vows   = require('vows'),
    should = require('should'),
    assert = require('assert');


var CardSet = require('../lib/cardset'),
       Card = require('../lib/card'),
      Table = require('../lib/table');

vows.describe('Game Flow').addBatch({
	'Setup': {
		topic: function() {
			var table = new Table();

			for (var i = 0; i < 3; ++i) {
				table.addPlayer(i, 10000, i);
			}

			return table;
		}(),

		'Basic': function(table) {
			table.reset();

			assert.equal(0, table.community.count());
			assert.equal(0, table.playersInHand[0].hand.count());
			assert.equal(0, table.playersInHand[1].hand.count());
			assert.equal(0, table.playersInHand[2].hand.count());
		},

		'Hands dealt': function(table) {
			table.reset();

			table.deal();

			assert.equal(0, table.community.count());
			assert.equal(2, table.playersInHand[0].hand.count());
			assert.equal(2, table.playersInHand[1].hand.count());
			assert.equal(2, table.playersInHand[2].hand.count());
		},

		'Flop dealt': function(table) {
			table.reset();

			table.deal();
			table.deal();

			assert.equal(3, table.community.count());
			assert.equal(2, table.playersInHand[0].hand.count());
			assert.equal(2, table.playersInHand[1].hand.count());
			assert.equal(2, table.playersInHand[2].hand.count());
		},

		'Turn dealt': function(table) {
			table.reset();

			table.deal();
			table.deal();
			table.deal();

			assert.equal(4, table.community.count());
			assert.equal(2, table.playersInHand[0].hand.count());
			assert.equal(2, table.playersInHand[1].hand.count());
			assert.equal(2, table.playersInHand[2].hand.count());
		},

		'River dealt': function(table) {
			table.reset();

			table.deal();
			table.deal();
			table.deal();
			table.deal();

			assert.equal(5, table.community.count());
			assert.equal(2, table.playersInHand[0].hand.count());
			assert.equal(2, table.playersInHand[1].hand.count());
			assert.equal(2, table.playersInHand[2].hand.count());
		},
	}
}).export(module);
