var vows   = require('vows'),
    should = require('should'),
    assert = require('assert');

var stated = require('../lib/stated');

vows.describe('Stated').addBatch({

	'Setup': {
		topic: new stated.FSM()
				.from('red').to('green').when('ready')
				.from('green').to('yellow').when('stop')
				.from('yellow').to('red').when('timeout')
				.move('green'),

		'States created': function(fsm) {
			assert.isTrue(fsm.has('green'));
			assert.isTrue(fsm.has('yellow'));
			assert.isTrue(fsm.has('red'));
		},
		'Transition if exists': function(fsm) {
			fsm.move('green');

			assert.isTrue(fsm.is('green'));

			fsm.next('stop');
			assert.isTrue(fsm.is('yellow'));

			fsm.next('timeout');
			assert.isTrue(fsm.is('red'));
		}, 
		'Do not transition if does not exist': function(fsm) {
			fsm.move('green');

			assert.isTrue(fsm.is('green'));

			fsm.next('ready');
			assert.isTrue(fsm.is('green'));

			fsm.next('timeout');
			assert.isTrue(fsm.is('green'));
		}, 
	}
}).export(module);
