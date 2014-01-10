// Generated by CoffeeScript 1.6.3
(function() {
  var colors, intdoc, lastTokenPlus, vm, __doc__,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  colors = require('colors');

  intdoc = require('intdoc');

  vm = require('vm');

  __doc__ = "Shows documentation for an expression; you can also type Ctrl-Q in-line";

  lastTokenPlus = function(input) {
    "A crude cut at figuring out where the last thing you want to \nevaluate in what you're typing is\n\nEx. If you are typing\n  myVal = new somemodule.SomeClass\n\nYou probably just want help on `somemodule.SomeClass`\n";
    var c, t, _i;
    t = "";
    for (_i = input.length - 1; _i >= 0; _i += -1) {
      c = input[_i];
      if (__indexOf.call("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.[]'\"$_:", c) < 0) {
        break;
      }
      t = c + t;
    }
    if (t[0] === ".") {
      t = t.slice(1);
    }
    if (t.slice(0, -1) === ".") {
      t = t.slice(0, -1);
    }
    return t;
  };

  exports.postStart = function(context) {
    var document, originalEval, repl;
    repl = context.repl;
    document = function(expr, reportErrors) {
      var doc, e, result, tyname, x;
      if (expr.trim().length === 0) {
        repl.outputStream.write(colors.cyan("" + __doc__ + "\n"));
      } else {
        try {
          if (repl.useGlobal) {
            result = vm.runInThisContext("(" + expr + ")");
          } else {
            result = vm.runInContext("(" + expr + ")", repl.context);
          }
        } catch (_error) {
          e = _error;
          if (reportErrors) {
            repl.outputStream.write(colors.red("Bad input; can't document\n"));
          }
          repl.displayPrompt();
          return null;
        }
        doc = intdoc(result);
        if (doc.name && doc.name.length > 0) {
          tyname = "[" + doc.type + ": " + doc.name + "]";
        } else {
          tyname = "[" + doc.type + "]";
        }
        repl.outputStream.write(colors.cyan(tyname));
        if (typeof result === 'function' && (doc.params != null)) {
          repl.outputStream.write(colors.yellow(" " + doc.name + "(" + (((function() {
            var _i, _len, _ref, _results;
            _ref = doc.params;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              x = _ref[_i];
              _results.push("" + x);
            }
            return _results;
          })()).join(", ")) + ")"));
        }
        repl.outputStream.write("\n");
        if ((doc.doc != null) && doc.doc.length > 0) {
          repl.outputStream.write(doc.doc + "\n");
        }
      }
      return repl.displayPrompt();
    };
    repl.defineCommand('doc', {
      help: __doc__,
      action: function(expr) {
        return document(expr, true);
      }
    });
    repl.inputStream.on('keypress', function(char, key) {
      var rli;
      if (!(key && key.ctrl && !key.meta && !key.shift && key.name === 'q')) {
        return;
      }
      rli = repl.rli;
      repl.docRequested = true;
      return rli.write("\n");
    });
    originalEval = repl["eval"];
    return repl["eval"] = function(input, context, filename, callback) {
      var toDoc;
      if (repl.docRequested) {
        repl.docRequested = false;
        input = input.slice(1, -2);
        toDoc = lastTokenPlus(input);
        if (toDoc !== input) {
          repl.outputStream.write(colors.yellow(toDoc + "\n"));
        }
        document(toDoc);
        return repl.rli.write(input);
      } else {
        return originalEval(input, context, filename, callback);
      }
    };
  };

}).call(this);