var Folktale = require('cloud/lib/Folktale.js'),
    Request = require('cloud/lib/Request.js');

/* ------------ Those are utils to enhance a given context ------------- */
var importFolktale = function (context) {
    context.Either = Folktale.data.Either;
    context.Task = Folktale.data.Task;
    context.Maybe = Folktale.data.Maybe;
    context.Request = Request;
    context.map = Folktale.control.monads.map;
    context.chain = Folktale.control.monads.chain;
    context.async = Folktale.control.async(context.Task);
    context.flip = Folktale.core.lambda.flip;

    /* Not taking the folktale function here. This function would rather allow to compose more than
     * two functions at the same time. */
    context.compose = function compose() {
        var functions = arguments;
        return function () {
            return [].reduceRight.call(functions, function (v, f) {
                return { 0: f.apply(null, v), length: 1 };
            }, arguments)[0];
        };
    };

    context.curry = function curry(arity, f, curryContext) {
        return !curryContext ?
            Folktale.core.lambda.curry(arity, f) :
            function () {
                curryContext = curryContext || this;
                if (arguments.length < arity) {
                    return Function.call.bind(function (args) {
                        var newArgs = args.concat([].slice.call(arguments, 1)),
                            l = newArgs.length;
                        return (arity - l) === 0 ?
                            f.apply(curryContext, newArgs) :
                            curry(arity - l, newArgs, curryContext);
                    }, null, [].slice.call(arguments));
                }
                return f.apply(curryContext, arguments);
            };
    };

    /** a -> (a -> b) -> (a -> c) -> [b, c] */
    context.apply2 = context.curry(3, function (f1, f2, arg) {
        return [f1(arg), f2(arg)];
    });

    /** a -> (a -> b) -> (a -> c) -> (a -> d) -> [b, c, d] */
    context.apply3 = context.curry(4, function (f1, f2, f3, arg) {
        return [f1(arg), f2(arg), f3(arg)];
    });

    context.rejectedMap = context.curry(2, function (f, task) { return task.rejectedMap(f); });
};
/* -------------- Public Interface -------------- */
exports.into = importFolktale;
