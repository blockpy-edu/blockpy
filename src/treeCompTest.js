/*
_accu_ = 0
_iList_ = [1,2,3,4]
for _item_ in _iList_:
    _accu_ = _accu_ + _item_
print(_accu_)
*/
/**
	parses code and returns a new EasyNode that is the root of the student
**/
function parseCode(studentCode){
	var stdAST;
	try{
		Sk.python3 = true;
	    var filename = '__main__'
		var studentParse = Sk.parse(filename,studentCode);
	    stdAST = Sk.astFromParse(studentParse.cst, filename, studentParse.flags);
	    stdAST = new EasyNode(stdAST, "none");
	} catch (studentError){
		console.log(studentParse);
		console.log(stdAST);
	    stdAST = null;
	}
	return stdAST;
}
function testShallowMatch(){
	console.log("TESTING VAR MATCH");
	var failCount = 0;
	var successCount = 0;
	//tests whether variables are stored correctly
	var testTree = new StretchyTreeMatcher("_accu_ = 0");

	//extracting instrutor name node
	var insAST = testTree.rootNode;
	var insNameNode = insAST.children[0].children[0];

	//creating student code
	var studentCode = "accumulator = 0";
	var stdAST = parseCode(studentCode);
	//extracting student name node
	var stdNameNode = stdAST.children[0].children[0];

	var mapping = testTree.shallowMatch(insNameNode, stdNameNode)[0];
	var debugPrint = false;
	if(!(mapping.mappings.keys[0] == insNameNode.astNode)){
		console.error("ins node match not correct in _var_ case");
		debugPrint = true;
		failCount++;
	}else
		successCount++;
	if(!(mapping.mappings.values[0] == stdNameNode.astNode)){
		console.error("std node match not correct in _var_ case");
		debugPrint = true;
		failCount++;
	}else
		successCount++;
	if(debugPrint){
		console.log(testTree);
		console.log(insNameNode);
		console.log(stdNameNode);
		console.log(mapping);
	}

	//tests whether expressions are stored correctly
	console.log("TESTING EXPRESSION MATCH");
	testTree = new StretchyTreeMatcher("__exp__ = 0");

	//extracting instrutor name node
	insAST = testTree.rootNode;
	insNameNode = insAST.children[0].children[0];

	//creating student code
	studentCode += "\nfor item in myList:\n    accumulator += item";
	stdAST = parseCode(studentCode);
	//extracting body node
	var stdForLoop = stdAST.children[1];

	mapping = testTree.shallowMatch(insNameNode, stdForLoop)[0];
	debugPrint = false;
	if(mapping){
		if(!(mapping.expTable.keys[0] == "__exp__")){
			debugPrint = true;
			failCount++;
			console.error("symbol match not found");
		}else
			successCount++;
		if(!(mapping.expTable.values[0] == stdForLoop.astNode)){
			debugPrint = true;
			failCount++;
			console.error("did not match to correct ast node");
		}else
			successCount++;
		}else{
			debugPrint = true;
			console.error("no mapping found");
			failCount++;
		}
	if(debugPrint){
		console.log(testTree);
		console.log(insNameNode);
		console.log(stdForLoop);
		console.log(mapping);
	}

	//tests whether Wild matches are stored correctly
	console.log("TESTING WILD CARD MATCH");
	testTree = new StretchyTreeMatcher("___ = 0");

	//extracting instrutor name node
	insAST = testTree.rootNode;
	insNameNode = insAST.children[0].children[0];

	//creating student code
	studentCode += "\nfor item in myList:\n    accumulator += item";
	stdAST = parseCode(studentCode);
	//extracting body node
	var stdForLoop = stdAST.children[1];
	debugPrint = false;
	mapping = testTree.shallowMatch(insNameNode, stdForLoop)[0];
	if(!mapping || (mapping.mappings.keys[0] != insNameNode.astNode && 
			mapping.mappings.values[0] != stdForLoop.astNode)){
		console.error("wild card match didn't match");
		debugPrint = true;
		failCount++;
	}else
		successCount++;
	if(debugPrint){
		console.log(testTree);
		console.log(insNameNode);
		console.log(stdForLoop);
		console.log(mapping);
	}

	console.log("TESTING MATCH ALL");
	testTree = new StretchyTreeMatcher("___ = 0");
	var insNumNode = insAST.children[0].children[1];

	//creating student code
	studentCode = "billy = 0";
	stdAST = parseCode(studentCode);
	//extracting body node
	var stdNumNode = stdAST.children[0].children[1];

	mapping = testTree.shallowMatch(insNumNode, stdNumNode)[0];
	debugPrint = false;
	if(mapping){
		if(mapping.mappings.keys[0] != insNumNode.astNode){
			console.error("ins node not matched correctly");
			debugPrint = true;
			failCount++;
		}else
			successCount++;
		if(mapping.mappings.values[0] != stdNumNode.astNode){
			console.error("student node not matched correctly");
			debugPrint = true;
			failCount++;
		}else
			successCount++;
		successCount++;
	}else{
		console.error("Match not found");
		debugPrint = true;
		failCount++;
	}
	if(debugPrint){
		console.log(testTree);
		console.log(stdNumNode);
		console.log(mapping);
	}
	return [failCount, successCount];
}

function testGenericMatch(){
	console.log("TESTING SAME ORDER");
	var failCount = 0;
	var successCount = 0;
	var stdCode = "_sum = 0\nlist = [1,2,3,4]\nfor item in list:\n    _sum = _sum + item\nprint(_sum)";
	var insCode = "_accu_ = 0\n_iList_ = __listInit__\nfor _item_ in _iList_:\n    _accu_ = _accu_ + _item_\nprint(_accu_)";
	//var stdCode = "_sum = 12 + 13";
	//var insCode = "_accu_ = 12 + 11";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);

	var mappingsArray = insTree.findMatches(stdAST.astNode);
	var mappings = mappingsArray[0];
	var debugPrint = false;
	if(!mappingsArray || mappings.mappings.size() != 19){
		debugPrint = true;
		failCount++;
		console.error("incorrect number of mappings found");
	}else
		successCount++;
	if(mappingsArray){
		if(mappings.symbolTable.size() != 3 ||
			mappings.symbolTable.values[0].length != 4 ||
			mappings.symbolTable.values[1].length != 2 ||
			mappings.symbolTable.values[2].length != 2){
			debugPrint = true;
			failCount++;
			console.error("inconsistent symbol matching");
		}else
		successCount++;
	}
	if(debugPrint){
		console.log(mappings);
		console.log(insAST.astNode);
		console.log(stdAST.astNode);
	}
	return [failCount, successCount];
}

function testManyToOne(){
	console.log("TESTING MANY TO ONE");
	var failCount = 0;
	var successCount = 0;
	var stdCode = "_sum = 0\nlist = [1,2,3,4]\nfor item in list:\n    _sum = _sum + item\nprint(_sum)";
	var insCode = "_accu_ = 0\n_iList_ = __listInit__\nfor _item_ in _iList_:\n    _accu_ = _accu2_ + _item_\nprint(_accu_)";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);


	var mappings = insTree.findMatches(stdAST.astNode)[0];
	var debugPrint = false;
	if(mappings){
		if(mappings.conflictKeys.length != 0){
			console.error("Conflicting keys when there shouldn't be");
			debugPrint = true;
			failCount++;
		}else
		successCount++;
		if(mappings.symbolTable.size() != 4 ||
			mappings.symbolTable.values[0].length != 3 ||
			mappings.symbolTable.values[1].length != 2 ||
			mappings.symbolTable.values[2].length != 2 ||
			mappings.symbolTable.values[3].length != 1){
			debugPrint = true;
			failCount++;
			console.error("inconsistent symbol matching");
		}else
		successCount++;
	}else{
		debugPrint = true;
		console.log("no mapping found");
	}
	if(debugPrint){
		console.log(insAST.astNode);
		console.log(stdAST.astNode);
		console.log(mappings);
	}
	return [failCount, successCount];
}

function testCommutativity(){
	console.log("TESTING COMMUTATIVITY ADDITION");
	var failCount = 0;
	var successCount = 0;
	var stdCode = "_sum = 0\nlist = [1,2,3,4]\nfor item in list:\n    _sum = item + _sum\nprint(_sum)";
	var insCode = "_accu_ = 0\n_iList_ = __listInit__\nfor _item_ in _iList_:\n    _accu_ = _accu_ + _item_\nprint(_accu_)";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);

	var mappings = insTree.findMatches(stdAST.astNode)[0];
	var debugPrint = false;
	if(mappings){
		if(mappings.conflictKeys.length != 0){
			debugPrint = true;
			failCount++;
			console.error("Conflicting keys in ADDITION when there shouldn't be");
		}else
			successCount++;
	}else{
		debugPrint = true;
		failCount++;
		console.error("No mapping found when mapping should have been found");
	}
	if(debugPrint){
		console.log(insAST.astNode);
		console.log(stdAST.astNode);
		console.log(mappings);
	}
	debugPrint = false;
	return [failCount, successCount];
}

function testOneToMany(){
	console.log("TESTING ONE TO MANY");
	var failCount = 0;
	var successCount = 0;
	var stdCode = "_sum = 0\nlist = [1,2,3,4]\nfor item in list:\n    _sum = _sum + _sum\nprint(_sum)";
	var insCode = "_accu_ = 0\n_iList_ = __listInit__\nfor _item_ in _iList_:\n    _accu_ = _accu_ + _item_\nprint(_accu_)";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);
	var mappings = insTree.findMatches(stdAST.astNode);
	var debugPrint = false;
	if(mappings){
		failCount++;
		console.error("found match when match shouldn't be found");
	}else
		successCount++;
	if(debugPrint){
		console.log(insAST.astNode);
		console.log(stdAST.astNode);
		console.log(mappings);
	}
	return [failCount, successCount];
}

function testMultiMatch(){
	console.log("TESTING MULTI-MATCH");
	var failCount = 0;
	var successCount = 0;
	var debugPrint = false;
	//var stdCode = "_sum = 0\ncount = 0\nlist = [1,2,3,4]\nfor item in list:\n    _sum = _sum + item\n    count = count + 1\nprint(_sum)";
	var stdCode = "_sum = 0\ncount = 0\n_list = [1,2,3,4]\nfor item in _list:\n    _sum = _sum + count\n    count = _sum + count\nprint(_sum)";
	var insCode = "_accu_ = 0\n_iList_ = __listInit__\nfor _item_ in _iList_:\n    _accu_ = _accu_ + __exp__\nprint(_accu_)";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);
	var mappings = insTree.findMatches(stdAST.astNode);

	if(mappings.length > 1){
		console.error("too many matchings found");
		failCount++;
		debugPrint = true;
	}else
		successCount++;
	if(debugPrint){
		console.log(insAST);
		console.log(stdAST);
		console.log(mappings);
	}

	debugPrint = false;
	var insCode = "_accu_ = 0\n_iList_ = __listInit__\nfor _item_ in _iList_:\n    _accu_ = _accu_ + __exp__";
	insTree = new StretchyTreeMatcher(insCode);
	insAST = insTree.rootNode;
	mappings = insTree.findMatches(stdAST.astNode);
	if(mappings.length < 2){
		console.error("Not enough mappings found");
		failCount++;
		debugPrint = true;
	}else
		successCount++;
	if(debugPrint){
		console.log(insAST);
		console.log(stdAST);
		console.log(mappings);
	}
	return [failCount, successCount];
}
function testPass(){
	console.log("TESTING PASS MATCH");
	var failCount = 0;
	var successCount = 0;
	var debugPrint = false;
	var stdCode = 'import matplotlib.pyplot as plt\nquakes = [1,2,3,4]\nquakes_in_miles = []\nfor quakes in quakes:\n    quakes_in_miles.append(quake * 0.62)\nplt.hist(quakes_in_miles)\nplt.xlabel("Depth in Miles")\nplt.ylabel("Number of Earthquakes")\nplt.title("Distribution of Depth in Miles of Earthquakes")\nplt.show()';
	var insCode = "for _item_ in _item_:\n    pass";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);
	var mappings = insTree.findMatches(stdAST.astNode);
	if(!mappings){
		console.error("mapping should have been found");
		failCount++;
		debugPrint = true;
	}else
		successCount++;
	if(debugPrint){
		console.log(insAST);
		console.log(stdAST);
		console.log(mappings);
	}
	return [failCount, successCount];
}
function testMetaStretch(){
	console.log("TESTING META STRETCH");
	var failCount = 0;
	var successCount = 0;
	var debugPrint = false;
	var stdCode = 'steps_hiked_list = [1,2,3,4]\n' +
					'total = 0\n' +
					'for steps_hiked in steps_hiked_list:\n' +
					'    total = steps_hiked + total\n    steps = steps + 1';
	var insCode = "for ___ in ___:\n" +
					"    ___ = _sum_ + ___";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);
	var mappings = insTree.findMatches(stdAST.astNode);
	if(!mappings){
		console.error("mapping should have been found");
		failCount++;
		debugPrint = true;
	}else{
		if (mappings.length != 3){
			console.log("Should find exactly 3 matches, instead found " + mappings.length)
			failCount++;
			debugPrint = true;
		}else
			successCount++;
	}
	if(debugPrint){
		console.log(insAST);
		console.log(stdAST);
		console.log(mappings);
	}
	return [failCount, successCount];
}

function tabulateResults(currentCounts, result){
	currentCounts[0] += result[0];
	currentCounts[1] += result[1];
	return currentCounts;
}

function runTreeCompTestSuiteHelper(){
	var currentCounts = [0, 0];
	tabulateResults(currentCounts, testShallowMatch());
	tabulateResults(currentCounts, testGenericMatch());
	tabulateResults(currentCounts, testManyToOne());
	tabulateResults(currentCounts, testCommutativity());
	tabulateResults(currentCounts, testOneToMany());
	tabulateResults(currentCounts, testMultiMatch());
	tabulateResults(currentCounts, testPass());
	tabulateResults(currentCounts, testMetaStretch());
	return currentCounts;
}

function runTreeCompTestSuite(){
	var result = runTreeCompTestSuiteHelper();
	console.log(result[0] + " out of " + (result[0] + result[1]) + " tests failed");
}
runTreeCompTestSuite();
