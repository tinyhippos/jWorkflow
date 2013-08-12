

module( "jsFlow eval mode tests" );

test( "asynchron mode should only triggered from manual baton.pass()", function(){
	expect( 2 );
	
	var flow = jsFlow()
		.step(function( p ){
			// a ( runs synchron )
			equal( p, 10, "first previous variable should be 10 by initialValue" );
		})
		.step(function( p ){
			// b ( runs synchron )
			equal( p, 42, "second previous variable should be 42 by baton.pass" );
		});
		
		// runs a
		var instance = flow.start({ asyncMode:true, initialValue:10 });
		
		// runs b
		instance.pass(42);
});