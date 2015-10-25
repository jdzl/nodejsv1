var express = require("express");
var app     = express();

var http = require('http').Server(app);
var io   = require('socket.io')(http);

var path    = require("path");


app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  //__dirname : It will resolve to your project folder.
});

app.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/about.html'));
});

app.use(express["static"](__dirname + '/public'));

var mysql = require('mysql');
 
var client = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: ''
});

client.query('USE test');

//  Sockets 

io.on('connection', function(socket) {
  
  console.log('New user connected');

 client.query('SELECT * FROM personaje', function (err, results, fields) { 
              if (err) {
                  console.log("Error: " + err.message);
                  throw err;
              }          
    
              io.emit('infoUsers', results);    
}); 
  
  socket.on('disconnect', function() {
    if(socket.name){
          client.query('DELETE FROM personaje where nombre= ?',socket.name);      
                  client.query('SELECT * FROM personaje', function (err, results, fields) { 
                      if (err) {
                          console.log("Error: " + err.message);
                          throw err;
                      }          
            
                      io.emit('infoUsers', results);    
                  }); 
    }

    console.log('User disconnected');

  });

  socket.on('message', function(message) { io.emit('msg',socket.name +" :"+ message);  });


  socket.on('name', function(data) {
    client.query('SELECT * FROM personaje where nombre="'+data.name+'"', function (err, results, fields) {
 
              if (err) {
                  console.log("Error: " + err.message);
                  throw err;
              }
              if(results.length > 0){
              console.log("Usuario existe en la BD");
            //  io.emit('message', results);
              
              }else{

                console.log("Nuevo usuario "+ data.name);
                socket.name = data.name;

                client.query(
                            'INSERT INTO personaje SET nombre = ?, apellido = ?',
                              [data.name, data.lastname]
                );

                client.query('SELECT * FROM personaje', function selectUsuario(err, results, fields) { 
              if (err) {
                  console.log("Error: " + err.message);
                  throw err;
              }          
    
              io.emit('infoUsers', results);    
}); 
                
              }              
    
      }); 
    
    });
  
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});

//client.end();