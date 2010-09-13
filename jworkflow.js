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
            var _stack = [];
            _valid(func);
            _stack.push(func);

            var self = {

                andThen: function (func) {
                    _valid(func);
                    _stack.push(func);
                    return self;
                },

                start: function () {
                    while(_stack.length) {
                        var func = _stack.shift();
                        func.apply();
                    }

                }
            };

            return self;

        }
    };

    return transfunctioner;
})();
