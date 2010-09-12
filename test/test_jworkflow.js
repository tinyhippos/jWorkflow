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


});
