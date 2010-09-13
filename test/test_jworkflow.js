$(document).ready(function () {
    module("jWorkflow ordering and starting workflows");

    test("jWorkflow: we can place an order", function() {
        expect(1);
        var order = jWorkflow.order(function () {});
        ok(order, "we should have an order");
    });

    test("jWorkflow: order throws an error when not given a function", function() {
        expect(1);
        var errored = false;
        try {
            jWorkflow.order(42);
        } 
        catch (ex) {
            errored = true;
        }

        ok(errored, "expected an error");

    });

    test("jWorkflow: we can call andThen on the return value of order", function() {
        expect(2);

        var transfunctioner = function () { };
        var order = jWorkflow.order(transfunctioner);
        
        ok(order.andThen, "expected to be asked: 'andThen'");
        equals(typeof(order.andThen), "function", "expected andThen to be a function");
    });

    test("jWorkflow: andThen throws an error when not given a function", function() {
        expect(1);

        var errored = false;
        try {
            jWorkflow.order(function() {}).andThen(42);
        } 
        catch (ex) {
            errored = true;
        }

        ok(errored, "expected an error");
        
    });

    test("jWorkflow: we can call andThen on the return value of andThen", function() {
        expect(2);

        var garlicChicken = function () {};
        var whiteRice = function () {};
        var wontonSoup = function () {};
        var cookiesFortune = function () {};
        var noAndThen = function () {};

        var order = jWorkflow.order(garlicChicken)
                            .andThen(whiteRice)
                            .andThen(wontonSoup)
                            .andThen(cookiesFortune);
        
        order.andThen(noAndThen).andThen(noAndThen);

        ok(order.andThen, "expected to be asked: 'andThen'");
        equals(typeof(order.andThen), "function", "expected andThen to be a function");

    });

    test("jWorkflow: it doesnt invoke the order function when start isnt called", function() {
        var dude = true,
            sweet = function () { sweet = false; };

        var order = jWorkflow.order(sweet);

        ok(dude, "expected sweet to have not been invoked");
        
    });

    test("jWorkflow: it calls the order function when start is called", function() {
        var dude = false,
            sweet = function () { dude = true; };

        var order = jWorkflow.order(sweet);

        order.start();

        ok(dude, "expected sweet to have been invoked");
    });

    test("jWorkflow: it can handle multiple orders without mixing them", function() {
        var dude = false,
            what = false,
            sweet = function () { dude = true; },
            whatup = function () { what = true; }
            order = jWorkflow.order(sweet),
            order2 = jWorkflow.order(whatup);


        order.start();
        ok(what === false, "expected sweet to have been invoked");
    });

    test("jWorkflow: it calls the order in the order that it was built", function() {

        var result = [], 
            garlicChicken = function () { result.push("garlicChicken"); },
            whiteRice = function () { result.push("whiteRice"); },
            wontonSoup = function () { result.push("wontonSoup"); },
            cookiesFortune = function () { result.push("cookiesFortune"); },
            noAndThen = function () { result.push("noAndThen"); },
            order = jWorkflow.order(garlicChicken)
                            .andThen(whiteRice)
                            .andThen(wontonSoup)
                            .andThen(cookiesFortune);
        
        order.andThen(noAndThen).andThen(noAndThen);

        order.start();

        same(["garlicChicken", "whiteRice", "wontonSoup", "cookiesFortune", "noAndThen", "noAndThen"], result, "expected functions to be called in order");
    });


    
    


});
