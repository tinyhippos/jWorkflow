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
                _callback = null,
                _baton = (function () {
                    var _taken = false; 
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
                                if (_taken) {
                                    return;
                                }
                            }

                            if (_tasks.length < 1 && _callback.func) {
                                _callback.func.apply(_callback.context, []);
                            }
                        }
                    };
                }()),
                self = {

                    andThen: function (func, context) {
                        _valid(func);
                        _tasks.push({func: func, context: context});
                        return self;
                    },

                    start: function (callback, context) {
                        _callback = {func: callback, context: context};
                        _baton.pass();
                    }
                };

            return func ? self.andThen(func, context) : self;
        }
    };

    return transfunctioner;
}());
