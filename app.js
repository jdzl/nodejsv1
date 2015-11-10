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
var overrideName;

//cookies
app.use(bodyParser.urlencoded({ extended: false }))

var sess = {
  secret: 'keyboard cat',
  cookie: {}
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
                overrideName = req.body.user;
                res.redirect('/in');
                console.log(req.session.user);            
              }else{
                    res.send("Fallido");
              }
  });


});
app.get('/in',login,function(req,res){
  res.sendFile(path.join(__dirname+'/in.html'));  
});
app.get('/out',login,function(req,res){
  delete req.session.user;
  res.redirect('/');

});
function overrideLogin(req,res,next){

  if(typeof req.session.user != "undefined"){

    res.redirect('/in');
  }
    else{
      res.redirect('/login');
      
    }

}
app.get('/login',overrideLogin,function(req,res){
  
  res.sendFile(path.join(__dirname+'/login.html'));
  //__dirname : It will resolve to your project folder.
});

app.get('/',function(req,res){
  
  res.sendFile(path.join(__dirname+'/login.html'));
  //__dirname : It will resolve to your project folder.
});

app.use(express["static"](__dirname + '/public'));



//  Sockets 

io.on('connection', function(socket) {
  
console.log('New user connected'); 
  
socket.on('disconnect',function() {

                      if(socket.name){
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
  
  /*
  socket.on('message status', function(message) { 
    `SELECT msg 
FROM   publicaciones
where id_us  in (SELECT la.id_amigo FROM  lista_amigos la, usuarios u where la.id_usuario = u.id and u.id=1)`;
    //io.emit('msg',socket.name +": "+ message);  
});
  */
  socket.on('message', function(message) { io.emit('msg',socket.name +": "+ message);  });


  socket.on('name', function(data) {
      console.log("--------> "+data);
      client.query('SELECT * FROM usuarios where usuario ="'+data+'"',
             function (err, results, fields) {
 
              if (err) {
                  console.log("Error: " + err.message);
                  throw err;
              }
              if(results.length > 0){
              
              //socket.name = data.user;
              socket.name  = data;
              console.log("Login success "+socket.name);
              console.log("Usuario insertado en logueados ");
              client.query('INSERT INTO logueados SET id = ?,  usuario = ?',[results[0].id,data]  );
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
  console.log('listening on *:3000');
});

//client.end();
/*
int j=0;
button = false;
while(true){  
            if(!button){
                cout<< j;
            }else{
                cout<< j;   
                j++;
            }
}
*/