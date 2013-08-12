module( "jsFlow revise function tests" );

test( "we can cycle some parts of the flow", function(){
  expect( 1 );
  
  var i = 0;
  
  jsFlow()
    .andThen(function(p,b){
      i++;
      if( i<10 ) b.revise();
    })
    .start();
  
  equal( i, 10, "the flow step should be called 10 times" );
});

test( "cycles works like they would be written as non-loop flow", function(){
  expect( 2 );
  
  var i1 = 0;
  var i2 = 0;
  
  jsFlow()
    .andThen(function(){ i1++; })
    .andThen(function(){ i1++; })
    .andThen(function(){ i1++; })
    .start();
  
  jsFlow()
    .andThen(function(p, b){
      i2++;
      if( i2<3 ) b.revise();
    })
    .start();
  
  equal( i1, 3, "the non-loop flow step should be called 3 times" );
  equal( i2, 3, "the loop flow step should be called 3 times" );
});