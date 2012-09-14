var vows   = require('vows'),
    should = require('should'),
    assert = require('assert');


var CardSet = require('../lib/cardset'),
       Card = require('../lib/card'),
      Table = require('../lib/table');

vows.describe('Game Flow').addBatch({
	'Construction': {
		'Basic': function() {
			var table = new Table();
		}
	}
}).export(module);
