var express = require("express");
var app     = express();

var http = require('http').Server(app);
var io   = require('socket.io')(http);

var path    = require("path");
var bodyParser = require('body-parser')
var session = require('express-session')
var cookieParser = require('cookie-parser');

var mysql = require('mysql');



var client = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: ''
});
client.query('USE node');

app.set('view engine', 'ejs');
//cookies
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }))


var sess = {
  secret: 'keyboard cat',
  cookie: {maxAge: null}  ,
  resave: true,
  saveUninitialized: true ,
  key: 'express.sid'
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
app.get('/', function (req, res) {
  res.send('Hello World!');
});
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


                  var html_msg = '<div class="alert alert-warning"> Error en usuario o contraseña</div> ';
                    res.render('pages/login',{msg: html_msg});
              }
  });


});
app.get('/in',login,function(req,res){

client.query("SELECT p.msg as msg ,u.usuario  as user \
              FROM   publicaciones p, usuarios u \
              where id_us=u.id and id_us  in (SELECT la.id_amigo \
                               FROM  lista_amigos la, usuarios u \
                               where la.id_usuario = u.id and u.id= (SELECT id \
                                                       FROM usuarios \
                                                       WHERE usuario ='"+req.session.user+"')) ORDER BY p.id desc",function (err, r, f) {


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

                                              console.log(" uuuu --> ");
                                              console.log(resp);

              res.render('pages/in',{ user: req.session.user,
                                      msgs : r ,
                                      users : resp,
                                      id : req.session.id_us
                                    } );

              });


  });


});

app.get('/out',function(req,res){

  client.query('DELETE FROM logueados where usuario= ?',req.session.user);
  delete req.session.user;

  var html_msg = '<div class="alert alert-warning">Session Cerrada</div> ';
  res.render('pages/login',{msg: html_msg});
});

app.post('/msg/insert',function(req,res){
  console.log("Message Ajax DATA  Insert");

  client.query('INSERT INTO publicaciones SET id = ?,id_us = ?,  msg = ?',['',req.body.hidden,req.body.msg]  );
  res.redirect('/in');

});
app.post('/users/search',function(req,res){
  console.log("Message Ajax DATA  search");

  client.query('SELECT * FROM usuarios where usuario like "%'+req.body.data+'%" limit 6' , function (err, resp, fields) {


    var html = '<div class="list-group">';
    for (var i = resp.length - 1; i >= 0; i--) {

      html+= " <a href='users/"+resp[i].usuario+"' class='list-group-item'>"+resp[i].usuario+ "<span class='badge'>"+resp[i].id+" </span> </a> ";
    };
    html +="</div>";
    res.send(resp.length >0 ? html : "No lo hemos encotrado.. :(");

          }
  );



});
app.get('/users/add',function(req,res){

  var query = require('url').parse(req.url,true).query;
    var user = query.user;
    var email = query.email;
    var fname = query.firstname;
    var lname = query.lastname;
    var pwd = query.passwd;

res.send("<img src='../../img/loading.gif'> <br/> Sus Datos son : <br/> "+
    user +" <br/>" +
    email +" <br/>" +
    fname +" <br/>" +
    lname +" <br/>" +
    pwd +" <br/>"
  );
});

//download

app.get('/down/:file(*)', function(req, res, next){
  var file = req.params.file
    , path = __dirname + '/files/' + file;

  res.download(path);
});
app.use(function(err, req, res, next){
  // special-case 404s,
  // remember you could
  // render a 404 template here
  if (404 == err.status) {
    res.statusCode = 404;
    res.send('Cant find that file, sorry!');
  } else {
    next(err);
  }
});

app.get('/users/del',function(req,res){
    var query = require('url').parse(req.url,true).query;
    var id = query.id;
    var option = query.option;

res.send(option+" <img src='../img/loading.gif'> <br/> Ooops  en construccion "+id);

});
app.get('/users/:name',function(req,res){

  res.send("<img src='../img/loading.gif'> <br/>Profile  :D<br/>"+req.param('name'));

});
app.get('/users/*',function(req,res){

  res.send("<img src='../img/loading.gif'> <br/>Ooops route  failure :D");

});
/*
var query = require('url').parse(req.url,true).query;
Then you can just call

var id = query.id;
var option = query.option;

where the URL for get should be

/path/filename?id=123&option=456
*/

function overrideLogin(req,res,next){

  if(typeof req.session.user != "undefined"){

    res.redirect('/in');
  }
    else{
    next();
    }

}
app.get('/login',overrideLogin,function(req,res){

  res.render('pages/login',{msg: ""});
  //__dirname : It will resolve to your project folder.
});


app.use(express["static"](__dirname + '/public'));


//  Sockets

io.on('connection', function(socket) {

console.log('New user connected ----> '+ socket.id);

socket.on('disconnect',function() {
  /*
  if(socket.name){
                          //client.query('DELETE FROM logueados where usuario= ?',socket.name);

                          client.query('SELECT * FROM logueados', function (err, results, fields) {
                                      if (err) {
                                          console.log("Error: " + err.message);
                                          throw err;
                                      }

                            console.log("se fue uno y llamo infousers");
                                     io.emit('infoUsers', results);

                                  });
              }
              */

  });

socket.on('message', function(message) { io.emit('msg',socket.name +": "+ message);  });

socket.on('message-private', function(message) {

  client.query('SELECT * FROM logueados WHERE usuario="'+message.user+'"', function (err, results, fields) {
              if(results.length > 0) {
                console.log("antes del error --------------");

                console.log("id session "+results[0].id_session);
                console.log("msg "+socket.name+": "+ message.msg);
                console.log("-------"+ message.user);
                console.log("sessioon id user  "+results[0].id );
                  var msgfull = socket.name+": "+ message.msg;


                  if(results[0].id_session == socket.id){

                      io.to(results[0].id_session).emit('msg-private',{ id:  socket.id_us ,user : socket.name , msg: msgfull });


                  }else {

                      io.to(results[0].id_session).emit('msg-private',{ id:  socket.id_us, user : socket.name , msg: msgfull });
                      socket.emit('msg-private-me',{ id: results[0].id , msg :  msgfull});
                  }

}{
console.log("no hya nada en la base de datos omfg ---------");
}
          });

  });


socket.on('name', function(data) {

  console.log(" Event name running --");
  socket.name  = data;
  console.log("Login success "+socket.name);

  client.query('SELECT * FROM logueados where usuario ="'+data+'"',function (e,r,f) {
              if(r.length == 0){
                                client.query('INSERT INTO logueados SET id = ?,id_session=?,  usuario = ?',[results[0].id,socket.id,data]  );
                                console.log("Usuario insertado en logueados ");
                              }
                              else {

                                socket.id_us = r[0].id;
                                console.log("GUardando en logueados id_session del socket "+socket.id);
                                client.query('UPDATE logueados SET id_session=?  WHERE usuario = ?',[socket.id,data]  );

                              }
              });


              client.query('SELECT * FROM logueados',
                           function (err, resp, fields) {

                                    console.log("Actualizando logueados");
                                    io.emit('infoUsers', resp);
                                //  socket.broadcast.emit('infoUsers', resp);
                          });






    });

});


http.listen(8080, function() {
  console.log('Running Server...');
  console.log('listening on *:8080');
});
