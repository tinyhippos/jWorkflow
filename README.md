# Documentation - Content

* [About jsFlow](#about-jsflow)
* [Why jsFlow](#why-jsflow)
* [Goals](#goals)
* [Getting Started](#getting-started)
    * [Webbrowser](#webbrowser)
    * [NodeJS](#nodejs)
* [Compability to jWorkflow](#compability-to-jworkflow)
    * [Webbrowser](#webbrowser-1)
    * [NodeJS](#nodejs-1)
* [Usage](#usage)
    * [Creating a Flow Description](#creating-a-flow-description)
    * [Finalize a Flow Description](#finalize-a-flow-description)
    * [Creating a Flow Instance](#creating-a-flow-instance)
    * [Custom Instance Context](#custom-instance-context)
    * [Custom Step Context](#custom-step-context)
    * [Passing Values](#passing-values)
    * [Initial Value](#initial-value)
    * [Evaluation Mode](#evaluation-mode)
    * [Handling Async Calls](#handling-async-calls)
    * [Final Callback](#final-callback)
    * [Waiting](#waiting)
    * [Subflows](#subflows)
    * [Revise Steps](#revise-steps)
    * [Reset Steps](#reset-steps)
    * [Marked Steps](#marked-steps)
    * [Parallel Steps](#parallel-steps)
    * [Canceling Workflows](#canceling-workflows)
* [Full Version Extras](#full-version-extras)
	* [State-Machine](#state-machine)


## About jsFlow

jsFlow is a fork of [jWorkflow from tinyhippos](https://github.com/tinyhippos/jWorkflow). It's a very fast, memory efficient and small library that provides an easy to read, chainable API for creating modular and reusable workflows in JavaScript.

**Current:** [1.0](https://github.com/Tapsi/jsFlow/tree/master/dist)

Of course if you have ideas to enhance jsFlow then please make a pull request. ;)


## Why jsFlow

Some of you may ask why to distribute an extended version of jWorkflow. I'm a project developer of [Custom Wars: Tactics](https://github.com/ctomni231/cwtactics). It's a clone of the popular Advance Wars Game. We've decided to use modern and efficient programming patterns and one of them is the flow technic to bind differen't task together into a execution chain. That's why we used jWorkflow. 

But jWorkflow has some pitfalls like the RAM consumption and the lack of the ability to manipulate the execution flow dynamically at runtime. That is the reason why we developed jsFlow. It's a real enhancement of jWorkflow not a replacement. That's why one of our targets is the possibility to run jsFlow in a 100% API compability mode. 

We have done a lot of internal refactorings to create a smaller memory footprint. Beside of that jsFlow adds a lot of new features. Basically to allow the realization of two flow types with jsFlow.

  * Sync/Async Workflows
	* State-Machine Flows


## Goals

* Micro-Library ( minified size <= 4KB ) 
* jWorkflow API compatibility
* Dynamic execution flow manipulation
* Creation of many flow instances
* State-Machine support

## Getting Started

jWorkflow can be used in node or included in the browser. Simply put it into your workspace and load it via the correct loading algorithm ( according to your environment ).

### Webbrowser

    <script type="text/javascript" src="../dist/jsFlow.min.js"></script>
    
    <script>
        var flow   = jsFlow();
    </script>
		
### NodeJS

    var jsFlow = require("jsFlow").jsFlow;
    var flow   = jsFlow();


## Compability to jWorkflow

jsFlow is 100% API compatible to jWorkflow. This means if you want to port one of your programs that used jWorkflow then you do not have to change your workflow definitions. The following calls will be placed in your environment and works as a wrapper.
    
    jWorkflow; 									// helper object
		jWorkflow.order( ); 				// invokes a jsFlow();
    jWorkflow.order( fn ); 			// invokes a jsFlow().andThen( fn );
    jWorkflow.order( fn,ctx ); 	// invokes a jsFlow().andThen( fn,ctx );

### Webbrowser

Simply put the following line into your page before the line where you load jsFlow. Your jWorkflow compatible code works now without any changes.

    window.JSFLOW_JWORKFLOW_API_COMPATIBLE_MODE = true; 

### NodeJS

NodeJs has the API compability always enabled. You simply have to write the following at your require call to use the jWorkflow Wrapper.

		// var jsFlow = require("jsFlow").jsFlow;
		var jWorkflow = require("jsFlow.js").jWorkflow;
		
		jWorkflow.order( ... ).andThen( ... ).start( ... );


## Usage

This chapter gives you a small set of information about the features of jsFlow and how you can use them. If the variable is `flow` is used in one of the examples below without being declared in the same code block then `flow` represents a complete flow description. An expample how the variable `flow` could be defined are shown in the code block belo.
    
    var flow = jsFlow().step(doSomething).finalize();
    

### Creating a Flow Description

Every flow needs a description that defines the single steps of the flow. A new description will be created by the `jsFlow` function.

    var flow = jsFlow();
    
Steps can be added by the `step` function. The call of the function is chainable because it returns always the flow description object. All steps are evaluated in a sequential order.

    flow.step(function(){
            // a: do something first       
        })
        .andThen(function(){
            // b: do something after a
        });
        
You may noticed the `andThen` function. It is a symbolic link for `step`. The reason for `andThen` is to provide the possibility to have a better and more human readable code.
    
### Finalize a Flow Description

A flow description can be prevented to extended at a given point by calling the `finalize` function. Further attempts to create flow steps will be declined.

    flow.finalize();
    
    flow.step( ... ); // throws an Error

### Creating a Flow Instance

If you want to instantiate a flow description then you have to create a baton. A baton is a flow instance representation. It contains all data about the execution state plus the ability to start and stop the execution. 

    flow.start();
    
The signature of start is overloaded.

    start( finalCallback, context, intialValue )
    
    start( options: Object<{ callback, context, initialValue }> )
    
If you start a flow then all steps will be executed and the baton passed to the single steps.

    flow.step( function( previousValue, baton ){
        // ...
    });

Instance of flows can only created if the description is finalized. If the `start` function is called on a description object while the description is not finalized then it will be finalized with the invokement of the `start` function.

### Custom Instance Context

Every flow instance can get a custom context object. Every flow step will be called with that context. If no instance context is given then the step will be called with `null` as context.

    // the two context objects
    var ctx1 = { x:0  };
    var ctx2 = { x:10 };

    // the flow
    var flow = jsFlow().step(function(){
        this.x++;
    });
    
    // start two instances with different contexts
    flow.start( null, ctx1 );
    flow.start({ context: ctx2 });
    
    // this can be asserted
    equal( ctx1.x , 1 );
    equal( ctx2.x , 11 );

### Custom Step Context

Beside of the instance context you're able to define a task context. Regardless of the instance context when a step has a custom context defined then it will always invoked with that context as `this` object.

    flow.step( function(){
      // this resolves to fnCtx not ctxA
    }, fnCtx );
   
    flow.start( ctxA );

### Initial Value

If you start a flow then you can pass a previous value to the first step of the flow.

    // the flow
    var flow = jsFlow().step(function( p ){
        equal( p, 42 );
    });
    
    // start two instances with initialValues
    flow.start( null, null, 42 );
    flow.start({ initialValue: 42 });

### Evaluation Mode

Sometimes you have a complete asynchron workflow or you wan't to trigger the single steps yourself. If you know that before you can set the complete workflow into the asynchron mode. This automatically does a `baton.take()` before the step will be executed. Means you have to trigger the next step by calling `pass`, `revise` or `reset`.

		var flow = jsFlow()
			.step(function( p ){
        // a ( runs synchron )
				equal( p, 10 );
    	})
			.step(function( p ){
        // b ( runs synchron )
				equal( p, 42 );
    	});

		// runs a
		var instance = flow.start({ asyncMode:true, initialValue:10 });
		
		// runs b
		instance.pass(42);

### Passing Values

Flow steps can access the return value of the previous task with the previous parameter

    var flow = jsFlow()
        .step(function(){
            return 42; // the answer for everything :D
        })
        .step(function( previous ){
            equal( previous, 42 )
        })
        .start();

### Handling Async Calls

Sometimes (probably all the time) you will need to do something async when working with tasks. jsFlow provides the ability to control the execution of the workflow via the baton that is passed to every step.

    flow.step(function( previous, baton ){
        
        //take the baton, this means the next task will not run until you pass the baton
        baton.take();

        window.setTimeout(function() {
        
            //please be nice and always remember to pass the baton!
            baton.pass();
            
        },1000);
    })

If you want to pass a return value to the next task you can pass it along with the baton. **NOTE:** if you did take the baton, the return value from your function will NOT be passed to the next task:

    flow.step(function( previous, baton ){
        baton.take();

        window.setTimeout(function(){            
            baton.pass(42); // this value will be passed to the next task
        }, 1000 );

        return 32; // this will NOT be passed to the next function since you took the baton.
    })

### Final Callback

With a finalizer you can react to the completed event of the flow. You can define it in the start method by passing it into the options object or as callback parameter.  
     
    function finalCB( previous ) {
       // do something 
    }
 
    // start flow with callback
    flow.start({ callback: finalCB });
    flow.start( finalCB );
  
The finalizer will be called with the context that is passed into start.  
  
    // start flow with callback and instance context
    flow.start({ context: myCtx, callback: finalCB });
    flow.start( finalCB, myCtx );

### Waiting

If you ever need to take a break and reflect on the moment you can add some time ( **in milliseconds** ) to chill between flow steps.

    flow.step( fn )
        .chill(1000)
        .step( fn )
        .step( fn )
        .step( fn )
        .chill(1000)
        .step( doneFn );
        
### Subflows

You can pass other flows as a step into a flow. 

    flow.step( fn )
        .andThen( anotherFlow );

### Revise Steps

Sometimes you have steps that needs to be done several time. One solution is to create the steps as closures.

    function createStep( i ){
      return function( p, b ){
         this.x += i;
      }
    }
   
    for( var i=1; i<10; i++ ) flow.step( createStep(i) );
   
This is a cryptic code that isn't easy to read. Furthermore you get an overhead by creating a lot of functions. jsFlow gives you the `revise` function that allows you to repeat the actual step. Beside of that `revise` works like `pass`.

    var myCtx = { x:0, i:1 };
   
    flow
      .step( function( prev, baton ){ 
          this.x += this.i;
         
          this.i++;
          if( this.i<10 ) baton.revise();
      })
      .start( ... );
       
This function is very usable for tasks that doing something in relation to a list of objects ( *like loading images* ). 

*Note:* version 1.0 and greater does not force into the asynchron mode. Only if you called `baton.take()` before then this function will pass your your return via asynchron mode. If you use the jWorkflow compatibility mode then the evalutation will always forced into asynchron mode because of the complete API compability.

### Reset Steps

If you wan't to rerun a created instance during an execution or after a complete execution then you can use the `reset` function to reset the execution data.

    flow
      .step( function( prev, baton ){ 
				...
      })
      .step( function( prev, baton ){ 
				if( this.myVar ) baton.reset(); // starts again
      })
      .start( ... );
			
### Marked Steps

You can mark steps with a name. This enables you to go back to them in the middle of the evaluation if you want. 

		flow
      .step( function( prev, baton ){ 
			
				// if myDep is true then skip the next step 
				// after completition of this step
				if( this.myDep ) baton.nextStep("C");
      })
      .step( function( prev, baton ){ 
				...
      })
      .step( "C", function( prev, baton ){ 
				...
      })
      .start( ... );
			
### Parallel Steps

If you need to handle some tasks and don't care about when they are done you can pass in an array of functions and / or other workflows to execute at the same time.

    flow.step([ fn, fnB, fnC ])
        .andThen( anotherFlow , fnD ]);

### Canceling Workflows

To cancel the execution of the workflow you can call the drop method on the baton. 

*Note:* version 1.0 and greater does not force into the asynchron mode. Only if you called `baton.take()` before then this function will pass your your return via asynchron mode. If you use the jWorkflow compatibility mode then the evalutation will always forced into asynchron mode because of the API compability.
	
		// synchron mode
    function (previous, baton) {
		
        // the value passed to drop will be passed onto the final callback if it exists
        return baton.drop("I dropped the soap");
    }
		
		// asynchron mode
    function (previous, baton) {
       	baton.take();

        //the value passed to drop will be passed onto the final callback if it exists
        baton.drop("I dropped the soap");
        
        //this value will NOT be passed to the next workflow step
        return 10;
    }
		
		// synchron mode
    function (previous, baton) {

        // in this case the value passed to drop
				// will not used because non asynchron mode
        baton.drop("I dropped the soap");
        
        //this value will be passed to the final callback ( if exists )
        return 10;
    }

		// in sync mode you have to return the return of your drop because it's 
		// not doing a `baton.pass` if your flow decide dynamically for sync/async 
		// then do (which is the best decision is todo always)
		function (previous, baton) {
				...
				
				// the execution of this flow step ends in both modes here
				// when xyz resolves to true
				if( xyz ) return baton.drop( yourReturn );
				
				...
		}
		
## Full Version Extras

### State-Machine
		
If you are using the full version of jsFlow then you also have the `jsFlowStateMachine` property in your environment. With that function you will be able to create a state machine on top of `jsFlow`.

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
		
		// triggers INIT outcome
		statemachine.event();
		
The syntax is easy. The list contains this syntax `[ stateName, stateImpl [,stateName, stateImpl]*]`. A state implementation can be a function or an object. A function is always the body. This kind of states cannot react the onenter event. If you want to watch to that event then you have to define it as object with an `onenter` property. The `onenter` function of the first state will be automatically triggered when the state machine is created. 

			"STATE_B", {
				onevent:function( p,b ){
					// ...
				}
			}
			
The body will be set in the `onevent` function. Sometimes you want to do different stuff in a state in relation to the input. This can be done by removing the `onevent` property by special event handlers which will be called if previous value resolves to the property name.

				"true": function( p,b ){ 
					b.transition("STATE_C"); 
				},
				
				"false": function( p,b ){ 
					b.transition("STATE_B"); 
				}
				
A transition to another state can be done by calling `baton.transition(state)`. If a state event function does not make a transition then the default transition will be triggered. This default transition will be set by placing the `defaultOutcome` property into the state implementation object.

If you want to have custom context objects for your state then you can place a `context` property into the state implementation. This causes that the context object will be the `this` object in every function of the state.

			"STATE_B", {
				context: { x: 10 },
				onevent:function( p,b ){
					equal( this.x , 10 );
				}
			},