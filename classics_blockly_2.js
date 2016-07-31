var INDEXES = [
    ["(None)", "(None)"],
    ["Author", "Author"],
    ["Birth", "Birth"]
];

var INDEX_VALUES = {
    "(None)": [],
    "Author": [
        ["Edgar Allen Poe", "Edgar Allen Poe"],
        ["Mark Twain", "Mark Twain"]
    ],
    "Birth": [
        ["1972", "1972"],
        ["1973", "1973"],
        ["1974", "1974"]
    ]
}

var PROPERTIES = [
    ["Birth", "Birth"] ,
    ["Death", "Death"] ,
    ["Name", "Name"] ,
    ["Day", "Day"] ,
    ["Full Date", "Full Date"] ,
    ["Month", "Month"] ,
    ["Month Name", "Month Name"] ,
    ["Year", "Year"] ,
    ["Title", "Title"] ,
    ["Type", "Type"] ,
    ["Total", "Total"] ,
    ["Downloads", "Downloads"] ,
    ["ID", "ID"] ,
    ["Rank", "Rank"] ,
    ["Url", "Url"] ,
    ["Automated Readability Index", "Automated Readability Index"] ,
    ["Coleman Liau Index", "Coleman Liau Index"] ,
    ["Dale Chall Readability Score", "Dale Chall Readability Score"] ,
    ["Difficult Words", "Difficult Words"] ,
    ["Flesch Kincaid Grade", "Flesch Kincaid Grade"] ,
    ["Flesch Reading Ease", "Flesch Reading Ease"] ,
    ["Gunning Fog", "Gunning Fog"] ,
    ["Linear Write Formula", "Linear Write Formula"] ,
    ["Smog Index", "Smog Index"] ,
    ["Polarity", "Polarity"] ,
    ["Subjectivity", "Subjectivity"] ,
    ["Average Letter per Word", "Average Letter per Word"] ,
    ["Average Sentence Length", "Average Sentence Length"] ,
    ["Average Sentence per Word", "Average Sentence per Word"] ,
    ["Characters", "Characters"] ,
    ["Polysyllables", "Polysyllables"] ,
    ["Sentences", "Sentences"] ,
    ["Syllables", "Syllables"] ,
    ["Words", "Words"] 
];

Blockly.Blocks['classics_get'] = {
  init: function() {
      console.log("INIT:START")
    this.setColour(WEATHER_HUE);
    this.appendDummyInput('MAIN')
        .appendField("classics.get")
        .appendField(new Blockly.FieldDropdown(PROPERTIES), "PROPERTY")
        .appendField("filter")
        .appendField(new Blockly.FieldDropdown(INDEXES, function(option) {
                        this.sourceBlock_.updateShape_(option);
                    }), "INDEX")
    this.updateShape_();
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns a list of Classics data.');
    console.log("INIT:END")
  },
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('index', this.getFieldValue('INDEX'));
    container.setAttribute('index_value', this.getFieldValue('INDEX_VALUE'));
    return container;
  },
  domToMutation: function(xmlElement) {
      console.log("DTM:START", xmlElement)
    var index = xmlElement.getAttribute('index');
    var index_value = xmlElement.getAttribute('index_value');
    this.updateShape_(index, index_value);
    console.log("DTM:END")
  },
  updateShape_: function(index, index_value) {
    console.log(this);
    // Add or remove a Value Input.
    var inputGroup = this.getInput('MAIN')
    var fieldExists = this.getField('INDEX_VALUE');
    if (fieldExists) {
        inputGroup.removeField('INDEX_VALUE');
    }
    this.setFieldValue(index, 'INDEX');
    if (index != undefined && index != '(None)') {
        inputGroup.appendField(new Blockly.FieldDropdown(INDEX_VALUES[index]), 'INDEX_VALUE')
        if (index_value != undefined) {
            this.setFieldValue(index_value, 'INDEX_VALUE');
        } else {
            console.log(INDEX_VALUES[index])
            this.setFieldValue(INDEX_VALUES[index][0][0], 'INDEX_VALUE');
        }
    }    
  }
};

Blockly.Python['classics_get'] = function(block) {
    Blockly.Python.definitions_['import_classics'] = 'import classics';
    var property = Blockly.Python.quote_(block.getFieldValue('PROPERTY'));
    var index_unquoted = block.getFieldValue('INDEX');
    var index = Blockly.Python.quote_(index_unquoted);
    var index_value = "''";
    if (index_unquoted != '(None)') {
        var iv = block.getFieldValue('INDEX_VALUE') || "";
        index_value = Blockly.Python.quote_(iv);
    }
    
    var code = 'classics.get('+property+',' +index+','+index_value+')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

PythonToBlocks.KNOWN_MODULES['classics'] = {
    "get": ["classics_get", 
                    "PROPERTY", 
                    {"type": "mutation", "name": "@INDEX"},
                    {"type": "mutation", "name": "@INDEX_VALUE"}]
};

AbstractInterpreter.MODULES['classics'] = {
    'get': {"type": "List", "empty": false, "component": {"type": 'Num'}}
};