var Groupie = {
    jid: null,
    connection: null,
    room: null, 
    nickname: null,
    participants: null,
    joined:null,
    NS_MUC: "http://jabber.org/protocol/muc",

    roomAddress: function() {
      return  Groupie.room + "/" + Groupie.nickname;
    },
    
    attachHandlers: function() {
      Groupie.connection.addHandler(Groupie.on_presence, null, "presence", null, null);
        Groupie.connection.addHandler(Groupie.on_public_message, null, "message", "groupchat", null, null); 
    },

    joinChatRoom: function() {
       Groupie.connection.send( $pres({ to:  Groupie.roomAddress(), from: Groupie.connection.jid }).c('x', {xmlns: Groupie.NS_MUC}));             
   },

    on_public_message: function(message) {
          var from = $(message).attr('from');
          var room = Strophe.getBareJidFromJid(from);
          var nick = Strophe.getResourceFromJid(from);
          if (room === Groupie.room) {
            var notice = !nick;
            var nick_class = "nick";
            if(nick === Groupie.nickname) nick_class += " self";
            var body = $(message).children('body').text();
            Groupie.add_message("<div class='message'>"+nick+": "+body+"</div>");
          }
          return true;
    }, 

    add_message: function(data) {
      var chat = $('#chat').get(0);
      var at_bottom = chat.scrollTop >= chat.scrollHeight - chat.clientHeight;

      $('#chat').append(data);

      if(at_bottom) {
         chat.scrollTop = chat.scrollHeight;
      }
   },
    on_presence: function(presence) {

      var from = $(presence).attr("from");
      var room = Strophe.getBareJidFromJid(from);

      if (room === Groupie.room) {
         var nick = Strophe.getResourceFromJid(from);
         if ($(presence).attr('type') === 'error' && !Groupie.joined) {
            Groupie.connection.disconnect();

         } else if (!Groupie.participants[nick]  &&   $(presence).attr('type') !== 'unavailable') {
            Groupie.participants[nick] = true;
            $('#participant-list').append('<li>'+nick+'</li>');
            $('#chat').append("<div class='notice'>*** "+ nick +" has joined the room...</div>");
         } else if(Groupie.participants[nick] && $(presence).attr("type") === 'unavailable') {
               $('#participant-list li').each(function () {
                   if (nick === $(this).text()) {
                      $(this).remove(); return false;
                   }
               });
               $(document).trigger('user_left', nick);
            
         }
      }

      if ($(presence).attr('type') !== 'error' && !Groupie.joined) {
          if($(presence).find("status[code='201']").length > 0) {
            //sending instant room creation
            Groupie.connection.send(
               $iq({ from: $(presence).attr('to') ,
                   to: Strophe.getBareJidFromJid(from ),
                   id:'create1',
                   type: 'set'}).c('query', {xmlns: Groupie.NS_MUC+"#owner"}).c('x', {xmlns: 'jabber:x:data', type:'submit'})
            ); 
          }
         if ($(presence).find("status[code='110']").length > 0) {
            if ($(presence).find("status[code='210']").length > 0) {
               Groupie.nickname = Strope.getResourceFromJid(from);
            }
            $(document).trigger("room_joined");
         }
      }
       return true; // to keep handler alive
   }
};

$(document).ready(function () {
   $('#login_dialog').dialog({
      autoOpen: true,
      draggable: false,
      modal: true,
      title: 'Join a Room',
      buttons: {
         "Join": function(){
            Groupie.room = $('#room').val();
            Groupie.nickname = $('#nickname').val();
            Groupie.jid = $('#jid').val();

            $(document).trigger('connect',{
               jid: $('#jid').val(),
                password: $('#password').val()
            });
            $('#password').val('');
            $(this).dialog('close');
         }
      }
      
   });
    
   $('#leave').click(function () {
     Groupie.connection.send(
         $pres({to: Groupie.roomAddress(),  type: 'unavailable' })); 
     Groupie.connection.disconnect();
   });

   $('#input').bind('keypress', function (ev) {
         if(ev.which === 13) {
            ev.preventDefault();

            var body = $(this).val();
            Groupie.connection.send(
                $msg({
                    to: Groupie.room,
                    type: 'groupchat'
                }).c('body').t(body));
            $(this).val('');
         }
   });
});
var BOSH_SERVICE = '/http-bind/'

$(document).bind('connect', function(ev, data){
   Groupie.connection = new Strophe.Connection(BOSH_SERVICE);
   Groupie.connection.rawInput = Log.rawInput;
   Groupie.connection.rawOutput = Log.rawOutput;
   Groupie.connection.connect(data.jid, data.password, function (status) {
         if(status === Strophe.Status.CONNECTED) {
            $(document).trigger('connected');
         } else if (status == Strophe.Status.DISCONNECTED) {
            $(document).trigger('disconnected');
         }
   });
});

$(document).bind('connected', function () {
  Groupie.joined = false;
  Groupie.participants = {};
  Groupie.attachHandlers();
  Groupie.connection.send($pres().c('priority').t('-1'));
  Groupie.joinChatRoom();
});

$(document).bind('disconnected', function () {
        Groupie.connection = null; 
        $('#participant-list').empty(); 
        $('#room-name').empty(); 
        $('#room-topic').empty(); 
        $('#chat').empty();
        $('#login_dialog').dialog('open');
});

$(document).bind('room_joined', function () {
   Groupie.joined = true;
   $('#leave').removeAttr('disabled');
   $('#room-name').text(Groupie.room);

   $('#chat').append("<div class='notice'>*** Room joined</div>");
});

$(document).bind('user_left', function(ev, name){
   Groupie.add_message("<div class='notice'>*** "+ name+" left.</div>");
});


