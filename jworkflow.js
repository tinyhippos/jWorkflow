// jWorkflow.js
// (c) 2010 tinyHippos inc.
// Underscore is freely distributable under the terms of the MIT license.
// Portions of jWorkflow are inspired by Underscore.js
var jWorkflow = (function () {
    function _valid(func) {
        if (typeof(func) !== 'function') {
            throw "func must be a function";
        }
    }

    var transfunctioner =  {
        order: function (func) {
            _valid(func);

            var self = {
            
                andThen: function (func) {
                    _valid(func);
                    return self;
                }
            };

            return self;

        },

        start: function (order) {
           //start the order
        }
    };

    return transfunctioner;
})();
