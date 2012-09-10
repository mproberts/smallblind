var Card    = require('../lib/card'),
    CardSet = require('../lib/cardset'),
    Evaluator = require('../lib/naive-evaluator');

var HAND_COUNT = 20000;

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

	return diff;
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

var hands, time, results = Evaluator.measurements;

// generate
console.log('Generating ' + HAND_COUNT + ' hands...');

time = measure(function generateHands(hand){
	hands = randomHands(HAND_COUNT, 7);
});

console.log('Took ' + Math.round(time*1000)/1000 + ' seconds\n');

// evaluate
console.log('Evaluating ' + HAND_COUNT + ' hands...');

time = measure(function evaluate(hand) {
	var value = Evaluator.evaluate(hand);
}, hands);

console.log('Took ' + Math.round(time*1000)/1000 + ' seconds, ~' + Math.round(HAND_COUNT / time) + ' hands per second\n');

if (results) {
	// print times
	console.log('Method\t\tCalls\tTotal (ms)\tAvg (ms)');
	console.log('--------------------------------------------------');

	for (var name in results) {
		if (!results.hasOwnProperty(name)) {
			continue;
		}

		var times = results[name];

		var min = 1000000;
		var max = 0;
		var avg = 0;
		var total = 0;

		for (var i in times) {
			var t = times[i];

			min = Math.min(min, t);
			max = Math.max(max, t);
			total += t;
		}

		avg = times.length === 0 ? 0 : total / times.length;
		total = Math.round(total * 1000000) / 1000;
		avg = Math.round(avg * 10000000) / 10000;

		console.log(name + '\t' + times.length + '\t' + total + '\t\t' + avg);
	}
}
