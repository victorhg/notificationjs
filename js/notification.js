var BOSH_SERVICE = 'http://mymac.local:7070/http-bind'
var SERVICE_USER = 'admin' 
var SERVICE_PWD = '123456'
var connection = null;

function rawInput(data) {
   log('RECV:' + data);
}

function rawOutput(data) {
   log('SENT:' + data);
}

function onConnect(status) {
   if (status == Strophe.Status.CONNECTING) {
      log('Strophe is connecting.');
   } else if (status == Strophe.Status.CONNFAIL) {
	log('Strophe failed to connect.');
	  $('#connect').get(0).value = 'connect';
   } else if (status == Strophe.Status.DISCONNECTING) {
	  log('Strophe is disconnecting.');
   } else if (status == Strophe.Status.DISCONNECTED) {
	  log('Strophe is disconnected.');
	  $('#connect').get(0).value = 'connect';
   } else if (status == Strophe.Status.CONNECTED) {
	  log('Strophe is connected.');
   	  connection.disconnect();
   }
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
