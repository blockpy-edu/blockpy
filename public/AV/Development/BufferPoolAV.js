"use strict";
/*global alert: true, ODSA, console */
$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // check if one of the buffers contains the sector
  // returns index if value is found
  function contains(val) {
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].value(0) == val) {
        return i;
      }
    }
    return -1;
  }
  // cheks the list for matching secotr
  // return index if value is found
  function contains_kai(val) {
    for (var i = 0; i < buffer_size; i++) {
      if (list.value(i) == val) {
        return i;
      }
    }
    return -1;
  }
  // unhighlight every buffer
  function unhighlight_pool() {
    for (var i = 0; i < pool.length; i++) {
      pool[i].unhighlight();
    }
  }
  // display counters for LFU
  function show_counters() {
    for (var i = 0; i < buffer_size; i++) {
      if (list.value(i) != "") {
        label_array[i] = jsav.label(LFU_counter[list.value(i)], {"top": 15 + i * 45, "left": 700});
      }
    }
  }
  function hide_counters() {
    for (var i = 0; i < label_array.length; i++) {
      label_array[i].hide();
    }
  }
  function show_dirty() {
    for (var i = 0; i < list.size(); i++) {
      if (list.value(i)) {
      if (list.value(i) != "") {
        var temp = dirty_bits[list.value(i)];
        dirty_bit_array[i] = jsav.label(temp, {"top": 15 + i*45, "left": 650});
      }
    }
    }
  }
  function hide_dirty() {
    for (var i = 0; i < dirty_bit_array.length; i++) {
      dirty_bit_array[i].hide();
    }
  }
  // initalize the visualization
  function initialize() {
    //console.log("initialize");
    jsav = new JSAV($('.avcontainer'));
    jsav.recorded();
    jsav.displayInit();
    var empty = [];
    pool = [];
    lines = [];

    lines_end[0] = 43;
    lines_end[1] = 88;
    lines_end[2] = 137;
    lines_end[3] = 180;
    lines_end[4] = 227;

    list = jsav.ds.array(empty);
    memory = jsav.ds.array(empty);
    update();
  }

  // when read button is clicked
  function read() {
    read_write = 0;
    //console.log("width: " + list.css("width"));
    //list.css({"width": "+=20px"});
    //list.css({"color": "green"});
    //list.layout();  
    //console.log("width after: " + list.css("width"));
    //console.log("size: " + buffer_size);
    var input = $("#input").val();
    var replacement = $("#function").val();

    if (input < 0 || input >= memory.size() || input == "") {
      jsav.umsg("enter a proper input");
    }
    else {
      //console.log("replacement " + replacement);
      if (replacement == 1) {
        LRU(input);
      }
      if (replacement == 2) {
        FIFO(input);
      }
      if (replacement == 3) {
        LFU(input);
      }
    }
  }

  function next() {
    //console.log("width: " + list.css("width"));
    //list.css({"width": "+=20px"});
    //list.css({"color": "green"});
    //list.layout();  
    //console.log("width after: " + list.css("width"));
    //console.log("size: " + buffer_size);
    var input = $("#input").val();
    var replacement = $("#function").val();
    if (input < 0 || input >= memory.size()) {
      jsav.umsg("enter a proper input");
    }
    else {
      //console.log("replacement " + replacement);
      if (replacement == 1) {
        if (read_write == 0) {
          LRU(input);
        }
        else {
          LRU_write(input);
        }
      }
      if (replacement == 2) {
        if (read_write == 0) {
          FIFO(input);
        }
        else {
          FIFO_write(input);
        }    
      }
      if (replacement == 3) {
        if (read_write == 0) {
          LFU(input);
        }
        else {
          LRU_write(input);
        }    
      }
    }
  }

  function write() {
    read_write = 1; 
    var input = $("#input").val();
    var replacement = $("#function").val();

    if (input < 0 || input >= memory.size()) {
      jsav.umsg("enter a proper input");
    }
    else {
      if (replacement == 1) {
        LRU_write(input);
      }
      if (replacement == 2) {
        FIFO_write(input);
      }
      if (replacement == 3) {
        LFU_write(input);
      }      
    }  
  }
  function drawlines() {
    for (var i = 0; i < pool.length; i++) {
      var endpoint = contains_kai(pool[i].value(0));
      if (pool[i].value(0) != "") {
        lines[i] = jsav.g.line(452,  40 + 75 * i, 552,  lines_end[endpoint], {'stroke-width' : 2});
      }
    }
  }

  function clearlines() {
    for (var i = 0; i < lines.length; i++) {
      lines[i].hide();
    }
  }

  function LRU(input) {
    clearlines();
    hide_dirty();
    //console.log("LRU");
    if (contains_kai(input) != -1 && LRU_replace == 0) {
      var index = contains_kai(input);
      if (LRU_moveup_kai == 0) {
        list.unhighlight();
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");      
        jsav.umsg("a buffer already contains sector " + input);
        list.highlight(index);
        LRU_moveup_kai++;
      }
      else if (LRU_moveup_kai == 1) {
        var index = contains_kai(input);
        empty_index = index;
        jsav.umsg("the buffer containing secotr " + input + " will be moved to the front of the list");
        list.unhighlight();
        list.value(index, "");
        LRU_moveup_kai++;
      }
    }
    else if (LRU_moveup_kai == 2) {
      for (var i = empty_index-1; i > -1; i--) {
        jsav.effects.moveValue(list, i, list, i+1);
      }
      LRU_moveup_kai++;
    }
    else if (LRU_moveup_kai == 3) {
      jsav.umsg("Sector " + input + " moved to front of the list");
      list.value(0, input);
      list.highlight(0);
      LRU_moveup_kai = 0;
      $("#input").removeAttr("disabled");
      $("#write").removeAttr("disabled");
      $("#read").removeAttr("disabled");
      document.getElementById("input").value = '';
      $("#next").attr("disabled", "disabled");
    }
    else if (buffer_size < pool.length) {
      if (into_list == 0) {
        dirty_bits[input] = 0;
        //console.log(buffer_size);
        list.unhighlight();
        memory.highlight(input);
        pool[buffer_size].highlight();
        jsav.umsg("Reading sector " + input + ". a buffer stores sector");
        //jsav.effects.copyValue(memory, input, pool, buffer_size);
        pool[buffer_size].value(0, input);
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");    
        into_list = 1;
      }
      else if (into_list == 1) {
        if (buffer_size == 0) {
          jsav.umsg("buffer is placed into a list");
          pool[buffer_size].unhighlight();
          list.highlight(0);
          list.value(0, input);
          buffer_size++;
          into_list = 0;
          $("#input").removeAttr("disabled");
          $("#write").removeAttr("disabled");
          $("#read").removeAttr("disabled");
          document.getElementById("input").value = '';
          $("#next").attr("disabled", "disabled");
        }
        else if (LRU_moveup == 0) {
          list.unhighlight();
          jsav.umsg("buffer is place into a list, the recently used buffer will move up in the list");
          pool[buffer_size].unhighlight();   
          list.value(buffer_size, input);
          list.highlight(buffer_size);
          LRU_moveup++;
        }
        else if (LRU_moveup == 1) {
          jsav.umsg("moving recently used buffer to front of the list");
          list.unhighlight();
          list.value(buffer_size, "");
          LRU_moveup++;
        }
        else if (LRU_moveup == 2) {
          jsav.umsg("moving recently used buffer to front of the list");
          list.unhighlight();
          for (var i = buffer_size-1; i > -1; i--) {
            jsav.effects.moveValue(list, i, list, i+1);
          }
          LRU_moveup++;
        }
        else if (LRU_moveup == 3) {
          jsav.umsg("most recently used buffer moved to front of the list");
          list.value(0, input);
          LRU_moveup = 0;
          into_list = 0;
          buffer_size++;
          list.highlight(0);
          $("#input").removeAttr("disabled");
          $("#write").removeAttr("disabled");
          $("#read").removeAttr("disabled");
          document.getElementById("input").value = '';          
          $("#next").attr("disabled", "disabled");          
        }
      }
    }
    else {
      if (into_list == 0) {
        dirty_bits[input] = 0;
        list.unhighlight();
        jsav.umsg("buffer pool full, least recently used buffer will be replaced");
        list.highlight(buffer_size-1);
        var index = contains(list.value(buffer_size-1));
        console.log(index);
        pool[index].highlight();
        into_list = 1;
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");    
      }
      else if (into_list == 1) {
        if (LRU_replace == 0) {
          if (dirty_bits[list.value(buffer_size-1)] ==  0) {
            jsav.umsg("dirty bit = 0, content of buffer will not be written back to disk");
          }
          else {
            jsav.umsg("dirty bit set = 1, contents of buffer written back to disk");
            var new_val = "sector " + list.value(buffer_size-1) + " :" +
            letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0] +
            letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0];
            memory.value(list.value(buffer_size-1), new_val);            
          }
          LRU_replace++;
        }
        else if (LRU_replace == 1) {
          list.unhighlight();
          empty_index = contains(list.value(buffer_size-1));
          pool[empty_index].unhighlight();
          memory.unhighlight(list.value(buffer_size-1));
          dirty_bits[list.value(buffer_size-1)] = 0;
          list.value(buffer_size-1, "");
          pool[empty_index].value(0, "");
          LRU_replace++;
        }
        else if (LRU_replace == 2) {

          memory.highlight(input);
          list.highlight(buffer_size-1);
          pool[empty_index].highlight();
          pool[empty_index].value(0, input);
          list.value(buffer_size-1, input);
          LRU_replace++;
        }
        else if (LRU_replace == 3) {
          pool[empty_index].unhighlight();
          jsav.umsg("moving recently used buffer to front of the list");
          LRU_replace++;          
        }
        else if (LRU_replace == 4) {
          list.unhighlight();
          list.value(buffer_size-1, "");
          LRU_replace++;
        }
        else if (LRU_replace == 5) {
          for (var i = buffer_size-2; i > -1; i--) {
            jsav.effects.moveValue(list, i, list, i+1);
          }
          LRU_replace++;
        }
        else if (LRU_replace == 6) {
          jsav.umsg("most recently used buffer moved to front of the list");
          list.value(0, input);
          LRU_replace = 0;
          into_list = 0;
          list.highlight(0);
          $("#input").removeAttr("disabled");
          $("#write").removeAttr("disabled");
          $("#read").removeAttr("disabled");
          document.getElementById("input").value = '';
          $("#next").attr("disabled", "disabled");
        }
      }
    }
    drawlines();
    show_dirty();
  }

  function LRU_write(input) {
    clearlines();
    hide_dirty();
    if (contains_kai(input) != -1 && LRU_replace == 0) {
      var index = contains_kai(input);
      if (LRU_moveup_kai == 0) {
        list.unhighlight();
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");      
        jsav.umsg("a buffer already contains sector " + input);
        list.highlight(index);
        LRU_moveup_kai++;
      }
      else if (LRU_moveup_kai == 1) {
        jsav.umsg("setting dirty bit");
        dirty_bits[input] = 1;
        LRU_moveup_kai++;
      }
      else if (LRU_moveup_kai == 2) {
        var index = contains_kai(input);
        empty_index = index;
        jsav.umsg("the buffer containing sector " + input + " will be moved to the front of the list");
        list.unhighlight();
        list.value(index, "");
        LRU_moveup_kai++;
      }
    }
    else if (LRU_moveup_kai == 3) {
      jsav.umsg("Moving recently used buffer to front");
      for (var i = empty_index-1; i > -1; i--) {
        jsav.effects.moveValue(list, i, list, i+1);
      }
      LRU_moveup_kai++;
    }
    else if (LRU_moveup_kai == 4) {
      jsav.umsg("Sector " + input + " moved to front of the list");
      list.value(0, input);
      list.highlight(0);
      LRU_moveup_kai = 0;
      $("#input").removeAttr("disabled");
      $("#write").removeAttr("disabled");
      $("#read").removeAttr("disabled");
      document.getElementById("input").value = '';
      $("#next").attr("disabled", "disabled");
    }
    else if (buffer_size < pool.length) {
      if (into_list == 0) {
        //console.log(buffer_size);
        list.unhighlight();
        memory.highlight(input);
        pool[buffer_size].highlight();
        jsav.umsg("Writing to  sector " + input + ", a buffer stores sector");
        //jsav.effects.copyValue(memory, input, pool, buffer_size);
        pool[buffer_size].value(0, input);
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");    
        into_list = 1;
        console.log("into_list: " + into_list);
      }
      else if (into_list == 1) {
        if (buffer_size == 0) {
          jsav.umsg("buffer is placd into a list and dirty bit set to 1");
          pool[buffer_size].unhighlight();
          dirty_bits[input] = 1;
          list.highlight(0);
          list.value(0, input);
          buffer_size++;
          into_list = 0;
          $("#input").removeAttr("disabled");
          $("#write").removeAttr("disabled");
          $("#read").removeAttr("disabled");
          document.getElementById("input").value = '';          
          $("#next").attr("disabled", "disabled");
        }
        else if (LRU_moveup == 0) {
          list.unhighlight();
          jsav.umsg("buffer is place into a list, the recently used buffer will move up in the list");
          pool[buffer_size].unhighlight();   
          list.value(buffer_size, input);
          list.highlight(buffer_size);
          LRU_moveup++;
        }
        else if (LRU_moveup == 1) {
          list.unhighlight();
          jsav.umsg("setting dirty bit");
          pool[buffer_size].unhighlight();   
          list.highlight(buffer_size);
          dirty_bits[input] = 1;
          LRU_moveup++;
        }        
        else if (LRU_moveup == 2) {
          jsav.umsg("moving recently used buffer to front of the list");
          list.unhighlight();
          list.value(buffer_size, "");
          LRU_moveup++;
        }
        else if (LRU_moveup == 3) {
          jsav.umsg("moving recently used buffer to front of the list");
          list.unhighlight();
          for (var i = buffer_size-1; i > -1; i--) {
            jsav.effects.moveValue(list, i, list, i+1);
          }
          LRU_moveup++;
        }
        else if (LRU_moveup == 4) {
          jsav.umsg("most recently used buffer moved to front of the list");
          list.value(0, input);
          LRU_moveup = 0;
          into_list = 0;
          buffer_size++;
          list.highlight(0);
          $("#input").removeAttr("disabled");
          $("#write").removeAttr("disabled");
          $("#read").removeAttr("disabled");
          document.getElementById("input").value = '';          
          $("#next").attr("disabled", "disabled");          
        }
      }
    }
    else {
      if (into_list == 0) {
        dirty_bits[input] = 0;
        list.unhighlight();
        jsav.umsg("buffer pool full, least recently used buffer will be replaced");
        list.highlight(buffer_size-1);
        var index = contains(list.value(buffer_size-1));
        console.log(index);
        pool[index].highlight();
        into_list = 1;
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");    
      }
      else if (into_list == 1) {
        if (LRU_replace == 0) {
          if (dirty_bits[list.value(buffer_size-1)] ==  0) {
            jsav.umsg("dirty bit = 0, content of buffer will not be written back to disk");
          }
          else {
            jsav.umsg("dirty bit set = 1, contents of buffer written back to disk");
            var new_val = "sector " + list.value(buffer_size-1) + " :" +
            letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0] +
            letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0];
            memory.value(list.value(buffer_size-1), new_val);                      
          }
          LRU_replace++;
        }
        else if (LRU_replace == 1) {
          list.unhighlight();
          empty_index = contains(list.value(buffer_size-1));
          pool[empty_index].unhighlight();
          memory.unhighlight(list.value(buffer_size-1));
          dirty_bits[list.value(buffer_size-1)] = 0;
          list.value(buffer_size-1, "");
          pool[empty_index].value(0, "");
          LRU_replace++;
        }
        else if (LRU_replace == 2) {

          memory.highlight(input);
          list.highlight(buffer_size-1);
          pool[empty_index].highlight();
          pool[empty_index].value(0, input);
          list.value(buffer_size-1, input);
          LRU_replace++;
        }
        else if (LRU_replace == 3) {
          jsav.umsg("setting dirty bit");
          dirty_bits[input] = 1;
          LRU_replace++;
        }
        else if (LRU_replace == 4) {
          pool[empty_index].unhighlight();
          jsav.umsg("moving recently used buffer to front of the list");
          LRU_replace++;          
        }
        else if (LRU_replace == 5) {
          list.unhighlight();
          list.value(buffer_size-1, "");
          LRU_replace++;
        }
        else if (LRU_replace == 6) {
          for (var i = buffer_size-2; i > -1; i--) {
            jsav.effects.moveValue(list, i, list, i+1);
          }
          LRU_replace++;
        }
        else if (LRU_replace == 7) {
          jsav.umsg("most recently used buffer moved to front of the list");
          list.value(0, input);
          LRU_replace = 0;
          into_list = 0;
          list.highlight(0);
          $("#input").removeAttr("disabled");
          $("#write").removeAttr("disabled");
          $("#read").removeAttr("disabled");
          document.getElementById("input").value = '';          
          $("#next").attr("disabled", "disabled");
        }
      }
    }
    drawlines();
    show_dirty();
  }

  function FIFO(input) {
    clearlines();
    unhighlight_pool();
    hide_dirty();
    if (contains_kai(input) != -1) {
      jsav.umsg("sector " + input + " already in one of the buffers");
      list.unhighlight();
      list.highlight(contains_kai(input));
      pool[contains(input)].highlight();
    }
    else if (buffer_size < pool.length) {
      if (into_list == 0) {
        dirty_bits[input] = 0;
        //console.log(buffer_size);
        list.unhighlight();
        memory.highlight(input);
        pool[buffer_size].highlight();
        jsav.umsg("a buffer stores sector " + input + " from storage");
        //jsav.effects.copyValue(memory, input, pool, buffer_size);
        pool[buffer_size].value(0, input);
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");   
        into_list = 1;
      }
      else if (into_list == 1) {
        jsav.umsg("buffer is placed into a list");
        pool[buffer_size].unhighlight();
        list.unhighlight();
        for (var i = buffer_size-1; i > -1; i--) {
          jsav.effects.moveValue(list, i, list, i+1);
        }
        into_list++;
      }
      else if (into_list == 2) {
        list.highlight(0);
        list.value(0, input);
        $("#input").removeAttr("disabled");
        $("#write").removeAttr("disabled");
        $("#read").removeAttr("disabled");
        document.getElementById("input").value = '';        
        $("#next").attr("disabled", "disabled");      
        into_list = 0;
        buffer_size++;        
      }
    }
    else {
      if (into_list == 0) {
        dirty_bits[input] = 0;
        jsav.umsg("buffer pool full, buffer at front of queue will be replaced");
        list.unhighlight();
        list.highlight(buffer_size-1);
        var index = contains(list.value(buffer_size-1));
        console.log(index);
        pool[index].highlight();
        into_list = 1;
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");   
      }
      else if (into_list == 1) {
        if (dirty_bits[list.value(buffer_size-1)] ==  0) {
          jsav.umsg("dirty bit = 0, content of buffer will not be written back to disk");
        }
        else {
          jsav.umsg("dirty bit = 1, contents of buffer written back to disk");
          var new_val = "sector " + list.value(buffer_size-1) + " :" +
          letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0] +
          letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0];
          memory.value(list.value(buffer_size-1), new_val);                      
        }
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");   
        into_list++;
      }
      else if (into_list == 2) {
        list.unhighlight();
        empty_index = contains(list.value(buffer_size-1));
        pool[empty_index].unhighlight();
        memory.unhighlight(list.value(buffer_size-1));
        dirty_bits[list.value(buffer_size-1)] = 0;
        list.value(buffer_size-1, "");
        pool[empty_index].value(0, "");
        into_list++;        
      }
      else if (into_list == 3) {
        for (var i = buffer_size-2; i > -1; i--) {
          jsav.effects.moveValue(list, i, list, i+1);
        }
        into_list++;
      }
      else if (into_list == 4) {
        jsav.umsg("contents of sector " + input + " copied into buffer pool");
        memory.highlight(input);
        pool[empty_index].value(0, input);
        list.value(0, input);
        list.highlight(0);
        into_list = 0;
        $("#input").removeAttr("disabled");
        $("#write").removeAttr("disabled");
        $("#read").removeAttr("disabled");
        document.getElementById("input").value = '';        
        $("#next").attr("disabled", "disabled");        
      }
    }
    drawlines();
    show_dirty();
  }

  function FIFO_write(input) {
    clearlines();
    unhighlight_pool();
    hide_dirty();
    if (contains_kai(input) != -1 && into_list == 0) {
      jsav.umsg("sector " + input + " already in one of the buffers<br>setting dirty bit");
      dirty_bits[input] = 1;
      list.unhighlight();
      list.highlight(contains_kai(input));
      pool[contains(input)].highlight();
    }
    else if (buffer_size < pool.length) {
      if (into_list == 0) {
        dirty_bits[input] = 0;
        //console.log(buffer_size);
        list.unhighlight();
        memory.highlight(input);
        pool[buffer_size].highlight();
        jsav.umsg("a buffer stores sector " + input + " from storage");
        //jsav.effects.copyValue(memory, input, pool, buffer_size);
        pool[buffer_size].value(0, input);
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");  
        into_list = 1;
      }
      else if (into_list == 1) {
        jsav.umsg("buffer is placed into a list");
        pool[buffer_size].unhighlight();
        list.unhighlight();
        for (var i = buffer_size-1; i > -1; i--) {
          jsav.effects.moveValue(list, i, list, i+1);
        }
        into_list++;
      }
      else if (into_list == 2) {
        list.highlight(0);
        list.value(0, input);   
        into_list++; 
      }
      else if (into_list == 3) {
        jsav.umsg("setting dirty bit");
        dirty_bits[input] = 1;
        $("#input").removeAttr("disabled");
        $("#write").removeAttr("disabled");
        $("#read").removeAttr("disabled");
        document.getElementById("input").value = '';        
        $("#next").attr("disabled", "disabled");            
        into_list = 0;
        buffer_size++;            
      }
    }
    else {
      if (into_list == 0) {
        dirty_bits[input] = 0;
        jsav.umsg("buffer pool full, buffer at front of queue will be replaced");
        list.unhighlight();
        list.highlight(buffer_size-1);
        var index = contains(list.value(buffer_size-1));
        console.log(index);
        pool[index].highlight();
        into_list = 1;
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");  
      }
      else if (into_list == 1) {
        if (dirty_bits[list.value(buffer_size-1)] ==  0) {
          jsav.umsg("dirty bit = 0, content of buffer will not be written back to disk");
        }
        else {
          jsav.umsg("dirty bit = 1, contents of buffer written back to disk");
          var new_val = "sector " + list.value(buffer_size-1) + " :" +
          letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0] +
          letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0];
          memory.value(list.value(buffer_size-1), new_val);        
        }
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");  
        into_list++;
      }
      else if (into_list == 2) {
        list.unhighlight();
        empty_index = contains(list.value(buffer_size-1));
        pool[empty_index].unhighlight();
        memory.unhighlight(list.value(buffer_size-1));
        dirty_bits[list.value(buffer_size-1)] = 0;
        list.value(buffer_size-1, "");
        pool[empty_index].value(0, "");
        into_list++;        
      }
      else if (into_list == 3) {
        for (var i = buffer_size-2; i > -1; i--) {
          jsav.effects.moveValue(list, i, list, i+1);
        }
        into_list++;
      }
      else if (into_list == 4) {
        jsav.umsg("contents of sector " + input + " copied into buffer pool");
        memory.highlight(input);
        pool[empty_index].value(0, input);
        list.value(0, input);
        list.highlight(0);
        into_list++;
          
      }
      else if (into_list == 5) {
        jsav.umsg("setting dirty bit");
        dirty_bits[input] = 1;     
        into_list = 0;        
        $("#input").removeAttr("disabled");
        $("#write").removeAttr("disabled");
        $("#read").removeAttr("disabled");
        document.getElementById("input").value = '';        
        $("#next").attr("disabled", "disabled");  
      }
    }
    drawlines();
    show_dirty();
  }

  function LFU(input) {
    hide_counters();
    clearlines();
    unhighlight_pool();
    list.unhighlight();
    hide_dirty();
    if (contains_kai(input) != -1) {
      jsav.umsg("a buffer already contains sector, incrementing counter");
      list.highlight(contains_kai(input));
      pool[contains_kai(input)].highlight();
      LFU_counter[input]++;
    }
    else if (buffer_size < pool.length) {
      if (into_list == 0) {
        //console.log(buffer_size);
        list.unhighlight();
        dirty_bits[input] = 0;
        memory.highlight(input);
        pool[buffer_size].highlight();
        jsav.umsg("a buffer stores sector " + input + " from storage");
        //jsav.effects.copyValue(memory, input, pool, buffer_size);
        pool[buffer_size].value(0, input);
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");     
        into_list = 1;
      }
      else if (into_list == 1) {
        jsav.umsg("buffer is placed into a list");
        pool[buffer_size].unhighlight();
        list.unhighlight();
        list.value(buffer_size, input);
        list.highlight(buffer_size);
        into_list = 0;
        $("#input").removeAttr("disabled");
        $("#write").removeAttr("disabled");
        $("#read").removeAttr("disabled");
        document.getElementById("input").value = '';        
        $("#next").attr("disabled", "disabled");     
        buffer_size++;
      }
    }
    else {
      if (into_list == 0) {
        dirty_bits[input] = 0;
        jsav.umsg("buffer pool full, least frequently used buffer will be replaced");
        var min = LFU_counter[list.value(0)];
        var min_index = 0;
        for (var i = 1; i < list.size(); i++) {
          if (LFU_counter[list.value(i)] < min) {
            min = LFU_counter[list.value(i)];
            min_index = i;
          }
        }
        list.unhighlight();
        list.highlight(min_index);
        empty_index = contains(list.value(min_index));
        pool[empty_index].highlight();
        LFU_index = min_index;
        into_list++;
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled");     
      }
      else if (into_list == 1) {
        list.unhighlight();
        LFU_counter[list.value(LFU_index)] = 0;
        if (dirty_bits[list.value(LFU_index)] ==  0) {
          jsav.umsg("dirty bit = 0, content of buffer will not be written back to disk");
        }
        else {
          jsav.umsg("dirty bit set = 1, contents of buffer written back to disk");
          var new_val = "sector " + list.value(buffer_size-1) + " :" +
          letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0] +
          letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0];
          memory.value(list.value(buffer_size-1), new_val);          
        }
        dirty_bits[list.value(LFU_index)] = -1;
        list.value(LFU_index, "");
        pool[empty_index].unhighlight();
        pool[empty_index].value(0, "");
        into_list++;
      }
      else if (into_list == 2) {
        jsav.clearumsg();
        list.value(LFU_index, input);
        pool[empty_index].value(0, input);
        into_list = 0;
        $("#input").removeAttr("disabled");
        $("#write").removeAttr("disabled");
        $("#read").removeAttr("disabled");
        document.getElementById("input").value = '';        
        $("#next").attr("disabled", "disabled"); 
      }
    }
    show_counters();
    drawlines();
    show_dirty();
  }

  function LFU_write(input) {
    hide_counters();
    clearlines();
    unhighlight_pool();
    list.unhighlight();
    hide_dirty();
    if (contains_kai(input) != -1) {
      jsav.umsg("a buffer already contains sector, incrementing counter and setting dirty bit");
      list.highlight(contains_kai(input));
      dirty_bits[input] = 1;
      pool[contains_kai(input)].highlight();
      LFU_counter[input]++;
    }
    else if (buffer_size < pool.length) {
      if (into_list == 0) {
        //console.log(buffer_size);
        list.unhighlight();
        dirty_bits[input] = 0;
        memory.highlight(input);
        pool[buffer_size].highlight();
        jsav.umsg("a buffer stores sector " + input + " from storage");
        //jsav.effects.copyValue(memory, input, pool, buffer_size);
        pool[buffer_size].value(0, input);
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled"); 
        into_list = 1;
      }
      else if (into_list == 1) {
        jsav.umsg("buffer is placed into a list and dirty bit set to 1");
        pool[buffer_size].unhighlight();
        list.unhighlight();
        list.value(buffer_size, input);
        list.highlight(buffer_size);
        into_list = 0;
        drity_bits[input] = 1;
        $("#input").removeAttr("disabled");
        $("#write").removeAttr("disabled");
        $("#read").removeAttr("disabled");
        document.getElementById("input").value = '';        
        $("#next").attr("disabled", "disabled");    
        buffer_size++;
      }
    }
    else {
      if (into_list == 0) {
        dirty_bits[input] = 0;
        jsav.umsg("buffer pool full, least frequently used buffer will be replaced");
        var min = LFU_counter[list.value(0)];
        var min_index = 0;
        for (var i = 1; i < list.size(); i++) {
          if (LFU_counter[list.value(i)] < min) {
            min = LFU_counter[list.value(i)];
            min_index = i;
          }
        }
        list.unhighlight();
        list.highlight(min_index);
        empty_index = contains(list.value(min_index));
        pool[empty_index].highlight();
        LFU_index = min_index;
        into_list++;
        $("#write").attr("disabled", "disabled");
        $("#read").attr("disabled", "disabled");          
        $("#input").attr("disabled", "disabled");
        $("#next").removeAttr("disabled"); 
      }
      else if (into_list == 1) {
        list.unhighlight();
        LFU_counter[list.value(LFU_index)] = 0;
        if (dirty_bits[list.value(LFU_index)] ==  0) {
          jsav.umsg("dirty bit = 0, content of buffer will not be written back to disk");
        }
        else {
          jsav.umsg("dirty bit set = 1, contents of buffer written back to disk");
          var new_val = "sector " + list.value(buffer_size-1) + " :" +
          letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0] +
          letter[Math.floor(Math.random() * (memory.size() - 0 + 1)) + 0];
          memory.value(list.value(buffer_size-1), new_val);        
        }
        dirty_bits[list.value(LFU_index)] = -1;
        list.value(LFU_index, "");
        pool[empty_index].unhighlight();
        pool[empty_index].value(0, "");
        into_list++;
      }
      else if (into_list == 2) {
        jsav.umsg("buffer is placed into a list and dirty bit set to 1");
        dirty_bits[input] = 1;
        list.value(LFU_index, input);
        pool[empty_index].value(0, input);
        into_list = 0;
        $("#input").removeAttr("disabled");
        $("#write").removeAttr("disabled");
        $("#read").removeAttr("disabled");
        document.getElementById("input").value = '';        
        $("#next").attr("disabled", "disabled");
      }
    }
    show_counters();
    drawlines();
    show_dirty();
  }
  // update the arrays to match the parameters
  function update() {
    if (divider) {
      divider.hide();
    }
    buffer_size = 0;
    if (pool) {
      for (var i = 0; i < pool.length; i++) {
        pool[i].clear();
      }
    }
    if (list) {
      list.clear();
    }
    if (memory) {
      memory.clear();
    }
    jsav.clearumsg();

    var missingFields = [];
    // Ensure user selected replacement strategy
    if ($('#function').val() === '0') {
      missingFields.push('replacement strategy');
    }
    // Ensure user selected main memory size
    if ($('#mainmemory_size').val() === '0') {
      missingFields.push('main memory size');
    }
    // create new array for main memory
    else {
      var temp = [];
      for (var i = 0; i < $('#mainmemory_size').val(); i++) {
        temp[i] = "sector " + i + ": " + letter[i] + letter[i];
        LFU_counter[i] = 0;
        dirty_bits[i] = 0;
      }
      memory = jsav.ds.array(temp, {layout: "vertical", left: 100});
    }
    // Ensure user selected buffer pool size
    if ($('#bufferpool_size').val() === '0') {
      missingFields.push('buffer pool size');
    }
    else {
      var empty = [];
      empty.length = 1;
      for (var i = 0; i < $('#bufferpool_size').val(); i++) {
        pool[i] = jsav.ds.array(empty, {layout: "vertical", left: 330, top: (i* 75)});
      }
      empty.length =  $('#bufferpool_size').val();
      list = jsav.ds.array(empty, {layout: "vertical", left: 550});
      divider = jsav.g.line(635, 16, 635, 62 + (empty.length-1) * 46.5, {'stroke-width' : 1.5});
    }
    // disable input box if fields are missing
    if (missingFields.length > 0) {
      $("#input").attr("disabled", "disabled");
      $("#next").attr("disabled", "disabled");      
      $("#write").attr("disabled", "disabled");
      $("#read").attr("disabled", "disabled");
    }
    // diable parameters once users finished selecting
    else {
      $("#input").removeAttr("disabled");
      $("#write").removeAttr("disabled");
      $("#next").removeAttr("disabled");      
      $("#read").removeAttr("disabled");
      $("#function").attr("disabled", "disabled");
      $("#mainmemory_size").attr("disabled", "disabled");
      $("#bufferpool_size").attr("disabled", "disabled");
      jsav.umsg("Enter a value and click read");
    }
  }

  // Connect action callbacks to the HTML entities
  $("#about").click(about);
  $("#read").click(read);
  $("#write").click(write);
  $("#next").click(next);
  $("#function").change(update);
  $("#mainmemory_size").change(update);
  $("#bufferpool_size").change(update);
  $("#restart").click(function () {
    location.reload(true);
  });

  var jsav,                 // jsav
      buffer_size = 0,      // number of elements in buffer pool
      pool,                 // array holding jsav array (for buffers)
      list,                 // jsav array for list representation
      memory,               // jsav array for disk
      lines,                // array holding jsav lines
      LRU_moveup = 0,
      LRU_moveup_kai = 0,    
      LRU_replace = 0,
      empty_index = 0,
      into_list = 0,
      LFU_index = 0;
  var letter = ["A", "B", "C", "D", "E", "F", "G", "F", "I"];
  var lines_end = [];
  var LFU_counter = [];
  var label_array = [];
  var divider;
  var dirty_bits = [];
  var dirty_bit_array = [];
  var read_write = 0;       // if reading = 0, writing = 1

  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  console.log("Code object: " + JSON.stringify(code));

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings"));

  initialize()
});
