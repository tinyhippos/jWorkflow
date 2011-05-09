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
            var _workflow = [],
                _tasks,
                _callback = null,
                _baton = (function () {
                    var _taken = false; 
                    return {

                        take: function () {
                            _taken = true;
                        },

                        pass: function (result) {
                            var task;
                            _taken = false;

                            if (_tasks.length) {
                                task = _tasks.shift();
                                result = task.func.apply(task.context, [result, _baton]);

                                if (!_taken) {
                                    _baton.pass(result);
                                }
                            }
                            else { 
                                if (_callback.func) {
                                    _callback.func.apply(_callback.context, [result]);
                                }
                            }
                        }
                    };
                }()),
                _self = {

                    andThen: function (func, context) {
                        if (typeof func.andThen === 'function' &&
                            typeof func.start === 'function' &&
                            typeof func.chill === 'function') {

                            var f = function (prev, baton) {
                                baton.take();
                                func.start(function (result) {
                                    baton.pass(result);
                                }, context, prev);
                            };

                            _workflow.push({func: f, context: context});

                        }
                        else {
                            _valid(func);
                            _workflow.push({func: func, context: context});
                        }
                        return _self;
                    },

                    chill: function (time) {
                        return _self.andThen(function (prev, baton) {
                            baton.take();
                            setTimeout(function () {
                                baton.pass(prev);
                            }, time);
                        });
                    },

                    start: function () {
                        var callback,
                            context,
                            initialValue;

                        if (arguments[0] && typeof arguments[0] === 'object') {
                            callback = arguments[0].callback;
                            context = arguments[0].context;
                            initialValue = arguments[0].initialValue;
                        }
                        else {
                            callback = arguments[0];
                            context = arguments[1];
                        }

                        _callback = {func: callback, context: context};
                        _tasks = _workflow.slice();
                        _baton.pass(initialValue);
                    }
                };

            return func ? _self.andThen(func, context) : _self;
        }
    };

    return transfunctioner;
}());

if (typeof module === "object" && typeof require === "function") {
    module.exports = jWorkflow;
}
