(function ($) 
{
	$(document).ready(function () 
	{
		var settings = new JSAV.utils.Settings($(".jsavsettings"));
		var arrayLayout = settings.add("layout", {"type": "select", "options": {"bar": "Bar", "array": "Array"}, "label": "Array layout: ", "value": "array"});
		var av = new JSAV($('.avcontainer'), {settings: settings});
		av.recorded();
		var tell = function (msg, color) { av.umsg(msg, {color: color}); };
		var incrs = [], $theExpression = $("#expression"), initialArray = [], theExpression, position, ansArray, arraySize, strArr, ansArr;
		
		// Function to generate the model solution.
		function modelSolution(modeljsav) 
		{
			var modelArray = modeljsav.ds.array(ansArray);
			modeljsav.displayInit();
			for(i = 1; i < arraySize; i++)
			{
				modelArray.highlight(i);
				modelArray.unhighlight(i-1);
				modeljsav.gradeableStep();
			}
			modelArray.highlight();
			modeljsav.gradeableStep();
			return modelArray;
		}

		// Function to initialize the exercise and generate a semi-random expression.
		function init()
		{
			var varArr = ["a", "b", "c", "i", "j", "k", "w", "x", "y", "z"];
			var rnd = Math.floor(Math.random()*10);
			var var1 = varArr.splice(rnd, 1);
			rnd = Math.floor(Math.random()*9);
			var var2 = varArr.splice(rnd, 1);
			rnd = Math.floor(Math.random()*8);
			var var3 = varArr.splice(rnd, 1);
			strArr = ["(\u03BB"+var1+".("+var1+" "+var1+") (\u03BB"+var2+"."+var2+" "+var3+"))", 
					  "(\u03BB"+var1+"."+var1+" (\u03BB"+var2+"."+var2+" "+var3+"))",
					  "\u03BB"+var1+".(\u03BB"+var1+".("+var1+" "+var1+") "+var2+")"];
			ansArr = [["(^"+var1+".("+var1+var1+")(^"+var2+"."+var2+var3+"))", "((^"+var2+"."+var2+var3+")(^"+var2+"."+var2+var3+"))", "("+var3+var3+")"],
					  ["(^"+var1+"."+var1+"(^"+var2+"."+var2+var3+"))", "(^"+var2+"."+var2+var3+")", String(var3)],
					  ["^"+var1+".(^"+var1+".("+var1+var1+")"+var2+")", "^"+var1+".("+var2+var2+")"]];
			appArr = [["(^"+var1+".("+var1+" "+var1+") (^"+var2+"."+var2+" "+var3+"))", "((^"+var2+"."+var2+" "+var3+") (^"+var2+"."+var2+" "+var3+"))", "("+var3+" "+var3+")"],
					  ["(^"+var1+"."+var1+" (^"+var2+"."+var2+" "+var3+"))", "(^"+var2+"."+var2+" "+var3+")", String(var3)],
					  ["^"+var1+".(^"+var1+".("+var1+" "+var1+") "+var2+")", "^"+var1+".("+var2+" "+var2+")"]];
			rnd = Math.floor(Math.random()*3);
			var htmldata = strArr[rnd];
			$theExpression.html(htmldata);
			initialArray = appArr[rnd];
			ansArray = ansArr[rnd];
			arraySize = ansArray.length;
			position = 1;
			jsavArray = av.ds.array(ansArray, {visible: false});
			return jsavArray;
		}
		
		// Function to produce text for the "Help" button.
		function help() 
		{
			alert("Help");
		}

		// Function to produce text for the "About" button.
		function about() 
		{
			alert("Proficiency Exercise");
		}

		// Function to check answer once the "Submit" button is pressed.
		function submit()
		{
			var temp = document.getElementById('answer').value;
			temp = temp.replace(/\s+/g, '');
			document.getElementById('answer').value = "";
			if(position < ansArray.length)
			{
				if(temp == ansArray[position])
				{
					jsavArray.highlight(position);
					jsavArray.unhighlight(position-1);
					exercise.gradeableStep();
					$theExpression.html(initialArray[position]);
					position++;
				} else
				{
					exercise.gradeableStep();
				}
			} else
			{
				exercise.gradeableStep();
			}
		}
		
		// Function to check answer once the "Done" button is pressed.
		function done()
		{
			if(position < ansArray.length)
			{
				alert("There are still more reductions to be done!");
				exercise.gradeableStep();
			} else
			{
				jsavArray.highlight();
				exercise.gradeableStep();
				alert("Congratulations! You've finished!");
			}
		}
		
		// Function to fix exercise if an incorrect submission is entered.
		function fixState(modeljsav)
		{
			if(position < ansArray.length)
			{
				jsavArray.highlight(position);
				jsavArray.unhighlight(position-1);
				$theExpression.html(initialArray[position]);
				position++;
			} else
			{
				jsavArray.highlight();
				alert("There are no more reductions to be done!");
			}
		}
		
		var exercise = 	av.exercise(modelSolution, init, { compare: {class: "jsavhighlight"}, controls: $('.jsavexercisecontrols'), fix: fixState });
		exercise.reset();

		$('#help').click(help);
		$('#about').click(about);
		$('#submit').click(submit);
		$('#done').click(done);
	});
}(jQuery));