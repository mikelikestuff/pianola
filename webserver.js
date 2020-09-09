var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

var Motor0 = new Gpio(4, 'out'); //use GPIO pin 4 as output
var Motor1 = new Gpio(6, 'out'); //use GPIO pin 6 as output to make motor go

var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

http.listen(8080); //listen to port 8080

function handler (req, res) { //create server
  fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
}

io.sockets.on('connection', function (socket) {// WebSocket Connection
  var lightvalue = 0; //static variable for current status
  pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    lightvalue = value;
    socket.emit('light', lightvalue); //send button status to client
  });
  socket.on('light', function(data) { //get light switch status from client
    lightvalue = data;
    

     // Motor Stop
    if (lightvalue == 0) { 
                Motor0.writeSync (1);
                Motor1.writeSync (1);
                         }
     // Motor forwards
    if (lightvalue == 1) { 
                Motor0.writeSync (0);
                Motor1.writeSync (0);
                         }
     //motor reverse                    
    if (lightvalue == 2) { 
                Motor0.writeSync (1);
                Motor1.writeSync (0);
                         }

   


 //   if (lightvalue != Motor0.readSync()) { //only change LED if status has changed
 //     Motor0.writeSync(lightvalue); //turn LED on or off
  //  }
  });
});

process.on('SIGINT', function () { //on ctrl+c
  Motor0.writeSync(0); // Turn LED off
  Motor0.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});
