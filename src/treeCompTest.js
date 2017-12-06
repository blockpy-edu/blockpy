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
	    var studentParse = Sk.parse(filename,studentCode);
	    stdAST = Sk.astFromParse(studentParse.cst, filename, studentParse.flags);
	    stdAST = new EasyNode(stdAST, "none");
	} catch (studentError){
	    stdAST = null;
	}
	return stdAST;
}
function testShallowMatch(){
	console.log("TESTING VAR MATCH");
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

	var mapping = testTree.shallowMatch(insNameNode, stdNameNode);
	var debugPrint = false;
	if(!(mapping.mappings.keys[0] == insNameNode.astNode)){
		console.error("ins node match not correct in _var_ case");
		debugPrint = true;
	}
	if(!(mapping.mappings.values[0] == stdNameNode.astNode)){
		console.error("std node match not correct in _var_ case");
		debugPrint = true;
	}
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

	mapping = testTree.shallowMatch(insNameNode, stdForLoop);
	debugPrint = false;
	if(!(mapping.symbolTable.keys[0] == "__exp__")){
		debugPrint = true;
		console.error("symbol match not found");
	}
	if(!(mapping.symbolTable.values[0] == stdForLoop.astNode)){
		debugPrint = true;
		console.error("did not match to correct ast node");
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
	mapping = testTree.shallowMatch(insNameNode, stdForLoop);
	if(!mapping || (mapping.mappings.keys[0] != insNameNode.astNode && 
			mapping.mappings.values[0] != stdForLoop.astNode)){
		console.error("wild card match didn't match");
		debugPrint = true;
	}
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

	mapping = testTree.shallowMatch(insNumNode, stdNumNode);
	debugPrint = false;
	if(mapping){
		if(mapping.mappings.keys[0] != insNumNode.astNode){
			console.error("ins node not matched correctly");
			debugPrint = true;
		}
		if(mapping.mappings.values[0] != stdNumNode.astNode){
			console.error("student node not matched correctly");
			debugPrint = true;
		}
	}else{
		console.error("Match not found");
		debugPrint = true;
	}
	if(debugPrint){
		console.log(testTree);
		console.log(stdNumNode);
		console.log(mapping);
	}
}

function testGenericMatch(){
	console.log("TESTING SAME ORDER");
	var stdCode = "_sum = 0\nlist = [1,2,3,4]\nfor item in list:\n    _sum = _sum + item\nprint(_sum)";
	var insCode = "_accu_ = 0\n_iList_ = __listInit__\nfor _item_ in _iList_:\n    _accu_ = _accu_ + _item_\nprint(_accu_)";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);

	var mappings = insTree.findMatches(stdAST.astNode);
	var debugPrint = true;
	if(mappings.mappings.size() != 17 && mappings.mappings.size() != 19){
		debugPrint = true;
		console.error("incorrect number of mappings found");
	}
	if(mappings.symbolTable.size() != 3 ||
		mappings.symbolTable.values[0].length != 4 ||
		mappings.symbolTable.values[1].length != 2 ||
		mappings.symbolTable.values[2].length != 2){
		debugPrint = true;
		console.error("inconsistent symbol matching");
	}
	if(debugPrint){
		console.log(mappings);
		console.log(insAST.astNode);
		console.log(stdAST.astNode);
	}
}

function testManyToOne(){
	console.log("TESTING MANY TO ONE");
	var stdCode = "_sum = 0\nlist = [1,2,3,4]\nfor item in list:\n    _sum = _sum + item\nprint(_sum)";
	var insCode = "_accu_ = 0\n_iList_ = __listInit__\nfor _item_ in _iList_:\n    _accu_ = _accu2_ + _item_\nprint(_accu_)";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);


	var mappings = insTree.findMatches(stdAST.astNode);

	if(mappings.conflictKeys.length != 0){
		console.error("Conflicting keys when there shouldn't be");
		console.log(insAST.astNode);
		console.log(stdAST.astNode);
		console.log(mappings);
	}
}

function testCommutativity(){
	console.log("TESTING COMMUTATIVITY ADDITION");
	var stdCode = "_sum = 0\nlist = [1,2,3,4]\nfor item in list:\n    _sum = item + _sum\nprint(_sum)";
	var insCode = "_accu_ = 0\n_iList_ = __listInit__\nfor _item_ in _iList_:\n    _accu_ = _accu_ + _item_\nprint(_accu_)";
	var insTree = new StretchyTreeMatcher(insCode);
	var insAST = insTree.rootNode;
	var stdAST = parseCode(stdCode);

	var mappings = insTree.findMatches(stdAST.astNode);
	var debugPrint = false;
	if(mappings.conflictKeys.length != 0){
		debugPrint = true;
		console.error("Conflicting keys in ADDITION when there shouldn't be");
	}
	if(debugPrint){
		console.log(insAST.astNode);
		console.log(stdAST.astNode);
		console.log(mappings);
	}
	debugPrint = false;
}

function runTreeCompTestSuite(){
	testShallowMatch();
	testGenericMatch();
	testManyToOne();
	testCommutativity();
	
}

runTreeCompTestSuite();