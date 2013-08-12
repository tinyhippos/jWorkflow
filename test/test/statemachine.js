module( "jsFlow marked states tests" );


test( "test statemachine factory helper", function(){
	
	var stateB_Data = {
		x:0
	};
	
	var i = 0;
	
	var statemachine = jsFlowStateMachine([
		"INIT",{
			defaultOutcome: "STATE_A",
			onenter: function( p,b ){
				// ...
			}
		},
		
		"STATE_A", {
			
			onenter:function(){
				i++;
			},
			
			"true": function( p,b ){ 
				b.transition("STATE_C"); 
			},
			
			"false": function( p,b ){ 
				b.transition("STATE_B"); 
			},
			
			"*": function( p,b ){
				b.error(i);
			}
		},
		
		"STATE_B", {
			context: stateB_Data,
			"*":function( p,b ){
				this.x++;
				
				// CALLS STATE_C DIRECTLY AS ACTION STATE
				b.transition("STATE_C");
				b.pass();
			}
		},
		
		"STATE_C", {
			onenter:function(){
				i++;
			},
			defaultOutcome: "STATE_A",
			"*": function( ev,b ){
				// ...
			}
		},
		
		"ERROR", {
			defaultOutcome: "STATE_A",
			onenter: function( err ){
				i = err.msg + 1;
			}
		}
	]);
	
	equal( i , 0, "i should be 0 before STATE_A" );
	statemachine.event();
	equal( statemachine.state , "STATE_A", "state should be STATE_A after start" );
	equal( i , 1, "i should be 1 in STATE_A" );
	
	statemachine.event( true );
	equal( i , 2, "i should be 2 after STATE_C" );
	equal( statemachine.state , "STATE_C", "state should be STATE_C after event with data true" );
	
	statemachine.event();
	equal( statemachine.state , "STATE_A", "state should be STATE_A after event in STATE_C" );
	equal( i , 3, "i should be 3 in STATE_A" );
	
	statemachine.event(false);
	equal( statemachine.state , "STATE_B", "state should be STATE_B after event in STATE_A" );
	equal( i , 3, "i should be 3 in STATE_B" );
	
	statemachine.event();
	
	equal( stateB_Data.x , 1, "property x of STATE_B data should be 1 now" );
	equal( statemachine.state , "STATE_A", "state should be STATE_A after event in STATE_B because STATE_C called by STATE_B as action state" );
	equal( i , 5, "i should be 5 in STATE_A because of STATE_A and STATE_C, which was called by STATE_B as action state" );
	
	statemachine.event( "unknownEvent" );
	
	equal( statemachine.state , "ERROR", "state should be ERROR after event in STATE_A with an unknown event by a wildcard" );
	equal( i , 6, "i should be 6 in after error" );
	
	statemachine.event();
	equal( statemachine.state , "STATE_A", "state should be STATE_A because of custom error event" );
});