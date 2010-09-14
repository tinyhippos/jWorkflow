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
        
        order: function (func) {
            var _queue = [],
                _callback,
                _baton = (function() {
                    var _taken = false; 
                    var _callback = null;
                    return {

                        take: function() {
                            _taken = true;
                        },

                        pass: function() {
                            var result, func;
                            _taken = false;

                            while(_queue.length) {
                                func = _queue.shift();
                                result = func.apply(null, [result, _baton]);
                                if(_baton.taken()) {
                                    return;
                                }
                            }

                            if (_queue.length < 1 && _callback) {
                                _callback.apply();
                            }
                        },

                        start: function(callback) {
                            _callback = callback;
                            _baton.pass();
                        },

                        taken: function() {
                            return _taken;
                        }
                    };
                }()),
                self = {

                    andThen: function (func) {
                        _valid(func);
                        _queue.push(func);
                        return self;
                    },

                    start: function (callback) {
                        _baton.start(callback);
                    }
                };

                return self.andThen(func);
        }
    };

    return transfunctioner;
})();
