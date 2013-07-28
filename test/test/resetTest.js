module( "jsFlow reset function tests" );

test( "we reset the flow during the flow execution", function(){
  expect( 1 );
  
  var i = 0;
  
  jsFlow()
    .andThen(function(p,b){
      i++;
    })
    .andThen(function(p,b){
      i++;
			if( i < 9 ) b.reset();
    })
    .start();
  
  equal( i, 10, "every flow step should be called 5 times" );
});

test( "we reset the flow after the flow execution", function(){
  expect( 1 );
  
  var i = 0;
  
  var instance = jsFlow()
    .andThen(function(p,b){
      i++;
    })
    .start();
	
	while( i < 10 ){
		instance.reset();
		instance.pass();
	}
  
  equal( i, 10, "the flow should be called 10 times" );
});

test( "we can pass values with reset as previous parameter", function(){
  expect( 1 );
  
  var i = 0;
  
  jsFlow()
    .andThen(function(p,b){
      return p++;
    })
    .andThen(function(p,b){
      p++;
			if( p < 10 ) return b.reset(p);
			else return p;
    })
    .start({ 
			callback: function( p ){
				equal( p, 10, "last return should be 10" );
			},
			initialValue: 0 
		});
});
