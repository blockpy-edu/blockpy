/**
 * This module supports the Functional Programming style by providing
 * standard accessors and mutators for a list data structure, as well as 
 * common list-processing functions (namely, isList, isMember, append 
 * and reverse) and classic higher-order functions (such as compose, curry, 
 * map, filter and reduce). Most of the other functions in this module deal 
 * with numbers (e.g., add, sub, mul, div, pow, isLT, isGT, isZero) 
 * but other functions (e.g., isEq, isNumber, and the list accessors and 
 * constructors) will work fine when manipulating lists of other primitives 
 * values (e.g., strings, booleans) or nested lists thereof.
 * 
 * @module fp
 * @author David Furcy - Feb. 2015
 * @version 1.0
 */


(function(exports){



 /** hd takes in a non-empty list and returns the first element of that list
    @param  aList {list} - a list of values
    @alias module:fp.hd
    @return {list}  the first element of the input list
    @throws Exception: hd can only be called with a non-empty list.
 */
var hd = function (list) { 
    if (isList(list) && (list.length>0))
	return list[0]; 
    else 
	throw new Error("hd can only be called on a non-empty list.");
}
/** tl takes in a non-empty list and returns a copy of the input list with 
    its first element removed
    @param  aList {list} - a list of values
    @alias module:fp.tl
    @return {list} a copy of the input list with its first element removed
    @throws Exception: tl can only be called with a non-empty list.
 */
var tl = function (list) { 
     if (list.length>0)
	 return list.slice(1); 
    else 
	throw new Error("tl can only be called on a non-empty list.");
}
/** isList takes in a single argument and returns true if it is a list,
    false otherwise
    @param  argument - any value
    @alias module:fp.isList
    @return {boolean} true if argument is a list, false otherwise
 */
var isList = function (a) {
    return a && typeof a === 'object' && a.constructor === Array; 
}
/** cons takes in a value and a list and returns a new list that is a copy
    of the second argument with the first argument inserted in front
    @param  value  - any value
    @param  aList {list} - a list of values
    @alias module:fp.cons
    @return {list} a copy of the input list with value inserted in front
    @throws Exception: The second argument of cons must be a list.
 */
var cons = function (e,list) {
    if (isList(list)) {
	var result = list.slice(0); // makes a copy of list
	result.unshift(e);
	return result;
    } else
	throw new Error("The second argument of cons must be a list.");
}
/** isNull takes in a list and returns true if it is empty,
    false otherwise
    @param  aList {list} - a list
    @alias module:fp.isNull
    @return {boolean} true if the input list is empty, false otherwise
    @throws Exception: The argument of isNull must be a list.
 */
var isNull = function (list) { 
    if (isList(list))
	return list.length === 0; 
    else
	throw new Error("The argument of isNull must be a list.");
}
// this function is not exported
var isPrimitive = function (a) {
    var type = typeof a;
    return type !== 'object' && type !== 'function' || a === null;
}
/** isEq takes in two primitive values and returns true if they are
    the same, false otherwise 
    @param v1  - any primitive value
    @param v2  - any primitive value
    @alias module:fp.isEq
    @return {boolean} true if the two primitive input values are the same, 
    false otherwise 
    @throws Exception: Both arguments of isEq must be primitive values.
 */
var isEq = function (a,b) { 
    if (isPrimitive(a) && isPrimitive(b))
	return a === b; 
    else
	throw new Error("Both arguments of isEq must be primitive values.")
}
/** isMember takes in a primitive value and a (flat) list and returns true 
    if the first argument appears in the list, false otherwise 
    @param value - any primitive value
    @param list - a list of (primitive) values
    @alias module:fp.isMember
    @return {boolean} true if the first argument is an element of the 
    second argument, false otherwise 
    @throws Exception: The first argument of isMember must be a primitive value.
    @throws Exception: The second argument of isMember must be a list.
 */
var isMember = function (n,ns) { 
    var helper = function (n,ns) {
	if (isNull(ns))
	    return false;
	else
	    return isEq(n, hd(ns)) || isMember(n,tl(ns)); 
	}
    if (! isPrimitive(n))
	throw new Error("The first argument of isMember must be a primitive value.")
    else if (! isList(ns))
	throw new Error("The second argument of isMember must be a list.")
    else
	return helper(n,ns);
}

/** isZero takes in a number and returns true if it is equal to 0,
    false otherwise 
    @param n {number} - any number
    @alias module:fp.isZero
    @return {boolean} true if the input value is equal to 0, false otherwise 
    @throws Exception: The argument of isZero must be a number.	
 */
var isZero = function (a) { 
    if (typeof a === 'number')
	return a === 0; 
    else
	throw new Error("The argument of isZero must be a number.")	
}
/** makeList takes in 0 or more values and returns a single list
    containing all of the input values in the same order
    @param 0_or_more_args - 0 or more arguments
    @alias module:fp.makeList
    @return {list} a list of all of the arguments in the same order
    @example makeList() returns []
    @example makeList(1) returns [1]
    @example makeList(1,2,3,4,5) returns [1,2,3,4,5]
 */
var makeList = function ( /* arguments */  ) {
    return Array.prototype.slice.call(arguments,0);
}
/** append takes in two lists and returns as a single list 
    the concatenation of the first list followed by the second list
    @param l1 {list} - any list
    @param l2 {list} - any list
    @alias module:fp.append
    @return {list} the concatenation of l1 followed by l2 
    @throws Exception: Both arguments of append must be lists.
 */
var append = function (l1,l2) {
    if (isList(l1) && isList(l2)) {
	if (isNull(l1))
	    return l2;
	else 
	    return cons(hd(l1),append(tl(l1),l2));
    } else
	throw new Error("Both arguments of append must be lists.")	
}
/** reverse takes in a list and returns another list containing all of the
    elements of the input list but in reverse order
    @param aList {list} - any list
    @alias module:fp.reverse
    @return {list} a reversed copy of the input list
    @throws Exception: The argument of reverse must be a list.
 */
var reverse = function (ns) {
    if (isList(ns)) {
	function helper(input,acc) {
	    if (isNull(input))
		return acc;
	    else 
		return helper(tl(input),cons(hd(input),acc));
	}
	return helper(ns,[]);
    }
    else
	throw new Error("The argument of reverse must be a list.")	
}
/** isNumber returns true if its single argument is a number, false otherwise
    @param aValue - any value
    @alias module:fp.isNumber
    @return {boolean} true if the argument is a number, false otherwise
 */
var isNumber = function (a) { 
    return Number.isFinite(a); 
}
/** isLT takes in two numbers and returns true if the first number is less than
    the second number, false otherwise
    @param n1 {number} - any finite number    
    @param n2 {number} - any finite number
    @alias module:fp.isLT
    @return {boolean} true if the first number is less than the second 
    number, false otherwise
    @throws Exception: Both arguments of isLT must be numbers.
 */
var isLT = function (a,b) {
    if (isNumber(a) && isNumber(b))
	return a < b; 
    else
	throw new Error("Both arguments of isLT must be numbers.")	
}
/** isGT takes in two numbers and returns true if the first number is 
    greater than the second number, false otherwise
    @param n1 {number} - any finite number    
    @param n2 {number} - any finite number
    @alias module:fp.isGT
    @return {boolean} true if the first number is greater than the second 
    number, false otherwise
    @throws Exception: Both arguments of isGT must be numbers.
 */
var isGT = function (a,b) {
    if (isNumber(a) && isNumber(b))
	return a > b; 
    else
	throw new Error("Both arguments of isGT must be numbers.")	
}
// this function is not exported
var makeArithmeticOp = function (name,f) {
    return function (a,b) {
	if (Number.isFinite(a) && Number.isFinite(b))
	    return f(a,b);
	else
	    throw new Error(name + " can only be called with two integers.");	
    };
}
/** add takes in two numbers and returns their sum
    @function 
    @param n1 {number} - any finite number    
    @param n2 {number} - any finite number
    @alias module:fp.add
    @return {number} the sum of the two inputs
    @throws Exception: Both arguments of add must be numbers.
 */
var add = makeArithmeticOp( "add", function (a,b) { return a+b; } );
/** sub takes in two numbers n1 and n2 and returns n1 - n2
    @function 
    @param n1 {number} - any finite number    
    @param n2 {number} - any finite number
    @alias module:fp.sub
    @return {number} the result of subtracting the second number from the first
    one
    @throws Exception: Both arguments of sub must be numbers.
 */
var sub = makeArithmeticOp( "sub", function (a,b) { return a-b; } );
/** mul takes in two numbers and returns their product
    @function 
    @param n1 {number} - any finite number    
    @param n2 {number} - any finite number
    @alias module:fp.mul
    @return {number} the result of multiplying the two input numbers
    @throws Exception: Both arguments of mul must be numbers.
 */
var mul = makeArithmeticOp( "mul", function (a,b) { return a*b; } );
/** div takes in two numbers n1 and n2 and returns n1 / n2
    @function
    @param n1 {number} - any finite number    
    @param n2 {number} - any finite number
    @alias module:fp.div
    @return {number} the result of dividing the first number by the second one
    @throws Exception: Both arguments of div must be numbers.
    @throws Exception: Division by zero.
 */
var div = makeArithmeticOp( "div", 
			    function (a,b) { 
				if (! isZero(b))
				    return a/b; 
				else
				    throw new Error('Division by zero.');
			    } );
/** pow takes in two numbers n1 and n2 and returns n1 ^ n2
    @function 
    @param n1 {number} - any finite number    
    @param n2 {number} - any finite number
    @alias module:fp.pow
    @return {number} the result of raising the first number to the second
    number's power
    @throws Exception: Both arguments of pow must be numbers.
 */
var pow = makeArithmeticOp( "pow", Math.pow);
/** max takes in two numbers n1 and n2 and returns the largest of the two
    @function 
    @param n1 {number} - any finite number    
    @param n2 {number} - any finite number
    @alias module:fp.max
    @return {number} the largest of the two input values
    @throws Exception: Both arguments of max must be numbers.
 */
var max = makeArithmeticOp( "max", Math.max);
/** min takes in two numbers n1 and n2 and returns the smallest of the two
    @function 
    @param n1 {number} - any finite number    
    @param n2 {number} - any finite number
    @alias module:fp.min
    @return {number} the smallest of the two input values
    @throws Exception: Both arguments of min must be numbers.
 */
var min = makeArithmeticOp( "min", Math.min);
/** compose takes in two functions of one argument f and g and 
    returns the function "f after g" that takes one argument and returns the
    result of applying f to the result of applying g to the argument
    @param f {Function} - any function of one argument
    @param g {Function} - any function of one argument
    @alias module:fp.compose
    @return {function} the function of one argument x that returns f( g(x) )
    @throws Exception: The first argument of compose must be a function of one argument.
    @throws Exception: The second argument of compose must be a function of one argument.
    @example fp.compose( fp.hd, fp.tl )([1,2,3]) returns 2 
 */
var compose = function (f,g) {
    if (typeof f !== 'function' ||
	f.length !== 1)
	throw new Error('The first argument of compose must be a function of one argument.');
    else if (typeof g !== 'function' ||
	g.length !== 1)
	throw new Error('The second argument of compose must be a function of one argument.');
    else
	return function (x) {
	    return f(g(x));
	};
}
/** map takes in a function f of one argument and a list aList, and returns the 
    list containing all of the values obtained by applying f to the
    elements of aList
    @param f {Function} - any function of one argument
    @param aList {list} - any list of values in the domain of f
    @alias module:fp.map
    @return {list} the list containing all of the values obtained by applying 
    f to the elements of the input list
    @throws Exception: The first argument of map must be a function of one argument.
    @throws Exception: The second argument of map must be a list.
    @example fp.map(fp.isNull, [[],[1],[]]) returns [true,false,true]
 */
var map = function (f,ns) {
    if (typeof f !== 'function' ||
	f.length !== 1)
	throw new Error('The first argument of map must be a function of one argument.');
    else if (! isList(ns))
	throw new Error('The second argument of map must be a list.');
    else if (isNull(ns))
	return [ ];
    else
	return cons(f(hd(ns)), map(f, tl(ns)));
}
/** filter takes in a predicate pred (i.e., a function of one argument that 
    returns a Boolean value) and a list aList, and returns the 
    list that contains all of the elements of aList for which pred returns true
    @param pred {Function} - any function of one argument
    @param aList {list} - any list of values in the domain of pred
    @alias module:fp.filter
    @return {list} the list containing only the elements of the input list
    that satisfy the input predicate
    @throws Exception: The first argument of filter must be a function of one argument.
    @throws Exception: The second argument of filter must be a list.
    @example fp.filter(fp.isZero, [0,1,2,2,1,0]) returns [0,0]
 */
var filter = function (pred,ns) {
    if (typeof pred !== 'function' ||
	pred.length !== 1)
	throw new Error('The first argument of filter must be a function of one argument.');
    else if (! isList(ns))
	throw new Error('The second argument of filter must be a list.');
    if (isNull(ns))
	return [ ];
    else if (pred(hd(ns)))
	return cons(hd(ns), 
                    filter(pred,tl(ns)));
    else 
        return filter(pred,tl(ns));
}
/** reduce takes in a function f of two arguments, a list and a single value 
    called the accumulator, and returns a single value that is a reduced version
    of the input list obtained by starting with the accumulator and applying f
    in succession to the updated value of the accumulator returned by the 
    previous call to f and the next element in the input list from left to 
    right (reduce is sometimes referred to as "fold left")
    @param f {Function} - any function of two arguments
    @param aList {list} - a list of values
    @param acc {} - an initial value
    @alias module:fp.reduce
    @return {list} the value 
    f(f( ... f(f(f(acc,E0),E1),E2), ... ),En) where aList is equal to 
    [E0,E1,E2,...,En]
    @throws Exception: The first argument of reduce must be a function of 
    two arguments.
    @throws Exception: The second argument of reduce must be a list.
    @example fp.reduce(fp.add,[1,2,3],4) returns 10, that is, ((4+1)+2)+3
    @example fp.reduce(fp.sub,[1,2,3],4) returns -2, that is, ((4-1)-2)-3
 */
var reduce = function (f,ns,acc) {
    if (typeof f !== 'function' ||
	f.length !== 2)
	throw new Error('The first argument of reduce must be a function of two arguments.');
    else if (! isList(ns))
	throw new Error('The second argument of reduce must be a list.');
    if (isNull(ns))
	return acc;
    else 
	return reduce(f,tl(ns),f(acc,hd(ns)));
}
/** reduceRight takes in a function f of two arguments, a list and a single 
    value called the accumulator, and returns a single value that is a reduced 
    version of the input list obtained by starting with the accumulator and 
    applying f in succession to the next element (from right to left) in the 
    input list and the updated value of the accumulator returned by the 
    previous call to f (reduceRight is sometimes referred to as "fold right")
    @param f {Function} - any function of two arguments
    @param aList {list} - a list of values
    @param acc {} - an initial value
    @alias module:fp.reduceRight
    @return {list} the value 
    f(E0,f( ... f(En-2,f(En-1,f(En,acc))) ... )) where aList is equal to 
    [E0,...,En-2,En-1,En]
    @throws Exception: The first argument of reduceRight must be a function of 
    two arguments.
    @throws Exception: The second argument of reduceRight must be a list.
    @example fp.reduceRight(fp.add,[1,2,3],4) returns 10, that is, 1+(2+(3+4))
    @example fp.reduceRight(fp.sub,[1,2,3],4) returns -2, that is, 1-(2-(3-4))
    @example fp.reduceRight(fp.cons,[1,2,3],[4,5,6]) returns [1,2,3,4,5,6]
 */
var reduceRight = function (f,ns,acc) {
    if (typeof f !== 'function' ||
	f.length !== 2)
	throw new Error('The first argument of reduceRight must be a function of two arguments.');
    else if (! isList(ns))
	throw new Error('The second argument of reduceRight must be a list.');
    if (isNull(ns))
	return acc;
    else 
	return f(hd(ns), reduceRight(f,tl(ns),acc) );
}
/** curry takes in a function of two arguments and returns the curried
    version of the input function
    @param f {Function} - any function of two arguments
    @alias module:fp.curry
    @return {Function} a function of x that returns a function of y that returns the result of calling the input function on x and y (in this order)
    @throws Exception: The argument of curry must be a function of two arguments.
 */
var curry = function (f) {
    if (typeof f !== 'function' ||
	f.length !== 2)
	throw new Error('The argument of curry must be a function of two arguments.');
    else
	return function (x) {
	    return function (y) {
		return f(x,y);
	    }
	}
}
/** curryFromRight takes in a function of two arguments and returns a curried
    version of the input function that takes in the second argument first
    @param f {Function} - any function of two arguments
    @alias module:fp.curryFromRight
    @return {Function} a function of y that returns a function of x that returns the result of calling the input function on x and y (in this order)
    @throws Exception: The argument of curryFromRight must be a function of two arguments.
 */
var curryFromRight = function (f) {
    if (typeof f !== 'function' ||
	f.length !== 2)
	throw new Error('The argument of curryFromRight must be a function of two arguments.');
    else
	return function (y) {
	    return function (x) {
		return f(x,y);
	    }
	}
}

exports.hd = hd;
exports.tl = tl;
exports.cons = cons;
exports.isList = isList;
exports.isNull = isNull;
exports.isEq = isEq;
exports.isGT = isGT;
exports.isLT = isLT;
exports.isZero = isZero;
exports.isMember = isMember;
exports.makeList = makeList;
exports.append = append;
exports.reverse = reverse;
exports.isNumber = isNumber;
exports.add = add;
exports.sub = sub;
exports.mul = mul;
exports.div = div;
exports.pow = pow;
exports.max = max;
exports.min = min;
exports.compose = compose;
exports.map = map;
exports.filter = filter;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.curry = curry;
exports.curryFromRight = curryFromRight;

})(typeof exports === 'undefined' ? this['fp'] = {} : exports);

