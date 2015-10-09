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

app.get('/sitemap',function(req,res){
  res.sendFile(path.join(__dirname+'/sitemap.html'));
});

app.use(express["static"](__dirname + '/public'));
//app.listen(3000);


var mysql = require('mysql');
 
var client = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: ''
});

client.query('USE test');

 /*
client.query(
  'INSERT INTO usuario SET nombre = ?, password = ?',
  ['carlosro_ec', 'miclave']
);
*/


//  Sockets 

io.on('connection', function(socket) {
  
  console.log('New user connected');

 client.query('SELECT * FROM personaje', function selectUsuario(err, results, fields) {
 
              if (err) {
                  console.log("Error: " + err.message);
                  throw err;
              }
 
              console.log("Number of rows: "+results.length);
    
              io.emit('message', results); 
    
}); 
  
/*
  socket.on('message', function(msg) {
    io.emit('message', res.nombre);
  });
  */

  /**
   * Mostramos en consola cada vez que un usuario
   * se desconecte del sistema.
   */
  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
  
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});

//client.end();