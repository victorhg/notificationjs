
var Log = (function () {
    var write = function(data) {
       $('#log').append("<div></div>").append(document.createTextNode(data ));
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

