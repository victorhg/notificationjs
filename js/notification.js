var BOSH_SERVICE = '/http-bind/'
var SERVICE_USER = 'victorhg' 
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
	  log('#### STROPHE CONNECTED ###');
      connection.addHandler(onMessage, null, 'message', null, null, null);
      connection.send($pres().tree());
   }
}

function onPresence(msg) {
   log("PRESENCE: " + msg); 
}

function onMessage(msg) {
   to = msg.getAttribute('to');
   from = msg.getAttribute('from');
   type = msg.getAttribute('type');
   elems = msg.getElementsByTagName('body');
   if (type == 'chat' && elems.length > 0) {
      body = elems[0];
   log('MSG: from ' + from + ': '+ Strophe.getText(body));
       reply = $msg({to: from, from: to, type: 'chat' }).cnode(Strophe.copyElement(body));
       connection.send(reply.tree());
      log('SENDING: ' + from + ': ' + Strophe.getText(body));

   }

   return true;
}

function log(data) {

   $('#log').append("<div></div>").append(document.createTextNode(data ));
}

$(function(){
   connection = new Strophe.Connection(BOSH_SERVICE);
   connection.rawInput = rawInput;
   connection.rawOutput = rawOutput;
    $('#connect').bind('click', function () {
        var button = $('#connect').get(0);
        if (button.value == 'connect') {
            button.value = 'disconnect';

            connection.connect($('#jid').get(0).value,
                       $('#pass').get(0).value,
                       onConnect);
        } else {
            button.value = 'connect';
            connection.disconnect();
        }
    });
});
