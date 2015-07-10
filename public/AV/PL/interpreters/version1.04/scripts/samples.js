/* global SLang : true */

(function () {

"use strict";

var samples = [

/* 0 */   "",
/* 1 */   ["12", '["Num",12]' ],
/* 2 */   ["x",'["Num",5]'],
/* 3 */   ["+(1,*(2,add1(3)))",'["Num",9]'],
/* 4 */   ["fn () => 5",
           '["Clo",[],["IntExp",5],["Env",[["x",["Num",5]],["y",["Num",6]]],["EmptyEnv"]]]'],
/* 5 */   ["fn (x) => x",
           '["Clo",["x"],["VarExp","x"],["Env",[["x",["Num",5]],["y",["Num",6]]],["EmptyEnv"]]]'],
/* 6 */   ["fn (a,b,c) => y",
           '["Clo",["a","b","c"],["VarExp","y"],["Env",[["x",["Num",5]],["y",["Num",6]]],["EmptyEnv"]]]'],
/* 7 */   ["(fn (x) => 5 y)",'["Num",5]'],
/* 8 */   ["(fn (z) => z *(y, add1(x)))",'["Num",36]'],
/* 9 */   ["(fn (a,b,c) => y 1 2 3)",'["Num",6]'],
/* 10 */  ["(fn (x) => *(x,x) +(x,y))",'["Num",121]'],
/* 11 */  ["(fn (f,x) => (f (f x)) fn (y) => *(2,y) +(x,y))",
           '["Num",44]'],
/* 12 */  ["fn (f,g) => fn (x) => (f (g x))",
           '["Clo",["f","g"],["FnExp",["x"],["AppExp",["VarExp","f"],["args",["AppExp",["VarExp","g"],["args",["VarExp","x"]]]]]],["Env",[["x",["Num",5]],["y",["Num",6]]],["EmptyEnv"]]]'],
];

SLang.samples = samples;

}());
