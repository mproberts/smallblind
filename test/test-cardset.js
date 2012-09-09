var vows   = require('vows'),
    should = require('should'),
    assert = require('assert');

var Card    = require('../lib/card'),
    CardSet = require('../lib/cardset');

vows.describe('CardSet').addBatch({
	'Construction': {
		'Empty set': function() {
			var cardset = new CardSet();

			assert.deepEqual(cardset.cards, []);
		},
		'Single card': function() {
			var cardset = new CardSet(Card('2s'));

			assert.deepEqual(cardset.cards, [Card('2s')]);
		},
		'Multiple cards': function() {
			var cardset = new CardSet(Card('2s'), Card('3s'), Card('4s'));

			assert.deepEqual(cardset.cards, [Card('2s'), Card('3s'), Card('4s')]);
		},
		'Array of cards': function() {
			var cardset = new CardSet([Card('2s'), Card('3s'), Card('4s')]);

			assert.deepEqual(cardset.cards, [Card('2s'), Card('3s'), Card('4s')]);
		},
		'Parsed list of cards': function() {
			var cardset = new CardSet('2s', '3s', '4s');

			assert.deepEqual(cardset.cards, [Card('2s'), Card('3s'), Card('4s')]);
		},
		'Constructor as a function': function() {
			assert.isTrue(CardSet('2c') instanceof CardSet);
		}
	},

	'Parsing': {
		'Empty set': function() {
			assert.deepEqual(CardSet.parse(' ').cards, []);
		},
		'Single card': function() {
			assert.deepEqual(CardSet.parse('2c').cards, [Card('2c')]);
		},
		'Multiple cards': function() {
			assert.deepEqual(CardSet.parse('2c 3s').cards, [Card('2c'), Card('3s')]);
		},
	},

	'Stringify': {
		'Single card': function() {
			assert.equal(CardSet.parse('5h').toString(), '5h');
		},
		'Multiple cards': function() {
			assert.equal(CardSet.parse('Ad 6h').toString(), 'Ad 6h');
		},
	},

	'Copying': {
		'Basic copy': function() {
			var cardset = CardSet('2h 3s 4c kd');
			assert.deepEqual(cardset.copy(), cardset);
		},
	},

	'Add Operations': {
		'Add unique card': function() {
			assert.deepEqual(CardSet('2c').add('3c').cards, [Card('2c'), Card('3c')]);
		},
		'Add duplicate card': function() {
			assert.deepEqual(CardSet('2c').add('2c').cards, [Card('2c')]);
		},
		'Multiple card exclusion': function() {
			assert.deepEqual(CardSet('2c 3d 4h 5s').add('2c 3d 4h 5s').cards, [Card('2c'), Card('3d'), Card('4h'), Card('5s')]);
		}
	},

	'Remove Operations': {
		'Remove existing card': function() {
			assert.deepEqual(CardSet('2c 3c').remove('3c').cards, [Card('2c')]);
		},
		'Remove missing card': function() {
			assert.deepEqual(CardSet('2c 3c').remove('4c').cards, [Card('2c'), Card('3c')]);
		},
	},

	'Index Of': {
		'Index for existing card': function() {
			assert.equal(CardSet('2c 3c').indexOf('3c'), 1);
		},
		'Index for missing card': function() {
			assert.equal(CardSet('2c 3c').indexOf('4c'), -1);
		},
	},

	'Equivalence': {
		'Matching': function() {
			assert.isTrue(CardSet('4c 5c 6c').isEquivalent(CardSet('5c 6c 4c')));
		},
		'Not matching': function() {
			assert.isFalse(CardSet('10d 5c 6c').isEquivalent(CardSet('5c 6c 4c')));
		},
		'Subset ': function() {
			assert.isFalse(CardSet('4c 5c 6c').isEquivalent(CardSet('5c 6c')));
		},
		'Shuffled': function() {
			assert.isTrue(CardSet.fullDeck().isEquivalent(CardSet.random(52)));
		},
	},

	'Subsets': {
		'Front-half': function() {
			assert.equal('Qh Jd', CardSet('Qh Jd Ks Ac').subset(0, 2).toString());
		},
		'Rear-half': function() {
			assert.equal('Ks Ac', CardSet('Qh Jd Ks Ac').subset(2, 4).toString());
		},
		'Rear-half without end point': function() {
			assert.equal('Ks Ac', CardSet('Qh Jd Ks Ac').subset(2).toString());
		},
	},

	'Random': {
		'Too many cards': function() {
			CardSet.random.bind(CardSet, 53).should.throwError(/^Maximum/);
		},
		'Full shuffled deck': function() {
			var deck = CardSet.random(52);

			assert.equal(52, deck.cards.length);
		},
		'Full subset of deck': function() {
			var deck = CardSet.random(7);

			assert.equal(7, deck.cards.length);
		},
	},

	'Helpers': {
		'Full deck': function() {
			var cards = '2c 3c 4c 5c 6c 7c 8c 9c 10c Jc Qc Kc Ac '
			          + '2d 3d 4d 5d 6d 7d 8d 9d 10d Jd Qd Kd Ad '
			          + '2h 3h 4h 5h 6h 7h 8h 9h 10h Jh Qh Kh Ah '
			          + '2s 3s 4s 5s 6s 7s 8s 9s 10s Js Qs Ks As ';
			var reference = new CardSet(cards);

			var deck = CardSet.fullDeck();

			assert.deepEqual(deck, reference);
		},
		'Bit string length': function() {
			assert.equal(CardSet.random(52).toBitString().length, 64);
		},
		'Bit string empty': function() {
			var string = CardSet().toBitString();
			var bits = string.split('');
			var ones = 0;

			for (var i in bits) {
				if (bits[i] === '1') {
					++ones;
				}
			}

			assert.equal(string.length, 64);
			assert.equal(ones, 0);
		},
		'Bit string full': function() {
			var string = CardSet.random(52).toBitString();
			var bits = string.split('');
			var ones = 0;

			for (var i in bits) {
				if (bits[i] === '1') {
					++ones;
				}
			}

			assert.equal(string.length, 64);
			assert.equal(ones, 52);
		},
	},
}).run();
