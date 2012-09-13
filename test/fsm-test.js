var vows   = require('vows'),
    should = require('should'),
    assert = require('assert');

var fsm = require('../lib/fsm');

vows.describe('fsm').addBatch({

	'Setup': {
		topic: fsm()
			.transition('red', 'green').when('ready')
			.transition('green', 'yellow').when('stop')
			.transition('yellow', 'red').when('timeout')
			.set('green'),

		'States created': function(lights) {
			assert.isTrue(lights.has('green'));
			assert.isTrue(lights.has('yellow'));
			assert.isTrue(lights.has('red'));
		},
		'Transition if exists': function(lights) {
			lights.set('green');

			assert.isTrue(lights.is('green'));

			lights.stop();
			assert.isTrue(lights.is('yellow'));

			lights.timeout();
			assert.isTrue(lights.is('red'));
		}, 
		'Do not transition if does not exist': function(lights) {
			lights.set('green');

			assert.isTrue(lights.is('green'));

			lights.ready();
			assert.isTrue(lights.is('green'));

			lights.timeout();
			assert.isTrue(lights.is('green'));
		},
		'State events sent': function(lights) {
			var args = null;

			// bind to the transition event
			lights.on('state-yellow', function() {
				args = Array.prototype.slice.apply(arguments);
			});

			lights.set('green');

			lights.stop(1, 2, 3);

			assert.isTrue(lights.is('yellow'));
			assert.deepEqual(args, ['stop', 1, 2, 3]);
		}
	}
}).export(module);
