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

measure(function checkPairsPrimes(hand){
}, hands);
