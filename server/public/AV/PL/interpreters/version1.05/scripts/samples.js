/* global SLang : true */

(function () {

"use strict";

var samples = [

/* 0 */   "",
/* 1 */   "12",
/* 2 */   "x",
/* 3 */   "+(1,*(2,add1(3)))",
/* 4 */   "lambda  . 5",
/* 5 */   "lambda x . x",
/* 6 */   "lambda a,b,c . y",
/* 7 */   "(lambda x . 5 y)",
/* 8 */   "(lambda z . z *(y, add1(x)))",
/* 9 */   "(lambda a,b,c . y 1 2 3)",
/* 10 */  "(lambda x . *(x,x) +(x,y))",
/* 11 */  "(lambda f,x . (f (f x)) lambda y . *(2,y) +(x,y))",
/* 12 */  "lambda f,g . lambda x . (f (g x))"
];

SLang.samples = samples;

}());
