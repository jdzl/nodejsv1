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

app.set('view engine', 'ejs');
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
app.get('/auth',function(req,res){ res.redirect('/in');});
app.post('/auth',function(req,res){
  
  client.query('SELECT * FROM usuarios where usuario ="'+req.body.user+'" and password="'+req.body.pass+'"',
             function (err, results, fields) {
 
              if (err) {
                  console.log("Error: " + err.message);
                  throw err;
              }
              if(results.length > 0){
                req.session.user = req.body.user; 
                req.session.id_us = results[0].id;
                res.redirect('/in');
                

              }else{
                    res.send("      ---->      Fallido");
              }
  });


});
app.get('/in',login,function(req,res){

client.query("SELECT msg ,u.usuario  as user \
              FROM   publicaciones, usuarios u \
              where id_us=u.id and id_us  in (SELECT la.id_amigo \
                               FROM  lista_amigos la, usuarios u \
                               where la.id_usuario = u.id and u.id= (SELECT id \
                                                       FROM usuarios \
                                                       WHERE usuario ='"+req.session.user+"'))",function (err, r, f) {
 

              if (err) {
                  console.log("Error: " + err.message);
                  throw err;
              }    
    client.query('SELECT * FROM logueados where usuario ="'+req.session.user+'"',function (e,r,f) { 
                                      if(r.length == 0){ 
                                        client.query('INSERT INTO logueados SET id = ?,  usuario = ?',[req.session.id_us,req.session.user]  );
                                        console.log("Usuario insertado en logueados ");
                                      } });  
              client.query('SELECT * FROM logueados', function (err, resp, fields) { 
                                                              if (err) {
                                                                  console.log("Error: " + err.message);
                                                                  throw err;
                                                              }          
                                                    
              console.log("Consulta logueados primera");                                               
              console.log(resp.length);                                                                           
              console.log(resp);                                               
              res.render('pages/in',{ user: req.session.user, 
                                      msgs : r ,
                                      users : resp
                                    } );  
                                                
              }); 


  });

  
});

app.get('/out',function(req,res){
  delete req.session.user;
  res.redirect('/login');

});

app.post('/msg/insert',function(req,res){
  console.log("Message Ajax DATA ");  
  
  client.query('INSERT INTO publicaciones SET id = ?,id_us = ?,  msg = ?',['',req.session.id_us,req.body.msg]  );
  res.redirect('/in');

});
function overrideLogin(req,res,next){

  if(typeof req.session.user != "undefined"){

    res.redirect('/in',{user: req.session.user});
  }
    else{
    next();      
    }

}
app.get('/login',overrideLogin,function(req,res){
  
  res.render('pages/login');
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
      console.log(" Envio nombre----> "+data);
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
              

              client.query('SELECT * FROM logueados', function (err, resp, fields) { 
                                                              if (err) {
                                                                  console.log("Error: " + err.message);
                                                                  throw err;
                                                              }          
                                                    
                                                    console.log("Actualizando logueados");
                                                    io.emit('infoUsers', resp);    
                                                }); 
          
              
              }          
    
      }); 
    
    });
  
});


http.listen(8080, function() {
  console.log('Running Server...');
  console.log('listening on *:8080');
});

function allLog(){

      client.query('SELECT * FROM logueados', function (err, resp, fields) { 
                                                                  if (err) {
                                                                      console.log("Error: " + err.message);
                                                                      throw err;
                                                                  }          
                                              
                  return resp;
                                                    
      }); 

}