(function(){function t(t){if("function"!=typeof t)throw"expected function but was "+typeof t}function n(t){return"function"==typeof t.andThen&&"function"==typeof t.start&&"function"==typeof t.step&&"function"==typeof t.chill}function i(t){return!!t.map&&!!t.reduce}var e={},o={};e.step=function(e,o){if(this._finalized)throw Error("flow is already finalized");var s;if(1===arguments.length&&(o=null),n(e)){var f=function(t,n){n.take(),e.start(function(t){n.pass(t)},o,t)};s=f}else if(i(e)){var a=function(t,n){n.take();var i=e.length,o=function(){return--i||n.pass()};e.forEach(function(t){jsFlow().andThen(t).start(o)})};s=a}else t(e),s=e;return this._workflow.push({func:s,context:o}),this},e.andThen=e.step,e.chill=function(t){if(this._finalized)throw Error("flow is already finalized");return this.andThen(function(n,i){i.take(),setTimeout(function(){i.pass(n)},t)})},e.finalize=function(){this._finalized=!0},e.start=function(t,n,i){this._finalized||(this._finalized=!0);var e=Object.create(o);if(t&&"object"==typeof t){var s=t;t=s.callback,n=s.context,i=s.initialValue}e._flow=this,e._context=n?n:null,e._callback=t?t:null,e._step=0,e._taken=!1,e.pass(i)},o.take=function(){this._taken=!0},o.pass=function(t){if(this._taken=!1,this._step<this._flow._workflow.length){var n=this._flow._workflow[this._step],i=n.context;i||(i=this._context),this._step+=1,t=n.func.call(i,t,this),this._taken||this.pass(t)}else this._callback&&this._callback.call(this._context,t)},o.revise=function(t){this._step-=1,this.pass(t)},o.drop=function(t){this._taken=!0,this._step=this._flow._workflow.length;var n=this;setTimeout(function(){n.pass(t)},1)};var s=function(){var t=Object.create(e);return t._workflow=[],t._finalized=!1,t},f={order:function(t,n){var i=s();return t&&i.andThen(t,n),i}};"undefined"!=typeof window?(window.jsFlow=s,JSFLOW_JWORKFLOW_API_COMPATIBLE_MODE&&(window.jWorkflow=f)):"undefined"!=typeof exports&&(exports.jsFlow=s,exports.jWorkflow=f)})();