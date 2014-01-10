var express = require('express')
  , app = express()  
  , server = require('http').createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server)
  , spawn = require('child_process').spawn
  , omx = require('omxcontrol');

// all environments
app.set('port', process.env.TEST_PORT || 8080);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var events = 
{
	"start": 
	{
		"sequence":
		[
			{
				"type":"play_video",
				"filename":"intro.mp4"
			},
			{
				"type":"trigger_event",
				"protocol":"websocket",
				"message":"vote"
			}
		]
	},
	"vote1": 
	{
		"sequence":
		[
			{
				"type":"play_video",
				"filename":"1.mp4"
			},
			{
				"type":"play_video",
				"filename":"end.mp4"
			},
		]
	},
	"vote2": 
	{
		"sequence":
		[
			{
				"type":"play_video",
				"filename":"2.mp4"
			},
			{
				"type":"play_video",
				"filename":"end.mp4"
			},
		]
	},
	"end": 
	{
	"sequence":
		[
			{
				"type":"play_video",
				"filename":"end.mp4"
			}
		]
	}
}


//Static Routes
app.get('/control', function (req, res) {
  res.sendfile(__dirname + '/public/control.html');
});

app.get('/playlow', function (req, res) {
	console.log('Playing low.mp4');
	omx.start("videos/low.mp4");
	console.log(res);
});

//The main trigger setup
app.get('/:event', function (req, res) {
  handle_event(req.param("event"));
});



//Launch the server
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//use it with express
app.use(omx());

io.sockets.on('connection', function (client){ 
  
  client.on('message', function (msg) {
	handle_event(msg);
  }) ;

  client.on('disconnect', function () {
  });
});

function handle_event(e) {
	console.log("Event: " + e);
	var event = events[e];
	if (!event) { 
		console.log("Event is not defined in events config");
		return;
	}

	sequence = event.sequence;
	if (!sequence) { 
		console.log("Sequence is not defined for this event in events config");
		return;
	}

	console.log("Event Loaded. Sequence is: " + JSON.stringify(sequence));
	
	//foreach sequence...
	for (var i = 0; i<sequence.length; i++) {
		action = sequence[i].type;
		if (sequence[i].type == "play_video") play_video(sequence[i]);
		if (sequence[i].type == "trigger_event") trigger_event(sequence[i]);
	}
}

function play_video(event) {
	console.log("Playing Video: " + event.filename);
	omx.start("videos/" + event.filename);
	return;
}

function trigger_event(event) {
	console.log("Triggering an Event: " + event.message);
	io.sockets.emit(event.message);
	return;
}
