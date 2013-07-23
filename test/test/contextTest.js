module( "jsFlow context object tests" );

test( "starting two flow instances with different contexts does not conflict each other", function(){
  var l = {x: +1};
  var r = {x: -1};

  var flow = jsFlow().andThen( function(){
    this.x = this.x * 2;
  } );

  flow.start( null,l );
  flow.start( null,r );

  equal( l.x, 2, "expected l.x to be 2" );
  equal( r.x, -2, "expected r.x to be -2" );
} );

test( "starting two flow instance callbacks with own contexts will not conflict each other", function(){
  var l = { i:0 };
  var r = { i:0 };

  var flow = jsFlow();

  flow.start( function( p ){ this.i += p; }, l, +1 );
  flow.start( function( p ){ this.i += p; }, r, -1 );

  equal( l.i, +1, "expected l.i to be +1" );
  equal( r.i, -1, "expected r.i to be -1" );
} );