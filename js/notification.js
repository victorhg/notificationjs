var BOSH_SERVICE = 'talk.google.com:5222'
var SERVICE_USER = 'pycon.bot@gmail.com' 
var SERVICE_PWD = 'pycon123'
var connection = null;

function rawInput(data) {
   log('RECV:' + data);
}

function rawOutput(data) {
   log('SENT:' + data);
}

function onConnect(status) {
   log(status);
}

function log(data) {

   $('#log').append("<div></div>").append(document.createTextNode(data ));
}

$(function(){
   connection = new Strophe.Connection(BOSH_SERVICE);
   connection.rawInput = rawInput;
   connection.rawOutput = rawOutput;

   connection.connect(SERVICE_USER, SERVICE_PWD, onConnect);
});
