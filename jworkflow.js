// jWorkflow.js
// (c) 2010 tinyHippos inc.
// Underscore is freely distributable under the terms of the MIT license.
// Portions of jWorkflow are inspired by Underscore.js
var jWorkflow = (function () {
    function _valid(func) {
        if (typeof(func) !== 'function') {
            throw "expected function but was " + typeof(func);
        }
    }

    var transfunctioner =  {
        
        order: function (func) {
            var _stack = [],
                _callback;

            _valid(func);
            _stack.push(func),
            _baton = function() {
                var _taken = false; 
                return self = {
                    take: function() {
                        _taken = true;
                    },

                    pass: function() {
                        var result, func;
                        _taken = false;

                        while(_stack.length) {
                            func = _stack.shift();
                            result = func.apply(null, [result, _baton]);
                            if(_baton.taken()) {
                                break;
                            }
                        }

                        if (_stack.length < 1 && _callback) {
                            _callback.apply();
                        }
                    },

                    taken: function() {
                        return _taken;
                    }
                };
            }();

            var self = {

                andThen: function (func) {
                    _valid(func);
                    _stack.push(func);
                    return self;
                },

                start: function (callback) {
                    _callback = callback;
                    _baton.pass();
                }
            };

            return self;

        }
    };

    return transfunctioner;
})();
