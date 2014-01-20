var events = ["start", "vote1", "vote2","end"];


/*
// Object formats:
// ACTIONS ARE OBJECTS
// actions: type = play-video, filename
// actions: type = trigger.event, message = " ", protocol = "URI or websocket"
	var events = 
	{
		"start" : {
			"actions" : {
				websocket-'start', playvid-'intro', websocket-'vote'
			}
		},
		"vote1" : 
		{
			"actions" : [playvid-'video1', loopsequence-'start']
		},
		"vote2" : {
			"actions" : [playvid-'video1', loopsequence-'start']
		},
	}
*/

var possibleActions = {
	"action1" : 
	{
		"type" : "play_video",
		"filename" : ""
	},
	"action2" : 
	{
		"type" : "url-trigger-event",
		"message" : "",
		"protocol" : "URL"
	},
	"action3" : {
		"type" : "websocket-trigger-event",
		"message" : "",
		"protocol" : "websocket"
	}
}

// 2 kinds of events
// socket, url

function Trigger(triggerCount, sequenceCount){

	var div = document.createElement("div");
	div.setAttribute("id", triggerCount);
	div.setAttribute("class", "trigger");

	var btn = document.createElement("button");
	btn.setAttribute("type", "button");
	btn.setAttribute("id", "x-" + triggerCount);
	btn.setAttribute("class", "remove");
	btn.appendChild(document.createTextNode("x"));
	
	var sel = document.createElement("select");
	sel.setAttribute("class", "event");

	var tmpNode;
	for(var i = 0; i < events.length; i++){
		tmpNode = document.createElement("option");
		tmpNode.value = events[i];
		tmpNode.text = events[i];
		sel.appendChild(tmpNode);
	}

	var innerDiv = document.createElement("div");
	innerDiv.setAttribute("class", "sequence");
	innerDiv.setAttribute("id", triggerCount);

	var innerSel = document.createElement("select");
	innerSel.setAttribute("class", "action");

	for(var i in possibleActions){
		tmpNode = document.createElement("option");
		tmpNode.value = possibleActions[i].type;
		tmpNode.text = possibleActions[i].type;
		innerSel.appendChild(tmpNode);
	}

	var input = document.createElement("input");
	input.setAttribute("class", "action-info");

	var addBtn = document.createElement("button");
	addBtn.setAttribute("type", "button");
	addBtn.setAttribute("class", "add-action");
	addBtn.setAttribute("id", sequenceCount);

	// why do I need to do this here, but not down there in the main function?
	addBtn.appendChild(document.createTextNode("+ Add Action"));

	var savBtn = document.createElement("button");
	savBtn.setAttribute("type", "button");
	savBtn.setAttribute("class", "save-seq");
	savBtn.setAttribute("id", sequenceCount);
	savBtn.appendChild(document.createTextNode("+ Save Action"));

	innerDiv.appendChild(document.createTextNode(" then "));
	innerDiv.appendChild(innerSel);
	innerDiv.appendChild(document.createTextNode(" "));
	innerDiv.appendChild(input);
	innerDiv.appendChild(addBtn);
	innerDiv.appendChild(savBtn);

	div.appendChild(document.createTextNode("TriggerID: " + triggerCount));
	div.appendChild(document.createElement("p"));
	div.appendChild(btn);
	div.appendChild(document.createTextNode("If "));
	div.appendChild(sel);
	div.appendChild(innerDiv);

	return div;
}

function getTriggerData(trigger){

	var triggerId = trigger.id;
	var tEvent;
	var evtSelect;

	var tSequence;
	var seqSelect;
	var actSelect = new Array();

	var type, msg;

	for(var i = 0 ; i < trigger.children.length; i++){

		// gets event selected
		if(trigger.children[i].className == "event"){
			tSelect = trigger.children[i];
			evtSelect = tSelect.options[tSelect.selectedIndex].value;
		}

		// gets actions selected
		if(trigger.children[i].className == "sequence"){
			tSequence = trigger.children[i];

			// starts at 2 because of <span> and <p> as 1 and 2nd children
			for(var j = 0; j < tSequence.children.length - 2; j++){
				seqSelect = tSequence.children[j];

				// gets the selected dropdown choice
				if(seqSelect.className == "action"){
					//console.log(seqSelect.options[seqSelect.selectedIndex].value);
					type = seqSelect.options[seqSelect.selectedIndex].value;
				}

				// gets input, after the selected dropdown
				if(seqSelect.className == "action-info"){
					msg = seqSelect.value;

					if(type === 'play_video'){
						actSelect.push({'type': type,'filename' : msg});
					}

					if(type === 'url-trigger-event'){
						actSelect.push({'type': 'trigger_event','message' : msg, 'protocol': 'URL'});
					}

					if(type === 'websocket-trigger-event'){
						actSelect.push({'type': 'trigger_event','message' : msg, 'protocol': 'websocket'})
					}
				}
			}
		}
	}

	var triggerData = {
		"event" 	: evtSelect,
		"actions"  : []
	};

	for(var i = 0; i < actSelect.length; i++){
		triggerData["actions"].push(actSelect[i]);
	}

	return triggerData;
}


$(document).ready(function() {

	var tCount = 0;
	var sCount = 0;

	var $container = $('.container');

	var t = Trigger(tCount , sCount);
	tCount = sCount += 1;

	$container.append(t);
	$container.append("<p/><button type='button' class='add-trigger'>Add another trigger</button>");
	//$container.append("<p/><button type='button' class='submit'> Submit POST request </button>");

	// click on add action button for another action in a sequence
	$(".container").on('click', '.add-action', function() {

		var tNode = document.createTextNode(" then ");
		var sNode = document.createElement("SELECT");
		sNode.className = 'action';

		var child;
		for(var k in possibleActions){
			child = document.createElement('option');
			child.value = possibleActions[k].type;
			child.text  = possibleActions[k].type;
			sNode.appendChild(child)
		}

		var iNode = document.createElement("INPUT");
		iNode.className = 'action-info';
		iNode.style = "border-radius: 5px";

		var spaceNode = document.createTextNode(" ");
		this.parentNode.insertBefore(document.createElement("p"), this);
		this.parentNode.insertBefore(tNode, this);
		this.parentNode.insertBefore(sNode, this);
		this.parentNode.insertBefore(spaceNode, this);
		this.parentNode.insertBefore(iNode, this);
	});
	
	// creates another trigger
	$(".add-trigger").click(function() {
		$(".add-trigger").before(Trigger(tCount, sCount));
		$(".add-trigger").before("<p/>");
		
		tCount = sCount += 1
	});
	
	$(".container").on('click', ".remove",function() {
		this.parentNode.remove();
	});

	// save the sequence for the trigger
	$(".container").on('click', ".save-seq", function(){
		alert('No longer supported');
		/*
		var seqSelect;
		var seqAction = new Array(); 
		for(var j = 0; j < this.parentNode.children.length - 2; j++){
				seqSelect = this.parentNode.children[j];
				seqAction.push(seqSelect.options[seqSelect.selectedIndex].value);
		}

		var seq = "";
		for(var i = 0; i < seqAction.length - 1; i++){
			seq += seqAction[i] + ",";
		}
		seq += seqAction[seqAction.length - 1];

		// so seqAction contains all the sequneces for the action
		actionObj["Trigger-seq-" + this.id +""] = seq;
		*/
	});

	//submitting the post request
	$(".submit").click(function() {
		//loop through all the triggers
		var t = document.getElementsByClassName('trigger');

		var eventCollection = new Array(t.length);
		for(var i = 0; i < t.length; i++){
			eventCollection.push(getTriggerData(t[i]));
		}

		// MAKE A HTML POST REQUEST HERE.... 
		var eventsObject = {};
		var tempTrigger;
		for(var i = 0; i < eventCollection.length; i++){
			for(k in eventCollection[i]){
				var tempTrigger = eventCollection[i];
				if(k != 'actions'){

					eventsObject[tempTrigger[k]] = {"sequence" : tempTrigger["actions"]};
				}
			}
		}

		/*
		 CURRENTLY the following line of code just 
		 prints out the JSON object, however... user should have
		 access to the eventsObject created by the page
		*/
		console.log(eventsObject);

	});

});