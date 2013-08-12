(function(){function t(t){if("function"!=typeof t)throw"expected function but was "+typeof t}function n(t){return"function"==typeof t.andThen&&"function"==typeof t.start&&"function"==typeof t.step&&"function"==typeof t.chill}function e(t){return!!t.map&&!!t.reduce}function i(t,n){t._taken&&setTimeout(function(){t.pass(n)},1)}var s=JSFLOW_JWORKFLOW_API_COMPATIBLE_MODE===!0,o={};o.step=function(i,s,o){if(this._finalized)throw Error("flow is already finalized");var r;if(1===arguments.length)s=i,o=null,i=null;else if(2===arguments.length)if("string"!=typeof i){var a=i,f=s;s=a,o=f,i=null}else o=null;if(n(s)){var l=function(t,n){n.take(),s.start(function(t){n.pass(t)},o,t)};r=l}else if(e(s)){var c=function(t,n){n.take();var e=s.length,i=function(){return--e||n.pass()};s.forEach(function(t){jsFlow().andThen(t).start(i)})};r=c}else t(s),r=s;return this._workflow.push({func:r,context:o}),null!==i&&(this._marks[i]=this._workflow.length-1),this},o.andThen=o.step,o.chill=function(t){if(this._finalized)throw Error("flow is already finalized");return this.andThen(function(n,e){e.take(),setTimeout(function(){e.pass(n)},t)})},o.finalize=function(){this._finalized=!0},o.start=function(t,n,e){this._finalized||(this._finalized=!0);var i=Object.create(r),s=!1;if(t&&"object"==typeof t){var o=t;t=o.callback,n=o.context,e=o.initialValue,o.asyncMode&&(s=1==o.asyncMode)}return i._workflow=this._workflow,i._marks=this._marks,i._context=n?n:null,i._callback=t?t:null,i._step=0,i._taken=!1,i._async=s,i.pass(e),i};var r={};r.take=function(){this._taken=!0},r.pass=function(t){if(this._taken=this._async,this._step<this._workflow.length){var n=this._workflow[this._step],e=n.context;e||(e=this._context),this._step+=1,t=n.func.call(e,t,this),this._taken||this.pass(t)}else this._callback&&(this._taken=!1,this._callback.call(this._context,t))},r.reset=function(t){return this._step=0,i(this,t),t},r.revise=function(t){return this._step-=1,i(this,t),t},r.nextStep=function(t,n){if(this._step=this._marks[t],"number"!=typeof this._step)throw Error("unknown mark");return i(this,n),n},r.drop=function(t){return s&&this.take(),this._step=this._workflow.length,i(this,t),t};var a=function(){var t=Object.create(o);return t._workflow=[],t._marks={},t._finalized=!1,t},f={order:function(t,n){var e=a();return t&&e.andThen(t,n),e}};"undefined"!=typeof window?(window.jsFlow=a,s&&(window.jWorkflow=f)):"undefined"!=typeof exports&&(exports.jsFlow=a,exports.jWorkflow=f)})();var jsFlowStateMachine=function(t,n){function e(t,n,e){e.context||(e.context=null),t.step(n,function(t,i){e.onenter&&e.onenter.call(this,t,i),i.state=n},e.context).step(function(t,n){if(n._noTransition=!0,n._taken=!1,e.onevent)e.onevent.call(this,t,n);else{var i=e[t];i&&i.call(this,t,n)}n._noTransition&&e.defaultOutcome&&n.transition(e.defaultOutcome),n._taken=!0,n._noTransition||n.pass()},e.context)}1===arguments.length&&(n=t);for(var i=jsFlow().step(function(t,n){n.transition=function(t){this._noTransition=!1,this.nextStep(t)},n.event=n.pass}),s=0,o=n.length;o>s;s+=2){var r=n[s],a=n[s+1];"function"==typeof a&&(a={onevent:a}),e(i,r,a)}var f=i.start({asyncMode:!0});return f.pass(),f};