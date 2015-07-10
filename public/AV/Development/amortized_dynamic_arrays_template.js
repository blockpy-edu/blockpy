/******************************************************
	The following functions and variables are all part of the Dynamic Array Example
	-Samuel A. Micka 7/31/2013


	Note to developers:
		for your template to show up, go to the amortized_template.html file
		1) you will need to add a link for your template under the select menu
		2) you will need to include your template below the select
		3) make sure all function calls are sent in as strings properly

		follow the instructions in the amortized_template.html file and use this file as a guide
******************************************************/


//function that returns a random number between lower and upper bound
function gen_random(lower_bound, upper_bound) {
	return Math.floor(Math.random() * (upper_bound - lower_bound + 1) + lower_bound);
}

//These variables need to be global because they are called in the potential function
var arr,current_index;

//initializes the dynamic array function
function dynamic_array() {
	var check_add_use, add_element, check_resize_use, resize, dynamic_array_backstep, element;

	var dyn_arr_potential = (function() {
		if(current_index > arr.size()/2)
			return 2 * (current_index - arr.size()/2);
		else
			return 0;
	});

	//add a new element
	add_element = (function() {
		arr.value(current_index, gen_random(0,100));
		current_index++;
		//return cost of operation
		return 1;
	});
	//resize the array
	resize = (function() {
		var size = arr.size();
		for(var i = 0; i < size; i++) {
			arr.value(size+i, '');
		}	
		arr.value(current_index, gen_random(0,100));
		current_index++;
		//return cost of operation
		return size + 1;
	});
	//lets you know if you should use the add function
	check_add_use = (function(){
		if(current_index != arr.size()) return true;
		else return false;
	});
	//lets you know if the array has to be resized
	check_resize_use = (function() {
		if(current_index == arr.size()) return true;
		else return false;
	});

	//function called when the user wants to step backwards
	dynamic_array_backstep = (function() {
		if(((current_index-1) == (arr.size()/2)) && (arr.size() > 4)) {
			var arr_temp = new Array();
			for(var i = 0; i < arr.size()/2; i++) {
				arr_temp[i] = arr.value(i);
			}
			arr.clear();
			this.arr = dyn_arr_vis.ds.array(arr_temp, {center: false});
			current_index--;		
		} else {
			current_index--;
			arr.value(current_index, '');
		}
	});

	//define the pseudo code for both functions
	var add_pseudo = "function add(array, element, current_index): \n\tarray[current_index] = element \n\tcurrent_index++";
	var resize_pseudo = "function resize(array, element, current_index): \n\tarr_new = new array[array.size*2] \n\tfor i = 0; i<arr.length; i++: \n\t\tarr_new[i] = arr[i] \n\tarr_new[current_index] = element \n\tcurrent_index++ \n\tarr = new_arr";

	var operations = [["Add", add_element, check_add_use, add_pseudo],["Resize", resize, check_resize_use, resize_pseudo]];

	var dyn_arr_vis = construct_show(operations, dyn_arr_potential,0,0,0,1,0, dynamic_array_backstep);

	/*****************************
		Here I am setting up the button that we will use to add another element to the array list
	******************************/
	//get the div I want to nest them in

	/*
		We want to put this with the other buttons, so we grab they div they are in by the id buttons_div
	*/
	var the_div = document.getElementById('buttons_div');
	//create a button to add the value
	var add_button = document.createElement('button');
	add_button.id = 'add_button';
	the_div.appendChild(add_button);
	//Add the text 'Add' to our dynamically created button
	$("#add_button").html("Add another element");

	arr = dyn_arr_vis.ds.array(['','','',''], {center:false});
	current_index = 0;


	$("#add_button").click(function() {
		//call the next step function which is a global variable in the amortized_template.html file
		next_step();
	});
}	



