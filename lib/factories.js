var jsFlowStateMachine = function( startState, impl, context ){
	
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
		
		if( oldErr["*"] ) customErr.onevent = oldErr.onevent;
		else if( oldErr.defaultOutcome ) customErr.defaultOutcome = oldErr.defaultOutcome;
			else customErr["*"] = function( data, trs ){
				console.error( "being in error state, move manually out by transition(to);" );
			};
		
		impl[errInd+1] = customErr;
	}
	else{
		impl.push( "ERROR",{
			onenter: function( msg ){
				console.error( msg );
			},
			"*": function( data, trs ){
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
			
			var ev = impl[p];
			if( ev ){
				ev.call(this, p, b );
			}
			else if( impl["*"] ){ // FALLBACK
				impl["*"].call(this, p, b );
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
		
		b.sendIntoState = function( to ){
			this.transition(to);
			this.pass();
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
	if( arguments.length < 3 ) context = null;
	var instance = flow.start({ 
		asyncMode:true, 
		context: context 
	});
	instance.pass();
	
	return instance;
};