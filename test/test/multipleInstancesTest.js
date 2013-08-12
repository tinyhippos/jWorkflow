module( "jsFlow multiple instances tests" );

asyncTest( "a flow instance can be created during the execution of an other instance (same flow)", function(){
  expect( 2 );

  var flowIns1Baton;
  var resA;

  var finA = function( p ){
    resA = p;
  };
  
  var finB = function( p ){
    start();
    equal( resA, 'a', "flow instance one should return 'a'" );
    equal( p, 'b', "flow instance two should return 'b'" );
  };

  var flow = jsFlow()
    .andThen( function( stop, baton ){
      if( stop ) { // instance a

        baton.take();
        flowIns1Baton = baton;

        // start instance b via event
        setTimeout( function(){
          flow.start( finB, null, false );
        }, 10 );
      }
      else { // instance b
        flowIns1Baton.pass( "a" );
        return "b";
      }
    } );

  flow.start( finA, null, true );
} );