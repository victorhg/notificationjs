var BOSH_SERVICE = '/http-bind/'
var connection = null;
var from_user = null;

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
      connection.addHandler(onMessage, null, 'message', 'chat', null, null);
      connection.send($pres().tree());
   }
}

function onPresence(msg) {
   log("PRESENCE: " + msg); 
}

function onMessage(msg) {
    from = msg.getAttribute('from');
    to = msg.getAttribute('to');
    from_user=to;
    to_user=from;
    body = elems[0];
    append_message(from.split('@')[0],Strophe.getText(body) );
   return true;
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
    $('#chat #msg').bind('keypress', function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
     if(code == 13) { //Enter keycode
      msg = $('#chat #msg').val();
      reply = $msg({to: to_user, from: from_user, type: 'chat'}).c("body").t(msg);
      connection.send(reply.tree());

      append_message("me", msg );

      $('#chat #msg').val("");
     }
       
});
});

function append_message(from, msg) {
    chat = "<div class='chat-entry'><div class='from'>"+from+":</div><div class='msg'>"+msg+"</div></div>";

         $('#chat #history').append(chat);
         $('#chat #history').get(0).scrollTop = $('#chat #history').get(0).scrollHeight;
}
