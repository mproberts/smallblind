var vows   = require('vows'),
    should = require('should'),
    assert = require('assert');

var CardSet = require('../lib/cardset'),
       Card = require('../lib/card'),
      Table = require('../lib/table');

function countEvents(emitter, name) {
	var fn = function() {
		if (typeof(fn.count) === 'undefined') {
			fn.count = 0;
		}
		fn.count += 1;
	};

	emitter.on(name, fn);

	return fn;
}

vows.describe('Game Flow').addBatch({
	'Dealing': {
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

			var preFlopCount = countEvents(table, 'pre-flop');

			table.nextCards();

			assert.equal(1, preFlopCount.count);

			assert.equal(0, table.community.count());
			assert.equal(2, table.playersInHand[0].hand.count());
			assert.equal(2, table.playersInHand[1].hand.count());
			assert.equal(2, table.playersInHand[2].hand.count());
		},

		'Flop dealt': function(table) {
			table.reset();

			var preFlopCount = countEvents(table, 'pre-flop');
			var flopCount = countEvents(table, 'flop');
			
			table.nextCards();
			table.nextCards();

			assert.equal(1, preFlopCount.count);
			assert.equal(1, flopCount.count);

			assert.equal(3, table.community.count());
			assert.equal(2, table.playersInHand[0].hand.count());
			assert.equal(2, table.playersInHand[1].hand.count());
			assert.equal(2, table.playersInHand[2].hand.count());
		},

		'Turn dealt': function(table) {
			table.reset();

			var preFlopCount = countEvents(table, 'pre-flop');
			var flopCount = countEvents(table, 'flop');
			var turnCount = countEvents(table, 'turn');
			
			table.nextCards();
			table.nextCards();
			table.nextCards();

			assert.equal(1, preFlopCount.count);
			assert.equal(1, flopCount.count);
			assert.equal(1, turnCount.count);

			assert.equal(4, table.community.count());
			assert.equal(2, table.playersInHand[0].hand.count());
			assert.equal(2, table.playersInHand[1].hand.count());
			assert.equal(2, table.playersInHand[2].hand.count());
		},

		'River dealt': function(table) {
			table.reset();

			var preFlopCount = countEvents(table, 'pre-flop');
			var flopCount = countEvents(table, 'flop');
			var turnCount = countEvents(table, 'turn');
			var riverCount = countEvents(table, 'river');
			
			table.nextCards();
			table.nextCards();
			table.nextCards();
			table.nextCards();

			assert.equal(1, preFlopCount.count);
			assert.equal(1, flopCount.count);
			assert.equal(1, turnCount.count);
			assert.equal(1, riverCount.count);

			assert.equal(5, table.community.count());
			assert.equal(2, table.playersInHand[0].hand.count());
			assert.equal(2, table.playersInHand[1].hand.count());
			assert.equal(2, table.playersInHand[2].hand.count());
		},
	}, 'Betting rounds': {
		
	}
}).export(module);
