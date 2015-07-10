/*global ok,test,module,deepEqual,equal,expect,equals,notEqual,strictEqual */
(function() {
  module("jsav.utils.rand", {  });
  test("seeding random", function() {
    var r = JSAV.utils.rand,
      seed = new Date().getTime();
    r.seedrandom(seed);
    var rand1 = r.random(),
        rand2 = r.random();
    r.seedrandom(seed);
    equal(r.random(), rand1);
    equal(r.random(), rand2);
    
    // ..different seed, different numbers
    r.seedrandom(seed + 1);
    notEqual(r.random(), rand1);
    notEqual(r.random(), rand2);
  });
  test("numKey(s)", function() {
    var r = JSAV.utils.rand,
      seed = new Date().getTime(),
      fixedseed = "satunnaisuutta";
    // min inclusive, max exclusive
    equal(r.numKey(4, 5), 4);
    
    r.seedrandom(fixedseed);
    var res = [31, 94, 49, 8, 26, 90, 9, 45, 78, 89];
    for (var i= 0; i < res.length; i++) {
      equal(r.numKey(1, 99), res[i]);
    }
    r.seedrandom(fixedseed);
    deepEqual(r.numKeys(1, 99, 10), res);

    // empty array
    deepEqual(r.numKeys(1, 2, 0), []);
    // min inclusive, max exclusive
    deepEqual(r.numKeys(1, 2, 1), [1]);
    deepEqual(r.numKeys(1, 2, 10), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
    // default sorting
    r.seedrandom(fixedseed);
    deepEqual(r.numKeys(1, 99, 10, {sorted: true}), [8, 9, 26, 31, 45, 49, 78, 89, 90, 94]);
    // custom sorting, same as default
    r.seedrandom(fixedseed);
    deepEqual(r.numKeys(1, 99, 10, {sorted: true, sortfunc: function(a, b) {return a - b;}}),
          [8, 9, 26, 31, 45, 49, 78, 89, 90, 94]);
    // custom sorting, desc order
    r.seedrandom(fixedseed);
    deepEqual(r.numKeys(1, 99, 10, {sorted: true, sortfunc: function(a, b) {return b - a;}}),
          [94, 90, 89, 78, 49, 45, 31, 26, 9, 8]);
  });
  test("sample", function() {
    var r = JSAV.utils.rand,
      seed = new Date().getTime(),
      fixedseed = "satunnaisuutta",
      values = [31, 94, 49, 8, 26, 90, 9, 45, 78, 89];

    equal(r.sample([], 1), undefined, "Sampling more than there are items should return undefined");
    equal(r.sample([2, 4], 3), undefined);
    equal(r.sample([2, 4], -3), undefined, "Negative values should return undefined");
    deepEqual(r.sample([2, 5], 0), [], "Sampling 0 items should return an empty array");

    r.seedrandom(fixedseed);
    var res = r.sample(values, 7);
    equal(res.length, 7);
    deepEqual(res, [8, 89, 90, 31, 49, 94, 9]);
  });
  test("iterable array", function() {
    var arr = [9, 8, 7, 6],
        iter = JSAV.utils.iterable(arr);
    notEqual(arr, iter);
    for (var i = 0, l = arr.length; i < l; i++) {
      ok(iter.hasNext());
      equal(arr[i], iter.next());
    }
    ok(!iter.hasNext());
    for (i = 0, l = arr.length; i < l; i++) {
      equal(arr[i], iter[i]);
    }
    // reset iterator
    iter.reset();
    for (i = 0, l = arr.length; i < l; i++) {
      ok(iter.hasNext());
      equal(arr[i], iter.next());
    }
    ok(!iter.hasNext());
    for (i = 0, l = arr.length; i < l; i++) {
      equal(arr[i], iter[i]);
    }
  });
})();
