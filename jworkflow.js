// jWorkflow.js
// (c) 2010 tinyHippos inc.
// jWorkflow is freely distributable under the terms of the MIT license.
// Portions of jWorkflow are inspired by Underscore.js
var jWorkflow = (function () {
    function _valid(func) {
        if (typeof(func) !== 'function') {
            throw "expected function but was " + typeof(func);
        }
    }

    var transfunctioner =  {
        order: function (func, context) {
            var _tasks = [],
                _callback,
                _baton = (function () {
                    var _taken = false; 
                    _callback = null;
                    return {

                        take: function () {
                            _taken = true;
                        },

                        pass: function () {
                            var result, task;
                            _taken = false;

                            while (_tasks.length) {
                                task = _tasks.shift();
                                result = task.func.apply(task.context, [result, _baton]);
                                if (_baton.taken()) {
                                    return;
                                }
                            }

                            if (_tasks.length < 1 && _callback) {
                                _callback.apply();
                            }
                        },

                        start: function (callback) {
                            _callback = callback;
                            _baton.pass();
                        },

                        taken: function () {
                            return _taken;
                        }
                    };
                }()),
                self = {

                    andThen: function (func, context) {
                        _valid(func);
                        _tasks.push({func: func, context: context});
                        return self;
                    },

                    start: function (callback) {
                        _baton.start(callback);
                    }
                };

            return self.andThen(func, context);
        }
    };

    return transfunctioner;
}());
