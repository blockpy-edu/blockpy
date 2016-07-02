Blockly.Blocks['classics_get_all'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(WEATHER_HUE);
    this.appendDummyInput()
        .appendField("classics.get all books");
    this.setInputsInline(false);
    this.setOutput(true, "Number");
    this.setTooltip('Returns all the books');
  }
};
Blockly.Python['classics_get_all'] = function(block) {
    Blockly.Python.definitions_['import_classics'] = 'import classics';
    var code = 'classics.get_all()';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

PythonToBlocks.KNOWN_MODULES['classics'] = {
    "get_all": ["classics_get_all"]
};


function newBlock(name) {
    var block = blockpy.components.editor.blockly.newBlock(name);
    block.initSvg();
    block.render();
}

var DAYS = [
    ["Monday", "MON"],
    ["Tuesday", "TUE"],
    ["Wednesday", "WED"],
    ["Thursday", "THU"],
    ["Friday", "FRI"],
    ["Saturday", "SAT"],
    ["Sunday", "SUN"]
  ]

var DAYS_MAP = {
        'MON': 'dates.date("MON")',
        'TUE': 'dates.tuesday()',
        'WED': 'dates.wednesday()',
        'THU': 'dates.thursday()',
        'FRI': 'dates.friday()',
        'SAT': 'dates.saturday()',
        'TODAY': 'dates.today()'
    };


Blockly.Blocks['datetime_day'] = {
  /**
   * Block for datetime day.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "DAY",
          "options": [["Today", "TODAY"]].concat(DAYS)
        }
      ],
      "output": "DatetimeDay",
      "colour": DATA_HUE,
      "tooltip": "Returns a day of the week",
      "helpUrl": ""
    });
  }
};
Blockly.Python['datetime_day'] = function(block) {
    Blockly.Python.definitions_['import_dates'] = 'import dates';
    var operator = DAYS_MAP[block.getFieldValue('DAY')];
    return [operator, Blockly.Python.ORDER_ATOMIC];
};

var HOURS = [["1", "1"], ["2", "2"], ["3", "3"],
             ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"],
             ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"],
             ["12", "12"]];
var MINUTES = [["00", "00"], ["30", "30"]];
var MERIDIANS = [["am", "AM"], ["pm", "PM"]];

Blockly.Blocks['datetime_time'] = {
  /**
   * Block for datetime day.
   * @this Blockly.Block
   */
    init: function() {
        this.setColour(DATA_HUE);
        var dropdown = new Blockly.FieldDropdown([["Now", "NOW"]].concat(HOURS), function(option) {
            var isNow = (option == 'NOW');
            this.sourceBlock_.updateShape_(isNow);
        });
        this.appendDummyInput()
            .appendField(dropdown, 'HOUR');
        this.setInputsInline(true);
        this.setOutput(true, 'DatetimeTime');
        this.setTooltip("Returns a time of day");
    },
    mutationToDom: function() {
        var container = document.createElement('mutation');
        var isNow = (this.getFieldValue('HOUR') == 'NOW');
        container.setAttribute('isNow', isNow);
        return container;
    },
    domToMutation: function(xmlElement) {
        var isNow = (xmlElement.getAttribute('isNow') == 'true');
        this.updateShape_(isNow);
    },
    updateShape_: function(isNow) {
        // Add or remove a Value Input.
        var inputExists = this.getInput('EXTENDED');
        if (!isNow) {
            if (!inputExists) {
                var minuteMenu = new Blockly.FieldDropdown(MINUTES);
                var meridianMenu = new Blockly.FieldDropdown(MERIDIANS);
                this.appendDummyInput('EXTENDED')
                    .appendField(':')
                    .appendField(minuteMenu, 'MINUTE')
                    .appendField(meridianMenu, 'MERIDIAN');
            }
        } else if (inputExists) {
            this.removeInput('EXTENDED');
        }
    }
};

var HOURS_MAP = {
    '1': 'dates.one()',
    '2': 'dates.two()',
    '3': 'dates.three()',
    '4': 'dates.four()',
    '5': 'dates.five()',
    '6': 'dates.six()',
    '7': 'dates.seven()',
    '8': 'dates.eight()',
    '9': 'dates.nine()',
    '10': 'dates.ten()',
    '11': 'dates.eleven()',
    '12': 'dates.twelve()',
    'NOW': 'dates.now()'
};
var MINUTES_MAP = {
    '00': 'dates.exactly()',
    '30': 'dates.half()'
}
var MERIDIANS_MAP = {
    'AM': 'dates.am()',
    'PM': 'dates.pm()'
}

Blockly.Python['datetime_time'] = function(block) {
    Blockly.Python.definitions_['import_dates'] = 'import dates';
    var hour = HOURS_MAP[block.getFieldValue('HOUR')];
    var minute = MINUTES_MAP[block.getFieldValue('MINUTE')];
    var meridian = MERIDIANS_MAP[block.getFieldValue('MERIDIAN')];
    var code = 'dates.time('+hour+','+minute+','+meridian+')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

PythonToBlocks.KNOWN_MODULES['dates'] = {
    "equal_time": ["datetime_check_day", 'LEFT', ['OP', 'IS'], 'VALUE'],
    "before_time": ["datetime_check_day", 'LEFT', ['OP', 'BEFORE'], 'VALUE'],
    "after_time": ["datetime_check_day", 'LEFT', ['OP', 'AFTER'], 'VALUE'],
    "before_equal_time": ["datetime_check_day", 'LEFT', ['OP', 'AFTER'], 'VALUE'],
    "after_equal_time": ["datetime_check_day", 'LEFT', ['OP', 'AFTER'], 'VALUE'],
    "not_equal_time": ["datetime_check_day", 'LEFT', ['OP', 'AFTER'], 'VALUE'],
    "equal_day": ["datetime_check_day", 'LEFT', ['OP', 'IS'], 'VALUE'],
    "before_day": ["datetime_check_day", 'LEFT', ['OP', 'BEFORE'], 'VALUE'],
    "after_day": ["datetime_check_day", 'LEFT', ['OP', 'AFTER'], 'VALUE'],
    "before_equal_day": ["datetime_check_day", 'LEFT', ['OP', 'AFTER'], 'VALUE'],
    "after_equal_day": ["datetime_check_day", 'LEFT', ['OP', 'AFTER'], 'VALUE'],
    "not_equal_day": ["datetime_check_day", 'LEFT', ['OP', 'AFTER'], 'VALUE'],
};

var equalityOperators = [
    ["==", "IS"],
    ["<", "BEFORE"],
    [">", "AFTER"],
    ["<=", "BEFORE_EQUAL"],
    ["=>", "AFTER_EQUAL"],
    ["!=", "IS_NOT"]
];
var equalityOperatorsConversions = {
    "IS": "dates.equal",
    "BEFORE": "dates.before",
    "AFTER": "dates.after",
    "BEFORE_EQUAL": "dates.before_equal",
    "AFTER_EQUAL": "dates.after_equal",
    "IS_NOT": "dates.not_equal",
}
// FINISH _time and _day
// Add in numbers and days to KNOWN_MODULES

Blockly.Blocks['datetime_check_day'] = {
  /**
   * Block for testing if something contains something.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.logic.HUE);
    this.setOutput(true, 'Boolean');
    this.appendValueInput('LEFT')
        .setCheck('DatetimeDay');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(equalityOperators), 'OP')
        .appendField(new Blockly.FieldDropdown(DAYS), 'VALUE');
    this.setInputsInline(true);
  }
};

Blockly.Python['datetime_check_day'] = function(block) {
    Blockly.Python.definitions_['import_dates'] = 'import dates';
    var value = DAYS_MAP[block.getFieldValue('VALUE')];
    var operator = equalityOperatorsConversions[block.getFieldValue('OP')];
    var left = Blockly.Python.valueToCode(block, 'LEFT', Blockly.Python.ORDER_ATOMIC)
    var code = operator + "(" + left + ',' + value + ")";
    return [code, Blockly.Python.ORDER_ATOMIC];
};


Blockly.Blocks['datetime_check_time'] = {
  /**
   * Block for testing if something contains something.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.logic.HUE);
    this.setOutput(true, 'Boolean');
    this.appendValueInput('LEFT')
        .setCheck('DatetimeTime');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(equalityOperators), 'OP')
        .appendField(new Blockly.FieldDropdown(HOURS), 'HOURS')
        .appendField(':')
        .appendField(new Blockly.FieldDropdown(MINUTES), 'MINUTES')
        .appendField(new Blockly.FieldDropdown(MERIDIANS), 'MERIDIANS');
    this.setInputsInline(true);
  }
};

Blockly.Python['datetime_check_time'] = function(block) {
    Blockly.Python.definitions_['import_dates'] = 'import dates';
    var hour = HOURS_MAP[block.getFieldValue('HOURS')];
    var minute = MINUTES_MAP[block.getFieldValue('MINUTES')];
    var meridian = MERIDIANS_MAP[block.getFieldValue('MERIDIANS')];
    var operator = equalityOperatorsConversions[block.getFieldValue('OP')];
    var left = Blockly.Python.valueToCode(block, 'LEFT', Blockly.Python.ORDER_ATOMIC)
    var code = operator + "(" + left + ',' + hour + ',' + minute + ',' +meridian + ")";
    return [code, Blockly.Python.ORDER_ATOMIC];
};
