#!/usr/bin/node

var Card      = require('./lib/card'),
    CardSet   = require('./lib/cardset'),
    Hand      = require('./lib/hand'),
    Evaluator = require('./lib/naive-evaluator');

var TRIALS = 1000;
var pockets = process.argv.slice(2);
var typeBuckets = [];
var winSplit = [];

// parse the pocket cards from the command line
for (var i = 0; i < pockets.length; ++i) {
	pockets[i] = CardSet.parse(pockets[i]);
}

// initialize the tracking variables
for (var h = 0; h < pockets.length; ++h) {
	typeBuckets[h] = [];
	winSplit[h] = 0;
	
	for (var i = 0; i < 10; ++i) {
		typeBuckets[h][i] = 0;
	}
}

for (var i = 0; i < TRIALS; ++i) {
	// generate the shared cards
	var community = CardSet.random(5);
	var hands = [];
	var values = [];

	for (var h = 0; h < pockets.length; ++h) {
		var handType;

		hands[h] = pockets[h].copy().addAll(community);
		values[h] = Evaluator.evaluate(hands[h]);
		handType = Evaluator.handType(values[h]);

		// track the hand type for the report
		typeBuckets[h][handType]++;
	}

	var highHand = 0;

	// track the player(s) with the high hand(s)
	for (var h = 0; h < pockets.length; ++h) {
		highHand = Math.max(highHand, values[h]);
	}

	for (var h = 0; h < pockets.length; ++h) {
		if (values[h] === highHand) {
			winSplit[h]++;
		}
	}
}

// generate pretty output
var line = '\t';

for (var h = 0; h < pockets.length; ++h) {
	line = line + '\t' + pockets[h].prettyString();
}

console.log(line);

line = 'Win/Split';
for (var h = 0; h < pockets.length; ++h) {
	line = line + '\t' + Math.round(10000*winSplit[h]/TRIALS)/100 + '%';
}

console.log(line);
console.log();

for (var i = 9; i >= 0; --i) {
	line = Hand.CategoryNames[i];

	if (line.length < 8) {
		line += '\t';
	}

	for (var h = 0; h < pockets.length; ++h) {
		line = line + '\t' + Math.round(10000*typeBuckets[h][i]/TRIALS)/100 + '%';
	}

	console.log(line);
}
