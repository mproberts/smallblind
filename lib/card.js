/**
 * Parse a formatted card string into a card object
 *
 * @param {Number|String} rank 
 * @param {Number} suit
 *
 * @return {Card} a card object
 * @api public
 */
function Card(rank, suit) {
	var result = this;

	if (!(result instanceof Card)) {
		return new Card(rank, suit);
	}

	if (rank === ''+rank) {
		// use parse routine if the rank is actually a card string
		result = Card.parse(rank);
	} else {
		if (typeof(rank) !== 'number' || rank < 2 || rank > 14) {
		 	throw new Error('Invalid card rank, must be >1 and <15');
		}

		if (typeof(suit) !== 'number' || suit > 3) {
		 	throw new Error('Invalid suit value, must be <4');
		}

		result.rank = rank;
		result.suit = suit;

		result.rankPrime = Card.RankPrimes[rank];
		result.suitPrime = Card.SuitPrimes[suit];
		
		result.lowBits  = Card.Masks.lowBits[suit][rank];
		result.highBits = Card.Masks.highBits[suit][rank];
	}

	return result;
};

// export
module.exports = exports.Card = Card;

Card.Suit = {
	'CLUBS'    : 0,
	'DIAMONDS' : 1,
	'HEARTS'   : 2,
	'SPADES'   : 3,
};

Card.Rank = {
	'2'     : 2,
	'3'     : 3,
	'4'     : 4,
	'5'     : 5,
	'6'     : 6,
	'7'     : 7,
	'8'     : 8,
	'9'     : 9,
	'10'    : 10,
	'JACK'  : 11,
	'QUEEN' : 12,
	'KING'  : 13,
	'ACE'   : 14
};

Card.Masks = computeMasks();

Card.RankPrimes = [, , 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41];

Card.SuitPrimes = [43,	47, 53, 59];

function computeMasks() {
	var lowBits = [];
	var highBits = [];

	for (var suit = 0; suit < 4; ++suit) {
		var lowByRank = lowBits[suit] = [];
		var highByRank = highBits[suit] = [];
		
		// the shift within the bit range for the suit
		var suitShift = suit % 2 == 0 ? 0 : 13;

		if (suit > 1) {
			suitShift += 26;
		}

		for (var rank = 2; rank < 15; ++rank) {
			var shift = (suitShift + rank - 2);
			
			lowByRank[rank]  = 0x0;
			highByRank[rank] = 0x0;

			if (shift < 31) {
				lowByRank[rank] = 0x1 << shift;
			} else {
				highByRank[rank] = 0x1 << (shift-31);
			}
		}
	}

	return {lowBits: lowBits, highBits: highBits};
};

/**
 * Return a random card
 *
 * @return {Card} a random card object
 * @api public
 */
Card.random = function() {
	var rank = Math.round(Math.random() * 12 + 2);
	var suit = Math.round(Math.random() * 3);
	
	return new Card(rank, suit);
}

/**
 * Parse a formatted card string into a card object
 *
 * @param {String} formatted
 *
 * @return {Card} a card object
 * @api public
 */
Card.parse = function(formatted) {
	var matched = formatted.match(/([0-9]{1,2}|[AKQJ])([cdhs])/);

	if (!matched) {
		throw new Error('Invalid card format');
	}

	var rank = parseInt(matched[1]);
	var suit = Card.Suit.CLUBS;

	if (isNaN(rank)) {
		switch (matched[1]) {
			case 'A':
				rank = Card.Rank.ACE;
				break;
			case 'K':
				rank = Card.Rank.KING;
				break;
			case 'Q':
				rank = Card.Rank.QUEEN;
				break;
			case 'J':
				rank = Card.Rank.JACK;
				break;
			default:
				throw new Error('Invalid rank ' + matched[1]);
				break;
		}
	}

	switch (matched[2]) {
		case 'c':
			suit = Card.Suit.CLUBS;
			break;
		case 'd':
			suit = Card.Suit.DIAMONDS;
			break;
		case 'h':
			suit = Card.Suit.HEARTS;
			break;
		case 's':
			suit = Card.Suit.SPADES;
			break;
		default:
			throw new Error('Invalid suit ' + matched[2]);
			break;
	}

	return new Card(rank, suit);
};

function toString(suitSymbols) {
	var rankString, suitString;

	switch (this.rank) {
		// royalty
		case Card.Rank.ACE:
			rankString = 'A';
			break;
		case Card.Rank.KING:
			rankString = 'K';
			break;
		case Card.Rank.QUEEN:
			rankString = 'Q';
			break;
		case Card.Rank.JACK:
			rankString = 'J';
			break;
		// numeric default
		default:
			rankString = ''+this.rank;
			break;
	}

	switch (this.suit) {
		case Card.Suit.CLUBS:
			suitString = suitSymbols[0];
			break;
		case Card.Suit.DIAMONDS:
			suitString = suitSymbols[1];
			break;
		case Card.Suit.HEARTS:
			suitString = suitSymbols[2];
			break;
		case Card.Suit.SPADES:
			suitString = suitSymbols[3];
			break;
	}

	return [rankString, suitString].join('');
};

/**
 * Pretty print the card for display
 *
 * @return {String} card formatted for display
 * @api public
 */
Card.prototype.prettyString = function() {
	return toString.call(this, [
		'\u2663',   // clubs
		'\u2666',   // diamonds
		'\u2665',   // hearts
		'\u2660']); // spades
};

/**
 * Format the card for standard consumption
 *
 * @return {String} card formatted according to the parse rules
 * @api public
 */
Card.prototype.toString = function() {
	return toString.call(this, [
		'c',   // clubs
		'd',   // diamonds
		'h',   // hearts
		's']); // spades
};
