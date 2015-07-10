/*
	This file is associated with Boyer_Moore_Algorithm_Slideshow.html
	-Samuel Micka
*/

var bm = new JSAV("container");

bm.umsg("This exercise will demonstrate how the Boyer-Moore String searching algorithm works as a whole. Below you will find a master string and sub string (Master and Sub respectively) and the pseudo code you will need.");
var master = bm.ds.array(['c','d','b','a','d','a','d','b','b','b','a','b','j','c','d','b','a','b','a']);
var master_label = bm.label("Master", {left: "40px", top: "160px"});
var sub = master.clone();
sub.value(0,'c');
sub.value(1,'d');
sub.value(2,'b');
sub.value(3,'a');
sub.value(4,'b');
sub.value(5,'a');
for(var i = 6; i < sub.size(); i++){
	sub.value(i, ' ');
}
sub.show();
var sub_label = bm.label("Sub", {left: "40px", top: "222px"});
var pseudo = bm.code("m = Sub.length - 1 \nwhile m < Master.length: \n\ts = Sub.length - 1 \n\twhile s >= 0 and Master[m] = Sub[s]: m = m-1, s = s-1 \n\tif s < 0: return m+1 \n\telse: m = m + larger_of(MMC[master[m]], Align[s]) \nreturn -1", {before: master});
bm.displayInit();
bm.step();

bm.umsg("We note that the algorithm uses the MMC and Alignment arrays we talked about earlier to compute offsets, so we will also need those...");
bm.step();

bm.umsg("For the MMC array we will assume our current alphabet accounts for letters {a-z} all lower case. The MMC will be formated as: [letter shift] to make it easier to read. Now we that we have all our precomputations done we can begin the algorithm.");
var mmc = bm.ds.array(['a 0','b 1','c 5','d 4','e 6','f 6','g 6','h 6','i 6','j 6','k 6','l 6','m 6','n 6','o 6','p 6','q 6','r 6','s 6','t 6','u 6','v 6','w 6','x 6','y 6','z 6']);
var mmc_label = bm.label("MMC Array", {left: "40px", top: "285px"});
var alignment_table = bm.ds.array(['11','10','9','4','3','1'], {indexed: true});
var alignment_table_label = bm.label("Align Array", {left: "40px", top: "360px"});
bm.step();

bm.umsg("We will also introduce some important variables that we will keep track of throughout the algorithm: m and s (located to the left of the pseudo code).");
var m = bm.variable(["0"],{visible: true, label: "m = ", left: "150px", top: "200px"});
var s = bm.variable(["0"], {visible: true, label: "s = ", left: "150px", top: "230px"});
bm.step();

bm.umsg("The first important thing we want to note is where m and s start, they start at the length of Sub - 1, meaning our comparisons will start at the end of the sub string and work towards the beginning.");
pseudo.highlight([0,2]);
m.value("5");
s.value("5");
bm.step();

bm.umsg("Lets get started...");
pseudo.unhighlight([0,2]);
bm.step();

bm.umsg("We first notice that s >= 0 and Master[5] == Sub[5] (a == a), therefore we enter our while loop and decrement m and s by one.");
s.value("4");
m.value("4");
master.highlight(5);
sub.highlight(5);
pseudo.setCurrentLine(3);
bm.step();

bm.umsg("We then realize that Master[4] != Sub[4] so we don't enter the while loop again. We also note that s is not less than 0, which makes us enter the else statement on line 5.");
master.unhighlight(5);
sub.unhighlight(5);
master.highlight(4);
sub.highlight(4);
pseudo.setCurrentLine(5);
bm.step();

bm.umsg("We now need to figure out which value is larger: MMC[d] or Align[4], then we take that value and add it to m.");
mmc.highlight(3);
alignment_table.highlight(4);
bm.step();

bm.umsg("We see that MMC[d] is 4, which is larger than Align[4] which is only 3. This means we take the value we got from MMC and add it to m: 4+4 = 8.");
alignment_table.unhighlight(4);
m.value("8");
bm.step();

bm.umsg("We now shift to compare our new values... We also must note that s is reset to the length of Sub - 1.");
s.value("5");
mmc.unhighlight(3);
sub.unhighlight(4);
master.unhighlight(4);
sub.highlight(8);
master.highlight(8);
pseudo.setCurrentLine(2);
for(var x = sub.size()-1; x > 2; x--){
    sub.value(x, sub.value(x-3));
}
for(var x = 0; x < 3; x++) {
	sub.value(x, ' ');
}
bm.step();

bm.umsg("We note that Master[8] != Sub[5] (b != a), so we will skip our while loop and go down to our else statement because s isn't less than 0.");
pseudo.setCurrentLine(5);
bm.step();

bm.umsg("We will now calculate the larger jump again between MMC[b] and Align[5]...");
mmc.highlight(1);
alignment_table.highlight(5);
bm.step();

bm.umsg("We note that Align[5] = 1, which is equal to MMC[b], so m is now = m + 1. That means we are now comparing Sub[5] to Master[9]...");
master.unhighlight(8);
sub.unhighlight(8);
master.highlight(9);
sub.highlight(9);
mmc.unhighlight(0);
m.value("9");
for(var x = sub.size()-1; x > 0; x--){
    sub.value(x, sub.value(x-1));
}
bm.step();

bm.umsg("Master[9] != Sub[5] so we never enter our while loop, and we actually go right back down to the else statement because s is >= 0...");
pseudo.setCurrentLine(3);
alignment_table.unhighlight(5);
bm.step();

bm.umsg("We will now compare the values returned from MMC[b] and Align[5] to find the larger jump.");
pseudo.setCurrentLine(5);
alignment_table.highlight(5);
mmc.highlight(1);
bm.step();

bm.umsg("We note they are both 1, so it doesn't really matter which one we choose because m = m + 1 either way.");
bm.step();

bm.umsg("We now increment m and realign the sub string with the correct index of master.");
m.value("10");
mmc.unhighlight(1);
alignment_table.unhighlight(5);
sub.unhighlight(9);
master.unhighlight(9);
sub.highlight(10);
master.highlight(10);
for(var x = sub.size()-1; x > 0; x--){
    sub.value(x, sub.value(x-1));
}
bm.step();

bm.umsg("We see that s is still assigned to Sub length - 1 but Master[10] == Sub[5]: we get to enter our while loop and decrement m and s by 1.");
pseudo.setCurrentLine(3);
bm.step();

bm.umsg("m is now 9 and s is now 4...");
s.value("4");
m.value("9");
master.unhighlight(10);
sub.unhighlight(10);
master.highlight(9);
sub.highlight(9);
bm.step();

bm.umsg("We notice that we find another match at Master[9] and Sub[4] so we will stay in our while loop again and decrement m and s by 1.");
bm.step();

bm.umsg("m is now 8 and s is now 3...");
s.value("3");
m.value("8");
master.unhighlight(9);
sub.unhighlight(9);
master.highlight(8);
sub.highlight(8);
bm.step();

bm.umsg("Unfortunately Master[8] != Sub[3], so we break out of our loop and go down to our else since s is still positive.");
pseudo.setCurrentLine(5);
bm.step();

bm.umsg("We will now pick the larger value of MMC[b] and Align[3] to add onto m.");
mmc.highlight(1);
alignment_table.highlight(3);
bm.step();

bm.umsg("We note that Align[3] = 4 which is greater than MMC[b] which returns 1. That means that m is now m + 4...");
mmc.unhighlight(1);
bm.step();

bm.umsg("We reset m to 12, and we note that we end up back at the beginning of our loop, reseting s to Sub length - 1.");
s.value("5");
m.value("12");
alignment_table.unhighlight(3);
for(var x = sub.size()-1; x > 1; x--){
    sub.value(x, sub.value(x-2));
}
sub.unhighlight(8);
master.unhighlight(8);
sub.highlight(12);
master.highlight(12);
pseudo.setCurrentLine(2);
bm.step();

bm.umsg("We see right away that Master[12] != Sub[5] so we skip over our while loop and jump right down to the else statement since s is still positive...");
pseudo.setCurrentLine(5);
bm.step();

bm.umsg("We need to find the larger returned value between MMC[j] and Align[5].");
mmc.highlight(9);
alignment_table.highlight(5);
bm.step();

bm.umsg("MMC[j] returns 6, which is an obvious winner over 1. We get to reassign m = m + 6");
alignment_table.unhighlight(5);
bm.step();

bm.umsg("m = 12 + 6, we realign Sub and start the loop over...");
m.value("18");
mmc.unhighlight(9);
for(var x = sub.size()-1; x > 5; x--){
    sub.value(x, sub.value(x-6));
}
sub.unhighlight(12);
master.unhighlight(12);
sub.highlight(18);
master.highlight(18);
pseudo.setCurrentLine(2);
bm.step();

bm.umsg("We enter our while loop because Master[18] == Sub[5] and we decrement s and m by 1...");
pseudo.setCurrentLine(3);
bm.step();

bm.umsg("m = 17, s = 4");
s.value("4");
m.value("17");
master.unhighlight(18);
sub.unhighlight(18);
master.highlight(17);
sub.highlight(17);
bm.step();

bm.umsg("We continue in our while loop because Master[17] == Sub[4], setting m = 16, and s = 3.");
bm.step();

bm.umsg("m = 16, s = 3");
s.value("3");
m.value("16");
master.unhighlight(17);
sub.unhighlight(17);
master.highlight(16);
sub.highlight(16);
bm.step();

bm.umsg("We continue in our while loop because Master[16] == Sub[3], setting m = 15, and s = 2.");
bm.step();

bm.umsg("m = 15, s = 2");
s.value("2");
m.value("15");
master.unhighlight(16);
sub.unhighlight(16);
master.highlight(15);
sub.highlight(15);
bm.step();

bm.umsg("We continue in our while loop because Master[15] == Sub[2], setting m = 14, and s = 1.");
bm.step();

bm.umsg("m = 14, s = 1");
s.value("1");
m.value("14");
master.unhighlight(15);
sub.unhighlight(15);
master.highlight(14);
sub.highlight(14);
bm.step();

bm.umsg("We continue in our while loop because Master[14] == Sub[1], setting m = 13, and s = 0.");
bm.step();

bm.umsg("m = 13, s = 0");
s.value("0");
m.value("13");
master.unhighlight(14);
sub.unhighlight(14);
master.highlight(13);
sub.highlight(13);
bm.step();

bm.umsg("We continue in our while loop because Master[13] == Sub[0], setting m = 12, and s = -1.");
bm.step();

bm.umsg("m = 12, s = -1");
s.value("-1");
m.value("12");
master.unhighlight(13);
sub.unhighlight(13);
bm.step();

bm.umsg("It is important to note that our while loop now ends because s is no longer positive...");
pseudo.setCurrentLine(4);
bm.step();

bm.umsg("We make it into the if statement on line 5 and return m + 1, which is 13...");
bm.step();

bm.umsg("13 is the index at which Sub occurs in Master so the answer is correct.");
for(var i = 13; i < master.size(); i++) {
  sub.css(i, {"background-color": "#33FF33"});
  master.css(i, {"background-color": "#33FF33"});      
}



bm.recorded();