/* global SLang : true */

(function () {

"use strict";

var samples = [

/* 0 */   "",
/* 1 */   "12",
/* 2 */   "x",
/* 3 */   "+(1,*(2,add1(3)))",
/* 4 */   "fn () => 5",
/* 5 */   "fn (x) => x",
/* 6 */   "fn (a,b,c) => y",
/* 7 */   "(fn (x) => 5 y)",
/* 8 */   "(fn (z) => z *(y, add1(x)))",
/* 9 */   "(fn (a,b,c) => y 1 2 3)",
/* 10 */  "(fn (x) => *(x,x) +(x,y))",
/* 11 */  "(fn (f,x) => (f (f x)) fn (y) => *(2,y) +(x,y))",
/* 12 */  "fn (f,g) => fn (x) => (f (g x))"
];

SLang.samples = samples;

}());
