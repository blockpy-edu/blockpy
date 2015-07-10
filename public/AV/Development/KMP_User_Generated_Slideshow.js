
var kmp_exercise, master_str, sub_str;

//This function computes the alignment lookup table for the KMP algorithm
function compute_align_array(arr) {
var align = new Array();
align[0] = -1;
align[1] = 0;
var q = 0;
L = arr.length;
for(var p = 2; p < L; p++) {
  q = align[p-1];
  while((q>=0) && (arr[q] != arr[p-1])) {
    q = align[q];
  }
  align[p] = q+1;
}
return align;
}


function kmp(master, sub, align) {

    var m = 0;
    var s = 0;
    //highlight the first spots
    master.highlight(m);
    sub.highlight(m);   
    kmp_exercise.step();
    var n = 0;
    var found = false;
    while((m < sub.size()-1) && (sub_str.length - s <= master.size() - m)) {
      align.unhighlight();
      if(master.value(m) === sub.value(m)) {          
        m+=1;
        s+=1;
        //case that we have found a match
        if(sub.value(m) == ' ') {
          found = true;
          break;
        }
        master.unhighlight(m-1);
        sub.unhighlight(m-1);          
        master.highlight(m);
        sub.highlight(m);
      } else if(s == 0) {
        m+=1;
        for(var i = sub.size()-1; i > 0; i--){
          sub.value(i, sub.value(i-1));
        }
        sub.value(m-1, ' ');
        master.unhighlight();
        sub.unhighlight();
        master.highlight(m);
        sub.highlight(m);
      } else {
        n = s;
        align.highlight(s);        
        s = align.value(s);

        for(var i = sub.size()-1; i > m-1; i--){
          sub.value(i, sub.value(i-(n-s)));
        }     
        for(var i = 0; i < m-s; i++){
          sub.value(i, ' ');
        }
        sub.unhighlight();
        sub.highlight(m);
      }
      kmp_exercise.step();
    }
      kmp_exercise.recorded();
    if(s == sub_str.length-1 || found) {
      return m - s;
    } else {
      return -1;
    }
  }

//This function initializes the arrays, and handles the clicks on the specific indexes, see comments in method for more information
function make_arrays(){
  kmp_exercise = new JSAV("container");

  var max = 0;


  master_str = $("#search_in").val();
  sub_str = $("#search_for").val();
  $("#go_button").remove();


  var master_arr = new Array();
  var sub_arr = new Array();

  master_arr = master_str.split("");
  sub_arr = sub_str.split("");

  //var index_match = kmp(master_arr, sub_arr);
  //console.log("supposed answer: "+index_match);

  main_text = kmp_exercise.ds.array([' '], {indexed: true});


  for(i=0; i<master_str.length;i++) {
  	main_text.value(i, master_str.charAt(i));
  }

  search_string = kmp_exercise.ds.array([' ']);

  for(z=0;z<search_string.size();z++) {
  	search_string.value(z, ' ');
  }

  //need to make the arrays align nicely so we need to fill the remaining indexes of the substring array with empty characters 
  for(j=0;j<master_str.length;j++) {
    if(sub_str.charAt(j).length > 0) {
  	  search_string.value(j, sub_str.charAt(j));
    } else {
      search_string.value(j, " ");
    }
  }
  //initializing the alignment array
  var alignment_table = kmp_exercise.ds.array([' ']);
  var align_table_temp = new Array();
  align_table_temp = compute_align_array(sub_arr);
  for(f=0;f<align_table_temp.length;f++) {
    alignment_table.value(f, align_table_temp[f]);
  }
  kmp_exercise.displayInit();
  kmp_exercise.step();
  kmp(main_text, search_string, alignment_table);

}