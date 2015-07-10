/* global SLang : true */

(function () {

"use strict";

var samples = [

/* 0 */   "",
/* 1 */   [ "test 1",
	    "letrec\n" +
	    "        fact = fn (n) => if (n === 0) then 1 else (n * (fact (n-1)))\n" +
	    "in\n" +
	    "   (fact 5)\n" +
	    "end"
          ],
/* 2*/    [ "test 1",
            "let\n" +
	    "    fact = fn (n) =>\n" +
	    "               let\n" +
	    "                   result = 1\n" +
	    "               in\n" +
	    "                   while (n>1)\n" +
	    "                   {\n" +
	    "                      set result = (result * n);\n" +
	    "                      set n = (n - 1)\n" +
	    "                   };\n" +
	    "                   result\n" +
	    "               end\n" + 
	    "in\n" +
	    "     (fact 5)\n" +
	    "end"
          ],
/* 1 */   [ "test 1",
            "let\n" +
	    "   p = 3\n" +
	    "in\n" +
	    "   let\n" +
            "       foo = fn (h,o,m) =>\n" +
            "               let\n" +
            "                   dummy = 1\n" +
            "               in\n" +
            "                   print \"in_foo\" : ;\n" +
            "                   set o = p;\n" +
            "                   set h = (m + p);\n" +
            "                   set p = m;\n" +
            "                   set m = (p + m);\n" +
            "                   print \"h\" h;\n" +
	    "                   print \"o\" o;\n" +
            "                   print \"m\" m\n" +
            "               end\n" +
	    "   in\n" +
            "       let\n" +
            "            main = fn () =>\n" +
            "                     let\n" +
            "                          b = 5\n" +
            "                          c0 = 6\n" +
            "                          c1 = 1\n" +
            "                          c2 = 3\n" +
            "                          c3 = 5\n" +
            "                     in\n" +
            "                          (foo b b c0);\n" +
            "                          print \"in_main\" : ;\n" +
            "                          print \"b\" b;\n" +
            "                          print \"c0\" c0;\n" +
            "                          print \"c1\" c1;\n" +
            "                          print \"c2\" c2;\n" +
            "                          print \"c3\" c3\n" +
            "                     end\n" +
            "       in\n" +
            "            (main);\n" +
            "            print \"after_main\" : ;\n" +
            "            print \"p\" p\n" +
            "       end\n" +
	    "   end\n" +
	    "end\n"
          ],
          [ "test2",
	    "let\n" +
	    "    m0 = 2   m1 = 3   m2 = 8   m3 = 5\n" +
	    "    b = 8\n" +
	    "in\n" +
	    "    let\n" +
            "        foo = fn (m,p) =>\n" +
            "                 let\n" +
            "                     d = 8\n" +
            "                 in\n" +
            "                     print \"in_foo\" : ;\n" +
            "                     set p = (b + m);\n" +
            "                     set b = p;\n" +
            "                     set m = (b + p);\n" +
            "                     set d = (m + p);\n" +
            "                     print \"d\" d;\n" +
            "                     print \"m\" m;\n" +
            "                     print \"p\" p\n" +
            "                  end\n" +
            "    in\n" +
	    "        let\n" +
	    "            b = 5\n" +
            "            j0 = 7   j1 = 9   j2 = 10   j3 = 9\n" +
            "        in\n" + 
            "            (foo b j3);\n" +
            "            print \"in_main\" : ;\n" +
            "            print \"b\" b;\n" +
            "            print \"j0\" j0;\n" +
            "            print \"j1\" j1;\n" +
            "            print \"j2\" j2;\n" +
            "            print \"j3\" j3\n" +
            "        end\n" +
	    "    end;\n" +
	    "    print \"globals\" : ;\n" +
	    "    print \"m0\" m0;\n" +
	    "    print \"m1\" m1;\n" +
	    "    print \"m2\" m2;\n" +
	    "    print \"m3\" m3;\n" +
	    "    print \"b\" b\n" +
	    "end"
          ]
]

SLang.samples = samples;

}());
