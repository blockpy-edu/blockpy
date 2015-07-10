/* global SLang : true */

(function () {

"use strict";

var samples = [

/* 0 */   "",
/* 1 */   ["basics of OOP", 
           "class Point extends Object {\n" +
	   "   protected x\n" +
	   "   protected y\n" +
	   "   method initialize (initx, inity) { set x = initx; set y = inity }\n" +
	   "   method move (dx,dy) { set x = (x + dx); set y = (y + dy) }\n" +
	   "   method printLocation () { print \"x\" x; print \"y\" y }\n" +
	   "}\n" +
           "class ColorPoint extends Point {\n" +
	   "   protected color\n" +
	   "   method setColor (c) { set color = c }\n" +
	   "   method getColor ()  { color }\n" +
	   "}\n\n" +
	   "public class Driver extends Object {\n" +
	   "   method main() {\n" +
	   "     let\n" +
           "         p = new Point(3,4)\n" +
           "         cp = new ColorPoint(10,20)\n" + 
	   "     in\n" +
	   "        call p.move(3,4);\n" +
	   "        call cp.setColor(87);\n" +
	   "        call cp.move(10,20);\n" +
	   "        call p.printLocation();\n" +
	   "        call cp.printLocation();\n" +
	   "        print \"color\" call cp.getColor()\n" +
	   "     end\n" +
	   "   }\n" +
	   "}"
          ],
/* 2 */   ["this", 
	   "class OddEven extends Object {\n" +
	   "   method initialize () { 1 }\n" +
	   "   method even (n)      { if (n > 0) then call this.odd( (n-1) ) else 1 }\n" +
	   "   method odd (n)       { if (n > 0) then call this.even( (n-1) ) else 0 }\n" +
	   "}\n\n" +
	   "public class Driver extends Object {\n" +
	   "   method main() {\n" +
	   "      let\n" +
           "           o1 = new OddEven()\n" +
	   "      in\n" +
           "           call o1.odd(13)\n" +
	   "      end\n" +
	   "   }\n" +
	   "}"
          ],
/* 3 */   ["polymorphism", 
	   "class InteriorNode extends Object {\n" +
	   "   protected left\n" +
	   "   protected right\n" +
	   "   method initialize (l,r) { set left = l; set right = r }\n" +
	   "   method sum ()           { (call left.sum() + call right.sum()) }\n" +
	  "}\n\n" +
	   "class LeafNode extends Object {\n" +
	   "   protected value\n" +
	   "   method initialize (v)   { set value = v }\n" +
	   "   method sum ()           { value }\n" +
	  "}\n\n" +
	   "public class Driver extends Object {\n" +
	   "   method main() {\n" +
	   "      let\n" +
           "           o1 = new InteriorNode( new InteriorNode( new LeafNode(3), new LeafNode(4)),\n" +
           "                                  new LeafNode(5))\n" +
	   "      in\n" +
           "          call o1.sum()\n" +
	   "      end\n" +
	   "   }\n" +
	   "}\n" 
	   ],
/* 4 */   ["shadowing", 
	   "class C1 extends Object {    \n" +
	   "   protected x   \n" +
	   "   protected y\n" +
	   "   method initialize () { 1 }\n" +
	   "   method setx1 (v)     { set x = v }\n" +
	   "   method sety1 (v)     { set y = v }\n" +
	   "   method getx1 ()      { x } \n" +
	   "   method gety1 ()      { y }\n" +
	   "}\n\n" +
	   "class C2 extends C1 {\n" +
	   "   protected y\n" +
	   "   method sety2 (v)     { set y = v }\n" +
	   "   method getx2 ()      { x } \n" +
	   "   method gety2 ()      { y }\n" +
	   "}\n\n" +
	   "public class Driver extends Object {\n" +
	   "   method main()  {\n" +
	   "      let\n" +
           "          o2 = new C2()\n" +
	   "      in \n" +
           "          call o2.setx1(101);\n" +
           "          call o2.sety1(102);\n" +
           "          call o2.sety2(999);\n" +
           "          print \"x1\" call o2.getx1();\n" +
           "          print \"y1\" call o2.gety1();\n" +
           "          print \"x2\" call o2.getx2();\n" +
           "          print \"y2\" call o2.gety2()\n" +
	   "      end\n" +
	   "   }\n" +
	   "}\n" 
	   ],
/* 5 */   ["method override", 
	   "class C1 extends Object {\n" +
	   "   method initialize () { 1 }\n" +
	   "   method m1 ()         { 1 }\n" +
	   "   method m2 ()         { call this.m1() }\n" +
	   "}\n\n" +
	   "class C2 extends C1 {\n" +
	   "   method m1 ()         { 2 }\n" +
	   "}\n\n" +
	   "public class Driver extends Object {\n" +
	   "   method main() {\n" +
	   "      let\n" +
           "          o1 = new C1()\n" +
           "          o2 = new C2()\n" +
	   "      in\n" +
           "          print \"o1_m1\" call o1.m1();\n" +
           "          print \"o2_m1\" call o2.m1();\n" +
           "          print \"o2_m2\" call o2.m2()\n" +
	   "      end\n" +
	   "   }\n" +
	   "}\n"
	  ],
/* 6 */   ["super", 
	   "class C1 extends Object {\n" +
	   "   method initialize () { 1 }\n" +
	   "   method m1 ()         { call this.m2() }\n" +
	   "   method m2 ()         { 13 }\n" +
	   "}\n" +
	   "class C2 extends C1 {\n" +
	   "   method m1 ()         { 22 }\n" +
	   "   method m2 ()         { 23 }\n" +
	   "   method m3 ()         { call super.m1() }\n" +
	   "}\n\n" +
	   "class C3 extends C2 {\n" +
	   "   method m1 ()         { 32 }\n" +
	   "   method m2 ()         { 33 }\n" +
	   "}\n\n" +
	   "public class Driver extends Object {\n" +
	   "   method main() {\n" +
	   "      let\n" +
	   "          o3 = new C3()\n" +
	   "      in \n" +
	   "          print call o3.m3()\n" +
	   "      end\n" +
	   "   }\n" +
	   "}\n"
	  ]
];
	   
SLang.samples = samples;

}());
