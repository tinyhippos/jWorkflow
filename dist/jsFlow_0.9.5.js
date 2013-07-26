// jsFlow is a customized version of jWorkflow.js which adds several functions for asynchron, repeating tasks.
// Furthermore this build...
// 
// (c) 2013 BlackCat [blackcat.myako@gmail.com]
// Released under MIT license
//
(function(){

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

  // -------------------------------------------------------

  var flowAPI = {};
  var batonAPI = {};

  // ### Flow API
  //
  
  flowAPI.step = function( func, context ){
    if( this._finalized ) throw Error("flow is already finalized");
    
    var targetFunc;
    if( arguments.length === 1 ) context = null;
    
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
    
    // grab parameters
    if( callback && typeof callback === 'object' ) {
      var options = callback;
      callback  = options.callback;
      context   = options.context;
      initValue = options.initialValue;
    }
    
    // meta data
    baton._flow     = this;
    baton._context  = (context)? context: null;
    baton._callback = (callback)? callback: null;
    baton._step     = 0;
    baton._taken    = false;
    
    // start flow
    baton.pass( initValue );
  };

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
    this._taken = false;
    
    // first invoke all steps of the workflow
    //
    if( this._step < this._flow._workflow.length ){
      var task = this._flow._workflow[this._step];
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
      this._callback.call( this._context, result );
    }
  };

  // Revises the active step of the flow.
  //
  batonAPI.revise = function( result ){
    this._step -= 1;
    this.pass( result );
  };
  
  // Drops the flow evaluation.
  //
  batonAPI.drop = function( result ){
    this._taken = true;
    this._step  = this._flow._workflow.length;
    
    var that = this;
    setTimeout( 
      function(){ 
        that.pass( result ); 
      },
      1 
    );
  };
    
  // ### Flow Factory
  //
  var factory = function(){
    var flow = Object.create( flowAPI );

    flow._workflow = [];
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
		if( JSFLOW_JWORKFLOW_API_COMPATIBLE_MODE ) window.jWorkflow 	= jWorkflowWrapper;
	}
	// **NodeJS** export
	else if( typeof exports !== "undefined" ){
		exports.jsFlow    = factory;
		exports.jWorkflow = jWorkflowWrapper;
	}

})();