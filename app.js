var express = require("express");
var app     = express();

var http = require('http').Server(app);
var io   = require('socket.io')(http);

var path    = require("path");
var bodyParser = require('body-parser')
var session = require('express-session')

var mysql = require('mysql'); 
var client = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: ''
});
client.query('USE test');

//cookies
app.use(bodyParser.urlencoded({ extended: false }))

var sess = {
  secret: 'keyboard cat',
  cookie: {maxAge: 60000}  , 
  resave: true, 
  saveUninitialized: true 
}
app.use(session(sess))

function login(req,res,next){

  if(typeof req.session.user != "undefined"){

      next();
  }
    else{

      res.redirect('/login');
    }


}
app.post('/auth',function(req,res){
  
  client.query('SELECT * FROM usuarios where usuario ="'+req.body.user+'" and password="'+req.body.pass+'"',
             function (err, results, fields) {
 
              if (err) {
                  console.log("Error: " + err.message);
                  throw err;
              }
              if(results.length > 0){
                req.session.user = req.body.user;                
                res.redirect('/in');
                console.log("user bodyParser->>"+req.session.user);            
              }else{
                    res.send("Fallido");
              }
  });


});
app.get('/in',login,function(req,res){
  res.sendFile(path.join(__dirname+'/in.html'));  
});
app.get('/out',function(req,res){
  delete req.session.user;
  res.redirect('/login');

});
function overrideLogin(req,res,next){

  if(typeof req.session.user != "undefined"){

    res.redirect('/in');
  }
    else{
    next();      
    }

}
app.get('/login',overrideLogin,function(req,res){
  
  res.sendFile(path.join(__dirname+'/login.html'));
  //__dirname : It will resolve to your project folder.
});


app.use(express["static"](__dirname + '/public'));


//  Sockets 

io.on('connection', function(socket) {
  
console.log('New user connected'); 
  
socket.on('disconnect',function() { if(socket.name){
                          client.query('DELETE FROM logueados where usuario= ?',socket.name);  

                          client.query('SELECT * FROM logueados', function (err, results, fields) { 
                                      if (err) {
                                          console.log("Error: " + err.message);
                                          throw err;
                                      }          
                            
                                      io.emit('infoUsers', results);  
                                      io.emit('msg',socket.name +"  Se ha ido.. ");  
                                  }); 
              }

    console.log('User disconnected');

  });
  
  socket.on('message', function(message) { io.emit('msg',socket.name +": "+ message);  });


  socket.on('name', function(data) {
      console.log("---+-----> "+data);
      client.query('SELECT * FROM usuarios where usuario ="'+data+'"',
             function (err, results, fields) {
 
              if (err) {
                  console.log("Error: " + err.message);
                  throw err;
              }
              if(results.length > 0){
              
              socket.name  = data;
              console.log("Login success "+socket.name);

              client.query('SELECT * FROM logueados where usuario ="'+data+'"',function (e,r,f) { 
                                      if(r.length == 0){ 
                                        client.query('INSERT INTO logueados SET id = ?,  usuario = ?',[results[0].id,data]  );
                                        console.log("Usuario insertado en logueados ");
                                      } });             
              
              console.log("Actualizando logueados");
              client.query('SELECT * FROM logueados', function (err, results, fields) { 
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
  console.log('Running Server...');
  console.log('listening on *:3000');
});
