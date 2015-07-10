function newCircuit(){
  var board={"gates":[],"signals":[],"branchpoints":[]};

  board.addGate = function addGate(av,GateType,x,y,r){
    if(["and","or","not","xor","nand","nor","nxor"].indexOf(GateType.toLowerCase())<0){
      return -1;
    }
    str=" M "+(x+0.8*r)+","+y;
  
    if(GateType.toLowerCase() == "not"){
      str+=" L "+(x-0.5*r)+","+(y-0.8*r);
      str+=" L "+(x-0.5*r)+","+(y+0.8*r);
      str+=" L "+(x+0.8*r)+","+y;
    }
    else {
      if(["or","nor","xor","nxor"].indexOf(GateType.toLowerCase())>=0){
        str+=" A "+1.75*r+","+r+" 0 0,1 "+(x-0.25*r)+","+(y+0.8*r);
        str+=" L "+(x-1.25*r)+","+(y+0.8*r);
        str+= " A "+(0.5*r)+","+(0.8*r)+" 0 1,0 "+(x-1.25*r)+","+(y-0.8*r);
        str+=" L "+(x-0.25*r)+","+(y-0.8*r);
        str+= " A "+1.75*r+","+r+" 0 0,1 "+(x+0.8*r)+","+y;
      }
      else if(["and","nand"].indexOf(GateType.toLowerCase())>=0){
        str+=" A "+r+","+(0.8*r)+" 0 0,1 "+x+","+(y+0.8*r);
        str+=" L "+(x-0.8*r)+","+(y+0.8*r);
        str+=" L "+(x-0.8*r)+","+(y-0.8*r);
        str+=" L "+x+","+(y-0.8*r);
        str+= " A "+r+","+(0.8*r)+" 0 0,1 "+(x+0.8*r)+","+y;
      }
    }
    if(["not","nand","nor","nxor"].indexOf(GateType.toLowerCase())>=0){
      str+= " A "+(0.1*r)+","+(0.1*r)+" 0 1,1 "+(x+1.2*r)+","+y;
      str+= " A "+(0.1*r)+","+(0.1*r)+" 0 0,1 "+(x+0.8*r)+","+y;
    }
    if(["xor","nxor"].indexOf(GateType.toLowerCase())>=0){
      str+= " M "+(x-1.5*r)+","+(y+0.8*r);
      str+= " A "+(0.5*r)+","+(0.8*r)+" 0 1,0 "+(x-1.5*r)+","+(y-0.8*r);
      str+= " A "+(0.5*r)+","+(0.8*r)+" 0 1,1 "+(x-1.5*r)+","+(y+0.8*r);
    }
    var c = av.g.path(str);
    c.x = x;
    c.y = y;
    c.r = r;
    c.input=[];
    c.output=[];
    c.endpoints=[];
    var t;
    //input wire
    if(["and","nand"].indexOf(GateType.toLowerCase())>=0){
      t = av.g.line(x-1.5*r,y-0.4*r,x-0.8*r,y-0.4*r);
      t.addClass("ipWire");
      c.endpoints.push([x-1.5*r,y-0.4*r]);
      c.input.push(t);

      t = av.g.line(x-1.5*r,y,x-0.8*r,y);
      t.addClass("ipWire");
      t.addClass("invisible");
      t.hide();
      c.endpoints.push([x-1.5*r,y]);
      c.input.push(t);

      t = av.g.line(x-1.5*r,y+0.4*r,x-0.8*r,y+0.4*r);
      t.addClass("ipWire");
      c.endpoints.push([x-1.5*r,y+0.4*r]);
      c.input.push(t);
    }
    else if(["not"].indexOf(GateType.toLowerCase())>=0){
      t = av.g.line(x-1.2*r,y,x-0.5*r,y);
      t.addClass("ipWire");
      c.endpoints.push([x-1.2*r,y]);
      c.input.push(t);
    }
    else{
      t = av.g.line(x-0.8*r,y-0.4*r,x-1.95*r,y-0.4*r);
      t.addClass("ipWire");
      c.endpoints.push([x-1.95*r,y-0.4*r]);
      c.input.push(t);

      t = av.g.line(x-0.8*r,y,x-1.95*r,y);
      t.addClass("ipWire");
      t.addClass("invisible");
      t.hide();
      c.endpoints.push([x-1.95*r,y]);
      c.input.push(t);

      t = av.g.line(x-0.8*r,y+0.4*r,x-1.95*r,y+0.4*r);
      t.addClass("ipWire");
      c.endpoints.push([x-1.95*r,y+0.4*r]);
      c.input.push(t);
    }

    //output wire
    if(["not","nand","nor","nxor"].indexOf(GateType.toLowerCase())>=0){
      t = av.g.line(x+1.2*r,y,x+1.9*r,y)
      c.endpoints.push([x+1.9*r,y]);
    }
    else{
      t = av.g.line(x+0.8*r,y,x+1.5*r,y)
      c.endpoints.push([x+1.5*r,y]);
    }

    t.addClass("opWire");
    c.output.push(t);
    this["gates"].push(c);
    c.addClass("Gate");
    return c; 
  }
 
  board.addBranchPoint=function(av,x,y){
    var p = av.g.circle(x,y,3,{"fill":"black"});
    this["branchpoints"].push(p);
    return p;
  }
 
  board.getGates = function(){
	return this["gates"];
  }

  board.getSignals = function(){
	return this["signals"];
  }
 
  board.addSignals = function(arr){
      for(var i in arr)
          this["signals"][arr[i]]=[];
  }
  
  board.hide = function(){
    for( var i in this["gates"]){
        var gate = this["gates"][i];
        gate.hide();
        for( var i in gate.input)
	    gate.input[i].hide();
        for( var i in gate.output)
	    gate.output[i].hide();
    }

    for( var i in this["branchpoints"])
        this["branchpoints"][i].hide();
    for( var i in this["signals"])
    	for( var j in this["signals"][i])
           this["signals"][i][j].hide();
    
  }

  board.show = function(){
    for( var i in this["gates"]){
        var gate = this["gates"][i];
        gate.show();
        for( var i in gate.input)
            if(!gate.input[i].hasClass("invisible"))
	        gate.input[i].show();
        for( var i in gate.output)
	    gate.output[i].show();
    }

    for( var i in this["branchpoints"])
        this["branchpoints"][i].show();
    for( var i in this["signals"])
    	for( var j in this["signals"][i])
           this["signals"][i][j].show();
    
  }

  board.clearGate = function(gate){
    gate.hide();
    for( var i in gate.input)
	gate.input[i].hide();
    for( var i in gate.output)
	gate.output[i].hide();
    var ind = this["gates"].indexOf(gate);
    this["gates"].splice(ind,1);
  }

  board.connectGates = function(av,gate1,gate2,ip,brkpoints){
    var opline = gate1.endpoints[gate1.endpoints.length - 1];
    var ipline;
    while(brkpoints.length>0){
        ipline = brkpoints.shift();
    	t = av.g.line(opline[0],opline[1],ipline[0],ipline[1]);
        t.addClass("opWire");
        gate1.output.push(t);
        opline[0] = ipline[0];
        opline[1] = ipline[1];
    }
    t = av.g.line(opline[0],opline[1],gate2.endpoints[ip][0],gate2.endpoints[ip][1]);
    t.addClass("opWire");
    gate1.output.push(t);
  }

  board.inputToGate = function(av,sname,startpt,gate,ip,brkpoints){
    var ipline;
    var opline=[startpt[0],startpt[1]];
    while(brkpoints.length>0){
        ipline = brkpoints.shift();
    	t = av.g.line(opline[0],opline[1],ipline[0],ipline[1]);
        this["signals"][sname].push(t);
        opline[0] = ipline[0];
        opline[1] = ipline[1];
    }
    t = av.g.line(opline[0],opline[1],gate.endpoints[ip][0],gate.endpoints[ip][1]);
    this["signals"][sname].push(t);
  }

  board.changeGate = function(av,gate,type){
        var i = this["gates"].indexOf(gate);
        gate.hide();
        var newGate = board.addGate(av,type,gate.x,gate.y,gate.r);  
        return newGate;
  }
 
  board.assignBP = function(bp,bool){
     if(bool==1){
       bp.css({"fill":"#33FF00"});
       bp.css({"stroke":"#33FF00"});
     }
     else if(bool==0){
       bp.css({"stroke":"red"});
       bp.css({"fill":"red"});
     }
  }

  board.unassignBP = function(bp){
    bp.css({"fill":"black"});
    bp.css({"stroke":"black"});
  }

  board.assignOP = function(gate,bool){
      for(var i in gate.output){
         if(gate.output[i].hasClass("opWire")){
            if(bool==1)
                gate.output[i].css({"stroke":"#33FF00"});
            else if(bool==0)
                gate.output[i].css({"stroke":"red"});
            gate.output[i].css({"stroke-width":"2"});
         }
      }
  }

 
  board.unassignOP = function(gate){
      for(var i in gate.output){
         if(gate.output[i].hasClass("opWire")){
            gate.output[i].css({"stroke":"black"});
            gate.output[i].css({"stroke-width":"1"});
         }
      }
  }
 
  board.assignIP = function(gate,ip,bool){
     if(gate.input[ip].hasClass("ipWire")){
        if(bool==1)
            gate.input[ip].css({"stroke":"#33FF00"});
        else if(bool==0)
            gate.input[ip].css({"stroke":"red"});
        gate.input[ip].css({"stroke-width":"2"});
     }
  }

  board.unassignIP = function(gate,ip){
     if(gate.input[ip].hasClass("ipWire")){
        gate.input[ip].css({"stroke":"black"});
        gate.input[ip].css({"stroke-width":"1"});
     }
  }

  board.assignSignal = function(sname,bool){
      for(var i in this["signals"][sname]){
          if(bool==1)
              this["signals"][sname][i].css({"stroke":"#33FF00"});
          else if(bool==0)
              this["signals"][sname][i].css({"stroke":"red"});
          this["signals"][sname][i].css({"stroke-width":"2"});
       }
  }

  board.unassignSignal = function(sname){
      for(var i in this["signals"][sname]){
          this["signals"][sname][i].css({"stroke":"black"});
          this["signals"][sname][i].css({"stroke-width":"1"});
       }
  }

  return board;
}
