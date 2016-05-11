selected = [];
function highlightBlocks(highlightList) {
    /*highlightList.forEach(function (id) {
        Blockly.mainWorkspace.highlightBlock(id);
    });*/
    Blockly.mainWorkspace.highlightBlock(highlightList[0].id);
    /*selected.forEach(function(block) {
        block.removeSelect();
    });
    selected = highlightList;
    selected.forEach(function(block) {
        block.addSelect();
    });*/
}
function mapBlocks() { 
    var all_blocks = Blockly.mainWorkspace.getAllBlocks();
    blockMap = {};
    all_blocks.forEach(function(elem) {
        if (elem.lineNumber in blockMap) {
            blockMap[elem.lineNumber].push(elem);
        } else {
            blockMap[elem.lineNumber] = [elem];
        }
    });
}
mapBlocks()
highlightBlocks(blockMap["5"])