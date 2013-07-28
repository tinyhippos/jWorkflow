var jsFlowStateMachine = function( startState, impl ){
	
	if( arguments.length === 1 ) impl = startState;
	
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