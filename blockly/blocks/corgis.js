/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview CORGIS big data blocks for Blockly.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Blocks.corgis');

goog.require('Blockly.Blocks');

var WEATHER_HUE = 70,
    QUAKES_HUE = 60,
    STOCKS_HUE = 65,
    CRIME_HUE = 55,
    BOOKS_HUE = 50;
    
/*
 * Weather Data
 */ 
var CITIES = [['Blacksburg, VA', 'Blacksburg, VA'], 
              ['Seattle, WA', 'Seattle, WA'],
              ['Miami, FL', 'Miami, FL'],
              ['San Jose, CA', 'San Jose, CA'],
              ['New York, NY', 'New York, NY']];

Blockly.Blocks['weather_temperature'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(WEATHER_HUE);
    this.appendDummyInput()
        .appendField("get temperature in")
        .appendField(new Blockly.FieldDropdown(CITIES), 'CITY');
    this.setInputsInline(false);
    this.setOutput(true, "Number");
    this.setTooltip('Returns a single temperature (number)');
  }
};
        
Blockly.Blocks['weather_forecasts'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(WEATHER_HUE);
    this.appendDummyInput()
        .appendField("get forecasted temperatures in")
        .appendField(new Blockly.FieldDropdown(CITIES), 'CITY');
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns a list of forecasted temperatures (list of number)');
  }
};

Blockly.Blocks['weather_highs_lows'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(WEATHER_HUE);
    this.appendDummyInput()
        .appendField("get highs and lows in")
        .appendField(new Blockly.FieldDropdown(CITIES), 'CITY');
    this.setInputsInline(false);
    this.setOutput(true, "dict");
    this.setTooltip('Returns a list of forecasted temperature highs and lows (dict of lists of numbers)');
  }
};

Blockly.Blocks['weather_report_forecasts'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(WEATHER_HUE);
    this.appendDummyInput()
        .appendField("get forecasted weather in")
        .appendField(new Blockly.FieldDropdown(CITIES), 'CITY');
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns a list of forecasted weather reports (list of dicts)');
  }
};

Blockly.Blocks['weather_report'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(WEATHER_HUE);
    this.appendDummyInput()
        .appendField("get weather in")
        .appendField(new Blockly.FieldDropdown(CITIES), 'CITY');
    this.setInputsInline(false);
    this.setOutput(true, "dict");
    this.setTooltip('Returns a weather report (dictionary)');
  }
};

Blockly.Blocks['weather_all_forecasts'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(WEATHER_HUE);
    this.appendDummyInput()
        .appendField("get all forecasted temperatures");
    this.setInputsInline(false);
    this.setOutput(true, "dict");
    this.setTooltip('Returns a list of dictionaries of forecasts and cities');
  }
};

/*
 * Stocks Data
 */
var COMPANIES = [['Facebook', 'FB'], 
                 ['Apple', 'AAPL'],
                 ['Microsoft', 'MSFT'],
                 ['Google', 'GOOG']]

Blockly.Blocks['stocks_current'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(STOCKS_HUE);
    this.appendDummyInput()
        .appendField("get current stock of")
        .appendField(new Blockly.FieldDropdown(COMPANIES), 'TICKER');
    this.setInputsInline(false);
    this.setOutput(true, "Number");
    this.setTooltip('Returns a single stock change value (number)');
  }
};     
        
Blockly.Blocks['stocks_past'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(STOCKS_HUE);
    this.appendDummyInput()
        .appendField("get past stock changes of")
        .appendField(new Blockly.FieldDropdown(COMPANIES), 'TICKER');
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns a list of the previous stock values');
  }
};

/*
 * Earthquake Data
 */
var EARTHQUAKES = [['magnitude', 'magnitude'], 
                   ['depth', 'depth']]

Blockly.Blocks['earthquake_get'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(QUAKES_HUE);
    this.appendDummyInput()
        .appendField("get recent earthquakes'")
        .appendField(new Blockly.FieldDropdown(EARTHQUAKES), 'PROPERTY');
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns a property of an earthquake');
  }
};

Blockly.Blocks['earthquake_both'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(QUAKES_HUE);
    this.appendDummyInput()
        .appendField("get earthquakes magnitude and depth'");
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns magnitude and depth of multiple earthquakes');
  }
};

Blockly.Blocks['earthquake_all'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(QUAKES_HUE);
    this.appendDummyInput()
        .appendField("get complete earthquakes report'");
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns all properties of multiple earthquakes');
  }
};

/*
 * Crime Data
 */
 
var YEARS = [];
for (var i = 1960; i <= 2012; i+= 5) {
    YEARS.push([''+i, ''+i]);
}
var STATES = [['Alaska', 'alaska'], ['California', 'california'], 
              ['Delaware', 'delaware'], ['Florida', 'florida'], 
              ['Maryland', 'maryland'], ['Nevada', 'nevada'], 
              ['New Jersey', 'new jersey'], ['New York', 'new york'], 
              ['Pennsylvania', 'pennsylvania'], ['Texas', 'texas'], 
              ['Virginia', 'virginia']];
Blockly.Blocks['crime_state'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(CRIME_HUE);
    this.appendDummyInput()
        .appendField("get")
        .appendField(new Blockly.FieldDropdown([['property', 'property'],
                                                ['violent', 'violent'],
                                                ['both kinds', 'both']]), 'TYPE')
        .appendField("crime rates in")
        .appendField(new Blockly.FieldDropdown(STATES), 'STATE');
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns all of the crime rates in the those states since 1960');
  }
};

Blockly.Blocks['crime_year'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(CRIME_HUE);
    this.appendDummyInput()
        .appendField("get crime rates in")
        .appendField(new Blockly.FieldDropdown(YEARS), 'YEAR');
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns all of the crime rates reports for the given year by state');
  }
};

Blockly.Blocks['crime_all'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(CRIME_HUE);
    this.appendDummyInput()
        .appendField("get all crime reports");
    this.setInputsInline(false);
    this.setOutput(true, "dict");
    this.setTooltip('Returns all of the crime rates reports');
  }
};

/*
 * Book Data
 */
Blockly.Blocks['books_get'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(BOOKS_HUE);
    this.appendDummyInput()
        .appendField("get books");
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns a list of books (list of dict)');
  }
};
 