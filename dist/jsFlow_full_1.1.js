// jsFlow is a customized version of jWorkflow.js which adds several functions for asynchron, repeating tasks.
// Furthermore this build...
// 
// (c) 2013 BlackCat [blackcat.myako@gmail.com]
// Released under MIT license
//
(function(){

  var jwfMode = ( window && window.JSFLOW_JWORKFLOW_API_COMPATIBLE_MODE === true );

  function isFunction( func ){
    if( typeof(func) !== 'function' ) throw "expected function but was " + typeof(func);
  }

  function isWorkflow( func ){
    return  typeof func.andThen === 'function' &&
						typeof func.start   === 'function' &&
						typeof func.step    === 'function' &&
						typeof func.chill   === 'function';
  }

  function isArray( func ){
    return !!func.map && !!func.reduce;
  }
  
  // ---
  
  var flowAPI = {};

  // ### Flow API
  //
  
  flowAPI.step = function( name, func, context ){
    if( this._finalized ) throw Error("flow is already finalized");
    
    var targetFunc;
    if( arguments.length === 1 ){
			func 		= name;
			context = null;
			name 		= null;
		}
    else if( arguments.length === 2 ){
			if( typeof name !== "string" ){
				var rFn  = name;
				var rCtx = func;
				
				func 		= rFn;
				context = rCtx;
				name 		= null;
			}
			else context = null;
		}
    
    // starting a sub flow ?
    if( isWorkflow( func ) ) {
      var f = function( prev, baton ){
        baton.take();
        func.start(
          function( result ){
            baton.pass( result );
          },
          context,
          prev
        );
      };
      
      targetFunc = f;
    }
    
    // starting a parallel task ?
    else if( isArray( func ) ) {
      var orch = function( prev, baton ){
        baton.take();

        var l = func.length,
          join = function(){
          return --l || baton.pass();
        };

        func.forEach( function( f ){
          jsFlow().andThen( f ).start( join );
        } );
      };
      
      targetFunc = orch;
    }
    
    // plain function
    else {
      isFunction(func);
      targetFunc = func;
    }
		
    // append function to the flow
    this._workflow.push({ func: targetFunc, context: context });
    
		// register mark
		if( name !== null ){
			this._marks[name] = this._workflow.length-1;
		}
      
    return this;
  };
  
  // symbolic link for API.step( fn );
  //
  flowAPI.andThen = flowAPI.step;
  
  // Pauses the execution of the flow for a given time. The `time` arguments controls the time in milliseconds
  // that will be paused.
  //
  flowAPI.chill = function( time ){
    if( this._finalized ) throw Error("flow is already finalized");
    
    return this.andThen( 
      function( prev, baton ){
        baton.take();
        setTimeout( 
          function(){
            baton.pass( prev );
          },
          time
        );
      }
    );
  };
  
  flowAPI.finalize = function(){
    this._finalized = true;
  };
  
  // Starts the flow 
  //
  flowAPI.start = function( callback, context, initValue ){
    
    // finalize flow if is not final yet
    if( !this._finalized ) this._finalized = true;
    
    var baton = Object.create( batonAPI );
    var async = false;
		
    // grab parameters
    if( callback && typeof callback === 'object' ) {
      var options = callback;
      callback  = options.callback;
      context   = options.context;
      initValue = options.initialValue;
      if( options.asyncMode ) async = ( options.asyncMode == true );
    }
    
    // meta data
    baton._workflow = this._workflow;
    baton._marks 		= this._marks;
    baton._context  = (context)? context: null;
    baton._callback = (callback)? callback: null;
    baton._step     = 0;
    baton._taken    = false;
		baton._async		= async;
    
    // start flow
    baton.pass( initValue );
		
		return baton;
  };
  
  // --- 
  
  var batonAPI = {};

  // ### Baton API 
  //

  // Places a lock on the flow evaluation.
  //
  batonAPI.take = function(){
    this._taken = true;
  };

  // Removes a lock from the flow evaluation and starts the next step of the flow.
  //
  batonAPI.pass = function( result ){
		
		// false in sync mode     --> execution does not stop after step is done
		// true in asynchron mode --> execution stops after step is done
    this._taken = this._async; 
    
    // first invoke all steps of the workflow
    //
    if( this._step < this._workflow.length ){
      var task = this._workflow[this._step];
      var ctx  = task.context;
      
      // take baton context if flow step hasn't an own context
      if( !ctx ) ctx = this._context;
      
      // increase step for next pass 
      this._step += 1;
      
      // invoke flow step function
      result = task.func.call( ctx, result, this );
      
      // if baton is taken then its an asynchron process 
      // and next step will be invoked by the flow step function
      if( !this._taken ) this.pass( result );
    }
    // invoke the end callback when all flow steps are invoked
    //
    else if( this._callback ) {
      this._taken = false; // if `reset` will be called after the execution
      this._callback.call( this._context, result );
    }
  };
  
  function checkAsync( baton, result ){
    if( baton._taken ){
      setTimeout( 
        function(){
          baton.pass( result ); 
        },1 
      );
    }
  };
  
  // Resets the workflow to the start.
  //
  batonAPI.reset = function( result ){
    this._step = 0;
    checkAsync( this, result );
		return result;
  }

  // Marks this step as active for the next step of the evaluation. This
  // only marks the step for the evaluation and does not forces the flow 
  // into asynchron mode.
  //
  batonAPI.revise = function( result ){
    this._step -= 1;
    checkAsync( this, result );
		return result;
  };
	
	// Resets the workflow to the step with a given name.
  //
	batonAPI.nextStep = function( name, result ){
		this._step = this._marks[name];
		if( typeof this._step !== 'number' ) throw Error("unknown mark");
		
    checkAsync( this, result );
		return result;
	};
  
  // Stops the evaluation of the next steps and jumps automatically
  // to the finalizer callback when the current steps ends. Note this
  // function does not forces the flow into asynchron mode.
  //
  batonAPI.drop = function( result ){
    if( jwfMode ) this.take(); // `jWorkflow` compatibility mode
    
    this._step  = this._workflow.length;
    checkAsync( this, result );
		return result;
  };
   
  // ---
    
  // ### Flow Factory
  //
  var factory = function(){
    var flow = Object.create( flowAPI );

    flow._workflow  = [];
		flow._marks			= {};
    flow._finalized = false;

    return flow;
  };
    
	// ### jWorkflow API Compatibility
	//
	var jWorkflowWrapper = {
		order: function( func, context ){
			var flow = factory();
			if( func ) flow.andThen( func, context );
			return flow;
		}
	};
	
	// **Browser** export
	if( typeof window !== "undefined" ){
		window.jsFlow = factory;
		
		// Place jWorkflow variable with order function to create a flow instance. This only happens when the 
		// executing environment is a browser and the `JSFLOW_JWORKFLOW_API_COMPATIBLE_MODE` variable resolves
		// to true. 
		//
		if( jwfMode ) window.jWorkflow 	= jWorkflowWrapper;
	}
	// **NodeJS** export
	else if( typeof exports !== "undefined" ){
		exports.jsFlow    = factory;
		exports.jWorkflow = jWorkflowWrapper;
	}

})();
var jsFlowStateMachine = function( startState, impl ){
	
	if( arguments.length === 1 ) impl = startState;
	
	var errCtx = {
		msg: null
	};
	
	var errInd = impl.indexOf("ERROR");
	if( errInd !== -1 ){
		var oldErr = impl[errInd+1];
		var customErr = {};
		
		customErr.onenter = function(){
				oldErr.onenter( errCtx );
				errCtx.msg = null;
		};
		
		if( oldErr.onevent ) customErr.onevent = oldErr.onevent;
		else if( oldErr.defaultOutcome ) customErr.defaultOutcome = oldErr.defaultOutcome;
		else customErr.onevent = function( data, trs ){
				console.error( "being in error state, move manually out by transition(to);" );
		};
		
		impl[errInd+1] = customErr;
	}
	else{
		impl.push( "ERROR",{
			onenter: function( msg ){
				console.error( msg );
			},
			onevent: function( data, trs ){
				console.error( "being in error state, move manually out by transition(to);" );
			}
		});
	}
	
	function createComplexState( flow, state, impl ){
		if( !impl.context ) impl.context = null;
		
		flow.step( state, function( p, b ){ // ENTER
					if( impl.onenter ){
						impl.onenter.call(this, p, b );
					}
					b.state = state;
				}, impl.context )
				.step( function( p, b ){ // BODY
					b._noTransition = true;
					b._taken = false;
					
					if( impl.onevent ){
						impl.onevent.call(this, p,b );
					}
					else {
						var ev = impl[p];
						if( ev ){
							ev.call(this, p, b );
						}
						else if( impl["*"] ){ // FALLBACK
							impl["*"].call(this, p, b );
						}
					}
					
					if( b._noTransition && impl.defaultOutcome ){						
						b.transition( impl.defaultOutcome );
					}
					
					b._taken = true;
					if( !b._noTransition ){
						b.pass();
					}
					
				}, impl.context );
	}
	
	// Create flow description object
	var flow = jsFlow()
		.step(function( p, b ){
			b.transition = function( to ){
				this._noTransition = false;
				this.nextStep( to );
			}
			
			b.error = function( msg ){
				b.transition("ERROR");
				errCtx.msg = msg;
			};
				
			b.event = b.pass;
		});
		
	// Fill state machine description into flow
	for( var i=0,e=impl.length; i<e; i+=2 ){
		var state 		= impl[i];
		var stateImpl = impl[i+1];
		
		if( typeof stateImpl === 'function' ) stateImpl = { onevent:stateImpl };
		
		createComplexState( flow, state, stateImpl );
	}
	
	// Create flow instance
	var instance = flow.start({ asyncMode:true });
	instance.pass();
	
	return instance;
};