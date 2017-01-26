function BlockPyHistory(main) {
    this.main = main;
}

var monthNames = [
  "Jan", "Feb", "Mar",
  "Apr", "May", "June", "July",
  "Aug", "Sept", "Oct",
  "Nov", "Dec"
];
var weekDays = [
    "Sun", "Mon", "Tue",
    "Wed", "Thu", "Fri",
    "Sat"
];


BlockPyHistory.prototype.openDialog = function() {
    var dialog = this.main.components.dialog;
    var body = "<pre>a = 0</pre>";
    this.main.components.server.getHistory(function (data) {
        body = data.reverse().reduce(function (complete, elem) { 
            // 
            var year = elem.time.slice(0, 4),
                month = parseInt(elem.time.slice(4, 6), 10)-1,
                day = elem.time.slice(6, 8),
                hour = elem.time.slice(9, 11),
                minutes = elem.time.slice(11, 13),
                seconds = elem.time.slice(13, 15);
            var time_str = hour+":"+minutes+":"+seconds,
                date_str = year+"/"+month+"/"+day;
            var date = new Date(year, month, day, hour, minutes, seconds);
            var dayStr = weekDays[date.getDay()];
            var monthStr = monthNames[date.getMonth()];
            var yearFull = date.getFullYear();
            //var complete_str = time_str + " "+date_str;
            //var complete_str = date.toUTCString();
            var complete_str = dayStr+", "+monthStr+" "+date.getDate()+", "+yearFull+" at "+date.toLocaleTimeString();
            var new_line = "<b>"+complete_str+"</b><br><pre>"+elem.code+"</pre>";
            return complete+"\n"+new_line;
        }, "");
        dialog.show("Work History", body, function() {});
    });
};