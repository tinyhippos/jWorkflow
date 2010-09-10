$(document).ready(function () {
    module("jWorkflow ordering and starting workflows");

    test("jWorkflow: we can place an order", function() {
        expect(1);
        var order = jWorkflow.order(function () {});
        ok(order, "we should have an order");
    });

    test("jWorkflow: it throws an error when order is not a function", function() {
       var errored = false;
        try {
            jWorkflow.order(34);
        } 
        catch (ex) {
            errored = true;
        }

        ok(errored, "expected an error");

    });
});
