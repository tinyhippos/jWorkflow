# Documentation - Content

* [About jsFlow](#about-jsflow)
* [Getting Started](#getting-started)
    * [NodeJS](#nodejs)
    * [Webbrowser](#webbrowser)
* [Compability to jWorkflow](#compability-to-jworkflow)
* [Usage](#usage)
    * [Creating a Flow Description](#creating-a-flow-description)
    * [Finalize a Flow Description](#finalize-a-flow-description)
    * [Creating a Flow Instance](#creating-a-flow-instance)


## About jsFlow

jsFlow is a fork of [jWorkflow from tinyhippos](https://github.com/tinyhippos/jWorkflow). It's primary task is to provide a read- and chainable API for JavaScript to create modular, reusable workflows. 


## Getting Started

jWorkflow can be used in node or included in the browser. Simply put it into your workspace and load it via the correct loading algorithm ( according to your environment ).

### NodeJS

    var jsFlow = require("jsFlow");
    var flow   = jsFlow();
    
### Webbrowser

    <script type="text/javascript" src="../dist/jsFlow.min.js"></script>
    
    <script>
        var flow   = jsFlow();
    </script>


## Compability to jWorkflow

jsFlow is 100% API compatible to jWorkflow. This means if you want to port one of your programs that used jWorkflow then you do not have to change your code. Simply put the following line into your page before the line where you load jsFlow.

    var JSFLOW_JWORKFLOW_API_COMPATIBLE_MODE = true; 

**Note:** `JSFLOW_JWORKFLOW_API_COMPATIBLE_MODE` must be available in the window object of your browser. API compability is not supported for Nodejs environments at the moment ( *support in the next version* ).

The following calls will be available in your environment which creates the complete API compability.
    
    jWorkflow; // is an empty helper object
    
    jWorkflow.order( fn ); // same as jsFlow().andThen( fn );
    

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
    
If you start a flow then all steps will be executed and the baton passed to the single steps.

    flow.step( function( previousValue, baton ){
        
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
    flow.start(ctx1);
    flow.start(ctx2);
    
    // this can be asserted
    equal( ctx1.x , 1 );
    equal( ctx2.x , 11 );

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

# Handling Async Calls

Sometimes (probably all the time) you will need to do something async when working with tasks. jsFlow provides the ability to control the execution of the workflow via the baton that is passed to every step.

    function wait( previous, baton ){
        
        //take the baton, this means the next task will not run until you pass the baton
        baton.take();

        window.setTimeout(function() {
        
            //please be nice and always remember to pass the baton!
            baton.pass();
            
        },1000);
    }

If you want to pass a return value to the next task you can pass it along with the baton. **NOTE:** if you did take the baton, the return value from your function will NOT be passed to the next task:

    function wait( previous, baton ){
        baton.take();

        window.setTimeout(function(){            
            baton.pass(42); // this value will be passed to the next task
        }, 1000 );

        return 32; // this will NOT be passed to the next function since you took the baton.
    }


the start method provides a callback to execute when the workflow is finished.  The final
return value is also passed to the callback:

   order.start({
       callback: function(review) {
               console.log("dude!, your car is behind that mail truck!");
               expect(review).toBe("two thumbs up");
       }
   });

you can also pass context to use for the callback:

   order.start({
       callback: function() {
           //do stuff
       }, 
       context: transfunctioner
   });
    
# Waiting between tasks

If you ever need to take a break and reflect on the moment you can add some time(in ms) to chill between tasks:

    jWorkflow.order(seeDoubleRainbow)
             .chill(1000)
             .andThen(omg)
             .andThen(omg)
             .andThen(omg)
             .chill(1000)
             .andThen(freakOut);

# Handling Parallel tasks

If you need to handle some tasks and don't care about when they are done you can pass in an array of functions and / or other workflows to execute
at the same time.

    jWorkflow.order([man, man, halfMan])
             .andThen([jWorkflow.order([guy, guy]).andThen(girl), pizzaPlace]);

# Canceling Workflows

To cancel the execution of the workflow you can call the drop method on the baton:

    function (previous, baton) {
        //the value passed to drop will be passed onto the final callback if it exists
        baton.drop("I dropped the soap");
        //this value will NOT be passed to the next workflow step
        return 10;
    }

NOTE: This will force the workflow into async mode.
