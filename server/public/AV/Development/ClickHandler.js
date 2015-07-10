(function ($) {
	"use strict";

	/*
	 * JSAV click handler for handling moving and copying between different structures
	 *
	 * Move currently works with arrays and lists
	 *
	 * Copy and Swap behave strangly with lists
	 *
	 *
	 *
	*/
	var ClickHandler = function ClickHandler(jsav, exercise, options) {
		var defaults = {
			// the class which is given to a node/index when it is selected
			selectedClass: "jsavhighlight",
			// ignore all clicks on nodes with this class
			inactiveClass: undefined,
			// don't allow selecting empty nodes
			selectEmpty: false,
			// move, copy, swap, toss
			effect: "move",
			// options for array swap
			arraySwapOptions: {
				use: true,				// use array swap by default
				arrow: false,			// turn array swap arrow off by default
				highlight: false,		// do not use pink highlighting when swapping
				swapClasses: true
			},
			// remove nodes when they become empty
			removeNodes: true,
			// tells click handler if action should be graded. Can be overridden with return value of onDrop.
			gradeable: true,
			// allow deselecting by clicking on the background
			bgDeselect: true,
			// click, first, last
			select: "click",
			// click, first, last
			drop: "click",
			// don't allow selecting the last node
			keep: false,
			// called by structure when something is selected. If the function returns false, the selection is cancelled
			onSelect: function () {},
			// called by structure when something is already selected and another node/index is clicked. If the function returns false, the drop will not take place.
			beforeDrop: function () {},
			// called by structure when value has been changed. The return value determins if the step is gradeable. If nothing is returned gradeable will be used.
			onDrop: function () {}
		};

		this.jsav = jsav;
		this.exercise = exercise;
		this.selStruct = jsav.variable(-1);
		this.selIndex = jsav.variable(-1);
		this.selNode = null;	//only valid when selStruct != -1 and selIndex = -1
		this.ds = [];
		this.options = $.extend({}, defaults, options);

		if (this.options.bgDeselect) {
			var ch = this;
			this.jsav.container.click(function (event) {
				var $target = $(event.target);
				if ($target.is(ch.jsav.container) ||
					$target.is(ch.jsav.canvas) ||
					$target.is("p")) {
					ch.deselect();
				}
			});
		}
	};

	ClickHandler.prototype = {
		//get the index of a structure
		getDsIndex: function (ds) {
			return $.inArray(ds, this.ds);
		},

		//get a structure 
		getDs: function (index) {
			return this.ds[index];
		},

		//returns an object containing selected structure, index and node (if they exist)
		getSelected : function () {
			return {
				struct: this.getDs(this.selStruct.value()),
				index: this.selIndex.value(),
				node: this.selNode
			};
		},

		//reset the click handler, but keeps datastructures and settings
		//should be done when initializing an exercise
		reset: function () {
			this.selStruct.value(-1);
			this.selIndex.value(-1);
			this.selNode = null;
		},

		//remove structure from click handler
		remove: function (ds) {
			if (this.getDsIndex(ds) === -1) {
				return false;
			} else {
				this.ds.splice(this.getDsIndex(ds), 1);
				return true;
			}
		},

		step: function (grade) {
			if (grade) {
				this.exercise.gradeableStep();
			} else {
				this.jsav.step();
			}
		},

		//tells click handler to select the given index in an array or the given node
		select: function (struct, indexOrNode) {
			//don't do anything if click handler is unaware of structure
			if (this.getDsIndex(struct) === -1) {
				return;
			}
			//deselect if something is selected
			if (this.getSelected().struct) {
				this.deselect();
			}

			if (typeof indexOrNode === "number") {
				//select array
				struct.addClass(indexOrNode, this.options.selectedClass);
				this.selIndex.value(indexOrNode);
			} else {
				//select node
				indexOrNode.addClass(this.options.selectedClass);
				this.selNode = indexOrNode;
				this.selIndex.value(-1);
			}
			this.selStruct.value(this.getDsIndex(struct));
		},

		//deselect the selected node
		deselect: function () {
			if (this.selStruct.value() !== -1) {
				if (this.selIndex.value() === -1) {
					//deselect node
					if (this.selNode) {
						this.selNode.removeClass(this.options.selectedClass);
					}
				} else {
					//deselect from array
					this.getDs(this.selStruct.value()).removeClass(this.selIndex.value(), this.options.selectedClass);
				}
				this.reset();
			}
		},

		//add an array to the click handler
		addArray: function (array, options) {
			//push array into ds
			this.ds.push(array);

			options = $.extend({}, this.options, options);

			var ch = this;

			//add click handler
			array.click(function (index) {
				// ignore the click if the node has the inactive class
				if (options.inactiveClass && array.hasClass(index, options.inactiveClass)) {
					return;
				}
				//move the values from the JSAV variables into regulas js vars
				var sStruct = ch.selStruct.value();
				var sIndex = ch.selIndex.value();
				var grade, continueDrop;

				if (sStruct === -1) {
					//select empty nodes only if the options allow it
					if (!options.selectEmpty && this.value(index) === "") {
						return;
					}
					//call onSelect function
					var continueSelect = options.onSelect.call(this, index);
					//return if onSelect returns false
					if (typeof continueSelect !== "undefined" && !continueSelect) {
						return;
					}
					//mark as selected
					ch.select(array, index);
				} else if (sStruct === ch.getDsIndex(this)) {
					//swap with empty nodes only if the options allow it
					if (!options.selectEmpty && this.value(index) === "" && ch.options.effect === "swap") {
						return;
					}
					if (sIndex !== index) {
						//return if beforeDrop returns false
						continueDrop = options.beforeDrop.call(this, index);
						if (typeof continueDrop !== "undefined" && !continueDrop) {
							return;
						}
						//move/copy/swap within the array
						valueEffect(ch, {
							from: ch.getDs(sStruct),
							fromIndex: sIndex,
							to: ch.getDs(sStruct),
							toIndex: index,
							effect: options.effect
						});
						array.layout();
						//call onDrop function
						grade = options.onDrop.call(this, index);
						if (typeof grade === "undefined") {
							//use default if nothing is returned
							grade = options.gradeable;
						} else {
							//convert to boolean
							grade = !!grade;
						}
					}
					//deselect
					ch.deselect();
					//mark step unless we were deselecting
					if (sIndex !== index) {
						ch.step(grade);
					}
				} else {
					//move/copy/swap from an another structure
					//swap with empty nodes only if the options allow it
					if (!options.selectEmpty && this.value(index) === "" && ch.options.effect === "swap") {
						return;
					}
					//return if beforeDrop returns false
					continueDrop = options.beforeDrop.call(this, index);
					if (typeof continueDrop !== "undefined" && !continueDrop) {
						return;
					}
					//move value from node (sIndex === -1) or another array
					valueEffect(ch, {
						from: sIndex === -1 ? ch.selNode : ch.getDs(sStruct),
						fromIndex: sIndex === -1 ? undefined : sIndex,
						to: this,
						toIndex: index,
						effect: options.effect
					});
					array.layout();
					//call onDrop function
					grade = options.onDrop.call(this, index);
					if (typeof grade === "undefined") {
						//use default if nothing is returned
						grade = options.gradeable;
					} else {
						//convert to boolean
						grade = !!grade;
					}
					//deselect
					ch.deselect();
					//mark step
					ch.step(grade);
				}
			});
		},

		//add a list to the click handler
		addList: function (list, options) {
			//push array into ds
			this.ds.push(list);

			options = $.extend({}, this.options, options);

			var ch = this;

			//add click handler
			list.click(function () {
				// ignore the click if the node has the inactive class
				if (options.inactiveClass && this.hasClass(options.inactiveClass)) {
					return;
				}
				//move the values from the JSAV variables into regulas js vars
				var sStruct = ch.selStruct.value();
				var sIndex = ch.selIndex.value();
				var grade, continueDrop, to;

				if (sStruct === -1) {
					//select empty nodes only if the options allow it
					if (!options.selectEmpty && this.value() === "" && options.select === "click") {
						return;
					}
					//don't allow to select the last node if keep is true
					if (options.keep && list.size() === 1) {
						return;
					}
					//choose possible selected node
					var sel;
					switch (options.select) {
					case "first":
						sel = list.first();
						break;
					case "last":
						sel = list.last();
						break;
					default: //"click"
						sel = this;
					}
					//call onSelect function
					var continueSelect = options.onSelect.call(sel);
					//return if onSelect returns false
					if (typeof continueSelect !== "undefined" && !continueSelect) {
						return;
					}
					//select
					ch.select(list, sel);
				} else if (sStruct === ch.getDsIndex(list)) {
					switch (options.drop) {
					case "first":
						if (options.select === "first" || this === ch.selNode) {
							to = list.first();
							break;
						}
						to = list.addFirst().first();
						break;
					case "last":
						if (options.select === "last" || this === ch.selNode) {
							to = list.last();
							break;
						}
						to = list.addLast().last();
						break;
					default: //"click"
						to = this;
					}
					if (to !== ch.selNode && this !== ch.selNode) {
						//return if beforeDrop returns false
						continueDrop = options.beforeDrop.call(to);
						if (typeof continueDrop !== "undefined" && !continueDrop) {
							return;
						}
						//move/copy/swap within the list
						valueEffect(ch, {
							from: ch.selNode,
							to: to,
							effect: options.effect
						});
						list.layout();
						//call onDrop function
						grade = options.onDrop.call(to);
						if (typeof grade === "undefined") {
							//use default if nothing is returned
							grade = options.gradeable;
						} else {
							//convert to boolean
							grade = !!grade;
						}
					}
					//deselect
					ch.deselect();
					//mark step unless only deselecting
					if (typeof grade !== "undefined") {
						ch.step(grade);
					}
				} else {
					//move/copy/swap from an another structure
					switch (options.drop) {
					case "first":
						to = list.addFirst().first();
						break;
					case "last":
						to = list.addLast().last();
						break;
					default: //"click"
						to = this;
					}
					//return if beforeDrop returns false
					continueDrop = options.beforeDrop.call(to);
					if (typeof continueDrop !== "undefined" && !continueDrop) {
						return;
					}
					//move value from node (sIndex === -1) or an array
					valueEffect(ch, {
						from: sIndex === -1 ? ch.selNode : ch.getDs(sStruct),
						fromIndex: sIndex === -1 ? undefined : sIndex,
						to: to,
						effect: options.effect
					});
					list.layout();
					//call onDrop function
					grade = options.onDrop.call(to);
					if (typeof grade === "undefined") {
						//use default if nothing is returned
						grade = options.gradeable;
					} else {
						//convert to boolean
						grade = !!grade;
					}
					//deselect
					ch.deselect();
					//mark step
					ch.step(grade);
				}
			});
		},

		//add a (binary) tree to the click handler
		addTree: function (tree, options) {
			//push array into ds
			this.ds.push(tree);

			options = $.extend({}, this.options, options);

			var ch = this;

			//add click handler
			tree.click(function () {
				// ignore the click if the node has the inactive class
				if (options.inactiveClass && this.hasClass(options.inactiveClass)) {
					return;
				}
				//move the values from the JSAV variables into regulas js vars
				var sStruct = ch.selStruct.value();
				var sIndex = ch.selIndex.value();
				var grade, continueDrop;

				if (sStruct === -1) {
					//select empty nodes only if the options allow it
					if (!options.selectEmpty && this.value() === "" && options.select === "click") {
						return;
					}
					//don't allow to select the last node if keep is true
					if (options.keep && tree.height() === 1) {
						return;
					}
					//call onSelect function
					var continueSelect = options.onSelect.call(this);
					//return if onSelect returns false
					if (typeof continueSelect !== "undefined" && !continueSelect) {
						return;
					}
					//select
					ch.select(tree, this);
				} else if (sStruct === ch.getDsIndex(tree)) {
					if (this !== ch.selNode) {
						//return if beforeDrop returns false
						continueDrop = options.beforeDrop.call(this);
						if (typeof continueDrop !== "undefined" && !continueDrop) {
							return;
						}
						//move/copy/swap within the tree
						valueEffect(ch, {
							from: ch.selNode,
							to: this,
							effect: options.effect
						});
						tree.layout();
						//call onDrop function
						grade = options.onDrop.call(this);
						if (typeof grade === "undefined") {
							//use default if nothing is returned
							grade = options.gradeable;
						} else {
							//convert to boolean
							grade = !!grade;
						}
					}
					//deselect
					ch.deselect();
					if (typeof grade !== "undefined") {
						ch.step(grade);
					}
				} else {
					//move/copy/swap from an another structure
					//return if beforeDrop returns false
					continueDrop = options.beforeDrop.call(this);
					if (typeof continueDrop !== "undefined" && !continueDrop) {
						return;
					}
					//move value from node (sIndex === -1) or an array
					valueEffect(ch, {
						from: sIndex === -1 ? ch.selNode: ch.getDs(sStruct),
						fromIndex: sIndex === -1 ? undefined: sIndex,
						to: this,
						effect: options.effect
					});
					tree.layout();
					//call onDrop function
					grade = options.onDrop.call(this);
					if (typeof grade === "undefined") {
						//use default if nothing is returned
						grade = options.gradeable;
					} else {
						//convert to boolean
						grade = !!grade;
					}
					//deselect
					ch.deselect();
					//mark step
					ch.step(grade);
				}
			});
		}
	};

	/*
	 * moves, copies or swaps the elements
	 */
	function valueEffect(ch, options) {
		//create an argument array for apply()
		var args = valueEffectArguments(options);

		switch (options.effect) {
		case "move":
			ch.jsav.effects.moveValue.apply(this, args);
			break;
		case "copy":
			ch.jsav.effects.copyValue.apply(this, args);
			break;
		case "swap":
			if (options.from === options.to &&
				options.to instanceof JSAV._types.ds.AVArray &&
				ch.options.arraySwapOptions &&
				ch.options.arraySwapOptions.use === true)
			{
				// remove selected class before swapping, in case the classes are swapped
				options.from.removeClass(options.fromIndex, ch.options.selectedClass);
				options.from.swap(options.fromIndex, options.toIndex, ch.options.arraySwapOptions);
			} else {
				ch.jsav.effects.swapValues.apply(this, args);
			}
			break;
		case "toss":
			//remove value from "from structure"
			if (typeof options.fromIndex === "number") {
				//remove from array
				ch.getDs(ch.selStruct.value()).value(ch.selIndex.value(), "");
			}
			break;
		}

		if (ch.options.removeNodes &&
			$.inArray(options.effect, ["move", "toss"]) !== - 1 &&
			typeof options.fromIndex === "undefined")
			{
			//remove empty node
			if (ch.getDs(ch.selStruct.value()) instanceof JSAV._types.ds.List) {
				//remove node from list
				var list = ch.getDs(ch.selStruct.value());
				var i;
				for (i = 0; i < list.size(); i++) {
					if (list.get(i) === options.from) {
						list.remove(i);
						break;
					}
				}
			} else {
				//TODO: check if this works
				options.from.remove();
			}
			//refresh structures with nodes
			ch.getDs(ch.selStruct.value()).layout();
		}
	}

	//creates an argument array for moveValue/copyValue/swapValue.apply()
	function valueEffectArguments(options) {
		if (typeof options.fromIndex !== "undefined") {
			if (typeof options.toIndex !== "undefined") {
				//array to array
				return [options.from, options.fromIndex, options.to, options.toIndex];
			} else {
				//array to node
				return [options.from, options.fromIndex, options.to];
			}
		} else {
			if (typeof options.toIndex !== "undefined") {
				//node to array
				return [options.from, options.to, options.toIndex];
			} else {
				//node to node
				return [options.from, options.to];
			}
		}
	}

	if (window) {
		window.ClickHandler = ClickHandler;
	}
}(jQuery));