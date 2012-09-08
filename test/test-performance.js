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

var hands = randomHands(10000, 7);

measure(function checkPairsPrimes(hand){
	for (var i = 2; i < 15; ++i) {
		var prime = Card.RankPrimes[i];
		var check = prime * prime;

		for (var j = 2; j <= 4; ++j) {
			check *= prime;

			if (hand.rankPrimes % check === 0) {
			}
		}
	}
}, hands);
