
var Log = (function () {
    var write = function(data) {
        var log = $('#log');
       log.append($("<div></div>").text(data) );
       log.get(0).scrollTop = log.get(0).scrollHeight;


    } 
    var obj = {
        rawInput: function(data) {
           write('RECV:' + data);
        },
        rawOutput: function(data) {
           write('SENT:' + data);
        }
   };
    return obj;
})();

