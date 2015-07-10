/* global SLang : true */

(function () {

"use strict";

var samples = [

/* 0 */   "",
/* 1 */   ["print", "print (x + (y * 2))"],
/* 2 */   ["print", "print (fn (f,x) => (f (f x)) fn (y) => (2 * y) (x + y))"],
/* 3 */   ["set", "set x = 10"],
/* 4 */   ["set","set x = add1( set y = 10 )"],
/* 5 */   ["set + block", "let x=1 y=2 in set x = (y + 2); set y = (x * 2); add1( (x + y) ) end"],
/* 6 */   ["set + block","let f = fn () => set x = 10 in (f); x end"],
/* 7 */   ["print + set + block", 
            "let\n" +
            "    x = 1\n" +
            "    y = 2\n" +
            "    sqr = fn (x) => (x * x)\n" +
            "in\n" +
            "   let\n" +
            "       f = fn (x) => (y * x)\n" +
            "       g = fn () => set y = add1(y)\n" +
            "       h = fn () => set x = add1(x)\n" +
            "       x = 3\n"+
            "   in\n" +
            "          set x = (2 * x);\n" +
            "          print x;    print y;\n" +
            "          print (sqr (x + y));\n" +
            "          print (f 5);\n" +
            "          (g);\n" +
            "          (h);\n" +
            "          print x;\n" +
            "          print (f 5);\n" +
            "          set y = 10;\n" +
            "          print (f 5)\n" +
            "   end\n" +
            "end\n"
         ]
]

SLang.samples = samples;

}());
