var mmc = new JSAV("container");

var str = mmc.ds.array(['d','x','y','a','c','d','j','e']);
var str_label = mmc.label("string", {before: str});
mmc.umsg("This slideshow has been created to demonstrate how the MMC array is calculated for the Boyer-Moore Algorithm");
mmc.displayInit();
mmc.step();

mmc.umsg("The array is very easy to create. The first step we need to take is determining what our current set of potential characters is. For this example we will only be using lower case characters in the set {a,b,c ... y,z} aka our alphabet.");
mmc.step();

mmc.umsg("The point of the MMC array is to hold the distance from the end of the string to the right-most occurance of the current character in the alphabet being compared.");
mmc.step();

mmc.umsg("To exemplify what I mean by this we will first need our MMC array and alphabet...");
var alphabet = mmc.ds.array(['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']);
var alphabet_label = mmc.label("alphabet", {before: alphabet});
var mmc_array = mmc.ds.array([' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ']);
var mmc_array_label = mmc.label("MMC Array", {before: mmc_array});
mmc.step();

mmc.umsg("We will also use some simple pseudo-code to assist us in assigning values.");
var mmc_pseudo = mmc.code("p = current character in alphabet \nif alphabet[p] doesn't exist in string then: MMC[p] = string.length \nelse: MMC[p] = distance from right end of string to furthest right occurance of alphabet[p] in string.", {before: str_label});
mmc.step();

mmc.umsg("We see that alphabet[0] is 'a', 'a' occurs in our string 4 characters from the end, so we simply assign MMC[0] = 4");
mmc_pseudo.highlight(2);
str.highlight(3);
mmc_array.value(0, '4');
mmc_array.highlight(0);
alphabet.highlight(0);
mmc.step();

mmc_pseudo.unhighlight(2);
mmc_pseudo.highlight(1);
mmc_array.unhighlight(0);
mmc_array.highlight(1);
alphabet.unhighlight(0);
alphabet.highlight(1);
str.unhighlight(3);
mmc.umsg("We now move onto alphabet[1], which is 'b'. We know 'b' doesn't occur in our string so we just assign mmc_array[1] = string.length.");
mmc_array.value(1 ,'8');
mmc.step();

mmc.umsg("Filling in this array should be pretty trivial. This continues through the entire string to complete the MMC array, we will only go a few more steps before filling in the rest automatically.");
mmc_array.unhighlight(1);
alphabet.unhighlight(1);
mmc_pseudo.unhighlight(1);
mmc.step();

alphabet.highlight(2);
mmc_array.highlight(2);
mmc_array.value(2, '3');
mmc_pseudo.highlight(2);
str.highlight(4);
mmc.umsg("We will now check the 3rd character in our alphabet, 'c'. The right-most occurance of 'c' in our string is 3 spots from the end. MMC[2] = 3");
mmc.step();

alphabet.unhighlight(2);
mmc_array.unhighlight(2);
str.unhighlight(4);
alphabet.highlight(3);
mmc_array.highlight(3);
str.highlight(5);
mmc_array.value(3, '2');
mmc.umsg("We now look at the 4th character in our alphabet, 'd'. The character 'd' actually occurs twice in our string at string[0] and at string[5], but we only care about the right-most occurance. Therefore: MMC[3] = 2");
mmc.step();

mmc.umsg("With the information from the first few slides, the rest of the array's computation should be trivial... It will now be automatically calculated as a reference.");
alphabet.unhighlight(3);
mmc_array.unhighlight(3);
mmc_pseudo.unhighlight(2);
str.unhighlight(5);
mmc.step();

mmc.umsg("MMC array is now filled.");
for(var i = 4; i < mmc_array.size(); i++){
	mmc_array.value(i, '8');
}
mmc_array.value(4, '0');   	  //e
mmc_array.value(9, '1');      //j
mmc_array.value(23, '6');     //x
mmc_array.value(24, '5');     //y
mmc.step();

mmc.umsg("Note the values of the highlighted characters in the MMC array that occured in the string.");
mmc_array.highlight([4, 9, 23, 24]);
str.highlight([1,2,6,7]);
mmc.step();

mmc.umsg("The MMC array pre-computation is complete.");
mmc_array.unhighlight([4,9,23,24]);
str.unhighlight([1,2,6,7]);

mmc.recorded();