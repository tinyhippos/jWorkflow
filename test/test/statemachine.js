module( "jsFlow marked states tests" );

(function(){

	function testStm( statemachine, data ){
		equal( statemachine.state , "STATE_A", "state should be STATE_A after start" );
		
		statemachine.event( true );
		equal( statemachine.state , "STATE_C", "state should be STATE_C after event with data true" );
		
		statemachine.event();
		equal( statemachine.state , "STATE_A", "state should be STATE_A after event in STATE_C" );
			
		statemachine.event(false);
		equal( statemachine.state , "STATE_B", "state should be STATE_B after event in STATE_A" );
		
		statemachine.event();
		equal( data.x , 1, "property x of STATE_B data should be 1 now" );
		equal( statemachine.state , "STATE_A", "state should be STATE_A after event in STATE_B because STATE_C called by STATE_B as action state" );
	}
	
	test( "state machine pattern should triggered from outside (STM_TEST_1)", function(){
		expect( 6 );
		
		var stateB_Data = {
			x:0
		};
			
		var statemachine = jsFlow()
			.step(function( ev, baton ){ 
				baton.transition = function( to ){
					this._taken = false;
					this.nextStep( to );
					this.state = to;
					this._taken = true;
				}
				
				baton.event = baton.pass;
				
				baton.transition("STATE_A");
			})
			
			// A
			.step("STATE_A",function( ev, baton ){
				
				if( ev ) baton.transition("STATE_C");
				else baton.transition("STATE_B");
			})
			
			// B
			.step("STATE_B",function( ev, baton ){
				
				this.x++;
				
				// CALLS STATE_C DIRECTLY AS ACTION STATE
				baton.transition("STATE_C");
				baton.pass();
				
			},stateB_Data)
			
			// C
			.step("STATE_C",function( ev, baton ){
				baton.transition("STATE_A");
			})
			
			.start({
				asyncMode:true
			});
			
		testStm(statemachine, stateB_Data);
	});	
	
	test( "re-test STM_TEST_1 but with using the statemachine factory helper", function(){
		expect( 6 );
		
		var stateB_Data = {
			x:0
		};
			
		var statemachine = jsFlowStateMachine([
			"INIT",{
				defaultOutcome: "STATE_A",
				onenter: function( p,b ){
					// ...
				}
			},
			
			"STATE_A", {
				
				"true": function( p,b ){ 
					b.transition("STATE_C"); 
				},
				
				"false": function( p,b ){ 
					b.transition("STATE_B"); 
				}
			},
			
			"STATE_B", {
				context: stateB_Data,
				onevent:function( p,b ){
					this.x++;
					
					// CALLS STATE_C DIRECTLY AS ACTION STATE
					b.transition("STATE_C");
					b.pass();
				}
			},
			
			"STATE_C", {
				defaultOutcome: "STATE_A",
				onevent: function( ev,b ){
					// ...
				}
			}
		]);
		
		statemachine.event();
			
		testStm( statemachine, stateB_Data );
	});
})();