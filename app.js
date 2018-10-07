var lib = [];

lib.push({
	"name":"P-UP",
  "alias": "Push Up"
});


lib.push({
	"name":"Ski",
  "alias": "Ski Jumps"

});

lib.push({
	"name":"Mountain",
  "alias": "Mountain Climbers"

});


lib.push({
	"name":"Russian",
  "alias": "Russian Twist"

});



lib.push({
	"name":"Squat",
  "alias": "Squat Kick"

});



lib.push({
	"name":"Ali",
  "alias": "Ali Shuffle"

});





lib.push({
	"name":"JJ",
  "alias": "Jumping Jacks"

});



lib.push({
	"name":"Burpee",
  "alias": "Burpees"

});



lib.push({
	"name":"Crab",
  "alias": "Crab Kicks"

});



lib.push({
	"name":"Plank",
  "alias": "Plank"

});



lib.push({
	"name":"Lunge",
  "alias": "Lunge"

});


lib.push({
	"name":"High Knee",
  "alias": "High Knees"

});


lib.push({
	"name":"Skater",
  "alias": "Speed Skater"

});


lib.push({
	"name":"V-UP",
  "alias": "V-Ups"

});


lib.push({
	"name":"Wall",
  "alias": "Wall Sit"

});


lib.push({
	"name":"Quick Feet",
  "alias": "Quick Feet"

});

lib.push({
	"name":"Sit-Up",
  "alias": "Crunches"

});

lib.push({
	"name":"Squat Jump",
  "alias": "Squat Jumps"

});



//setup the server
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(80);
console.log("Server started.");

var status = "off";
var secondsElapsed = 0;
var startup = 5;
var pone = 150;
var ptwo = 30;
var pthree = 30;
var timeleft = 0;
var people = [];
var mainInput;
var aRestName;
var aRestActualName;
var freestyleRound;
var myNotice;


var SOCKET_LIST = {};

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
  console.log('new connection made')
	socket.id = Math.random();
	socket.number = "" + Math.floor(10 * Math.random());
	SOCKET_LIST[socket.id] = socket;


socket.on('toggle', function() {
if (status == "off") {
status = "startup";
console.log('starting timer')
} else {
status = "off";
console.log('disabling timer')
}
secondsElapsed = 0;
});

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
    console.log('disconnect')
	});

  socket.on('updatePercision', function(data) {
secondsElapsed = 0;
    status = data;

  });

  socket.on('updateWorkout', function(data) {

    mainInput =  data.split("\n\n");


    for(var g = 0; g < mainInput.length; g++)
    {
      console.log(mainInput[g]);

      if (mainInput[g].toLowerCase().includes("freestyle") || mainInput[g].toLowerCase().includes("trainer led"))
      {

        freestyleRound = g + 1;
      }


    }

    console.log("Got new data... freestyle @ R" + freestyleRound);

  });

  socket.on('bypass', function() {
newRound();

});

  socket.on('newPerson', function(data) {
    console.log("created a new person at position " + data);
    people.push({
    "id":Math.random(),
    "currentPosition": data,
    "completedRounds": 0,
    "completedExer": [aRestActualName]


    });

  });

});


setInterval(function(){

  if (!mainInput) {

    myNotice = "Workout has not been setup.";

  } else {
    myNotice = "";
  }

secondsElapsed = secondsElapsed + 0.5;

if (status == "off") {
timeleft = 0;
}


if (status != "off") {

if (status == "startup") {

if (secondsElapsed >= startup) {

status = "p1";
secondsElapsed = 0;
run();

}

timeleft = startup - secondsElapsed;
}

}

if (status == "p1") {

if (secondsElapsed >= pone) {
status = "p2";
secondsElapsed  = 0;
}
timeleft = pone - secondsElapsed;

}

if (status == "p2") {
timeleft = ptwo - secondsElapsed;

if (secondsElapsed >= ptwo) {
status = "p3";
secondsElapsed = 0;
}
}

if (status == "p3") {
if (secondsElapsed >= pthree) {
secondsElapsed = 0;
status = "p1";
newRound();
run();

}


timeleft = pthree - secondsElapsed;
}

var currentLocations = [];

for (var xyzl = 0; xyzl < people.length; xyzl++)
{
currentLocations.push(people[xyzl].currentPosition);

}

var pack = [];
pack.push({
	status: status,
	time: timeleft,
	activeRest: aRestName,
  rounds: currentLocations,
  freestyle: freestyleRound,
  notice: myNotice
});

	for (var i in SOCKET_LIST) {
var socket=SOCKET_LIST[i];
socket.emit('newData',pack);

}

},1000/2);



function run() {


var rounds = [];
var canidates = [];

for (var x = 0; x< lib.length; x++)
{
canidates.push(lib[x].name);

}

for (var x = 0; x < people.length; x++)
{
for (var y = 0; y < people[x].completedExer.length; y++)
{
canidates = removeFromArray(canidates, people[x].completedExer[y]);
}


if (rounds.indexOf(people[x].currentPosition) < 0) {
rounds.push(people[x].currentPosition);
}

var nextPosition = people[x].currentPosition + 1;
if (nextPosition == 10) {
if (people[x].completedRounds == 8) {
nextPosition = 9;
} else {
nextPosition = 1;
}
}

var previousPosition = people[x].currentPosition - 1;
if (previousPosition == 0) {
  if (people[x].completedRounds == 8)
  {
    previousPosition = 1;
  } else {
    previousPosition = 9;
  }
}

if ((rounds.indexOf(nextPosition) < 0)) {
rounds.push(nextPosition);
}

if ((rounds.indexOf(previousPosition) < 0)) {
rounds.push(previousPosition);
}

}

for (var z = 0; z < rounds.length; z++)
{
getInfoOfRound(3)

}


var item = canidates[Math.floor(Math.random()*canidates.length)];
for (var xz = 0; xz < people.length; xz++)
{
  people[xz].completedExer.push(item);

}

for (var abc = 0; abc < lib.length; abc++)
{
  if (lib[abc].name == item) {
    aRestName = lib[abc].alias;
    aRestActualName = item;
  }

}


}
function getInfoOfRound(rNumber) {


var mod = mainInput[rNumber - 1].match("ROUND [0-9] - SINGLE: (.*) - DOUBLE(.*)");

var workout = mod[1];

for (var x = 0; x < lib.length; x++)
{
if (workout.includes(lib[x].name) || workout.includes(lib[x].alias))
{

canidates = removeFromArray(canidates, lib[x].name);



}

}


}







function newRound() {
var peopleToDelete = [];
for (var x = 0; x < people.length; x++)
{

console.log("( " + x + " / " + (people.length )+ ") current pos: " + people[x].currentPosition);

var deleted = false;
var position = people[x].currentPosition;

people[x].completedRounds = people[x].completedRounds + 1;
var currentPosition = people[x].currentPosition + 1;

if (currentPosition == 10 && people[x].completedRounds != 9)
{
people[x].currentPosition = 1;
console.log("[" + people[x].id + "] has moved to pos 1 from pos " + position + " w/ " + people[x].completedRounds + " completed rounds");
} else if (people[x].completedRounds == 9)
{
deleted = true;
} else {
  people[x].currentPosition = currentPosition;
  console.log("[" + people[x].id + "] has moved to pos " + currentPosition + " from pos " + position + " w/ " + people[x].completedRounds + " completed rounds");
}

//console.log("[" + people[x].id + "] has now completed "+ people[x].completedRounds + " rounds and is at R" + people[x].currentPosition + ". They have done: " + people[x].completedExer);

if (deleted) {
  console.log("[" + people[x].id + "] has finished their workout" + " w/ " + people[x].completedRounds + " completed rounds");

peopleToDelete.push(people[x]);

}


}

for (var y=0; y < peopleToDelete.length; y++)
{

  people = removeFromArray(people, peopleToDelete[y]);
}

if (people.length == 0) {
  status = "off";
}

console.log('new round ran')
console.log('-------')

}

function removeFromArray(array, value) {
    var idx = array.indexOf(value);
    if (idx !== -1) {
        array.splice(idx, 1);
    }
    return array;
}
