var Card    = require('../lib/card'),
    CardSet = require('../lib/cardset');

function measure(fn, samples) {
	var start = process.hrtime(), end;

	if (typeof(samples) !== 'undefined') {
		for (var i = 0, l = samples.length; i < l; ++i) {
			fn.call(global, samples[i]);
		}
	} else {
		fn.call(global);
	}

	end = process.hrtime();

	var secs = end[0] - start[0];
	var nanos = end[1] - start[1];

	var diff = secs + (nanos / 1000000000.0);

	console.log(fn.name + ': ' + diff);
}

function randomHands(count, handSize) {
	var hands = [];

	if (typeof(handSize) === 'undefined') {
		handSize = 7;
	}

	for (var i = 0; i < count; ++i) {
		hands.push(CardSet.random(handSize));
	}

	return hands;
}

var hands;

measure(function generateHands(hand){
	hands = randomHands(10000, 7);
});

var ranks = [];
var suits = [];

for (var i = 1; i <= 14; ++i) {
	ranks[i] = {rank: i, count: 0, cards: []};
}

for (var i = 0; i < 4; ++i) {
	suits[i] = {suit: i, count: 0, cards: []};
}

measure(function histograms(hand){
	var cards = hand.cards;

	// ace-to-ace
	for (var i = 1; i <= 14; ++i) {
		ranks[i].cards = [];
		ranks[i].count = 0;
	}
	
	for (var i = 0; i < 4; ++i) {
		suits[i].cards = [];
		suits[i].count = 0;
	}
	
	for (var i = 0, l = cards.length; i < l; ++i) {
		var card = cards[i];
		var r = card.rank;
		var s = card.suit;

		++ranks[r].count;
		ranks[r].cards.push(i);

		++suits[s].count;
		suits[s].cards.push(i);
	}

	// fancy high-low ace
	ranks[1] = ranks[14];
}, hands);
