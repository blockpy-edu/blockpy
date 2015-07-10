/******************************************************
	The following functions and variables are all part of the Binary Counter Example
	-Samuel A. Micka 7/31/2013
******************************************************/
//GLOBAL VARS
//you need anything you create with the JSAV object to be global, also any variables called in your potential function need to be global
var bin_counter_arr;
//initializes the dynamic array function
function binary_counter() {
	var bits_flipped = 0;
	var one_step_prev_arr = [];
	//FUNCTIONS for binary counter

	var potential_function_binary_counter = (function() {
		var number_of_ones = 0;
		for(var i = 0; i < bin_counter_arr.size(); i++) {
			if(bin_counter_arr.value(i) == 1)
				number_of_ones++;
		}
		return number_of_ones;
	});

	//add a new element
	var add_one = (function() {
		bits_flipped = 0;

		var i = bin_counter_arr.size()-1;

		//store the previous values in an array for stepping back once
		var two_d_level = [];
		for(var x = 0; x < bin_counter_arr.size(); x++) {
			two_d_level.push(bin_counter_arr.value(x));
		}
		one_step_prev_arr.push(two_d_level); 

		while(i > -1 && bin_counter_arr.value(i) == 1) {
			bin_counter_arr.value(i, 0);
			i--;
			bits_flipped++;
		}
		if(i > -1)
			bin_counter_arr.value(i, 1);
			bits_flipped++;
		return bits_flipped;
	});


	//lets you know if you should use the add function
	var check_one_use = (function(){
		return true;
	});

	//function called when the user wants to step backwards
	var bin_counter_backstep = (function() {
		bin_counter_arr.clear();
		bin_counter_arr = bin_arr_visualization.ds.array(one_step_prev_arr[one_step_prev_arr.length-1], {center:false});
		one_step_prev_arr.pop();		
	});

	//define the pseudo code for both functions
	var add_pseudo = "function add_one(num): \n\ti = num.length - 1 \n\twhile i > -1 and num[i] == 1: \n\t\tnum[i] = 0 \n\t\ti -= 1\n\tif i > -1\n\t\tnum[i] = 1";

	var operations = [["Add 1", add_one, check_one_use, add_pseudo]];

	var bin_arr_visualization = construct_show(operations, potential_function_binary_counter,0,0,0,1,0, bin_counter_backstep);

	/*****************************
		Here I am setting up the button that we will use to add another element to the array list
	******************************/
	//We want to put this with the other buttons, so we grab they div they are in by the id buttons_div
	var the_div = document.getElementById('buttons_div');
	var add_button = document.createElement('button');
	add_button.id = 'add_button';
	the_div.appendChild(add_button);
	$("#add_button").html("Add One");

	bin_counter_arr = bin_arr_visualization.ds.array([0,0,0,0], {center:false});
	current_index = 0;


	$("#add_button").click(function() {
		//call the next step function which is a global variable in the amortized_template.html file
		next_step();
	});
}	



