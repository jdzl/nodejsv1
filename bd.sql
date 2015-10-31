create database test;

CREATE TABLE personaje(
   personaje_id smallint(5) unsigned not null auto_increment primary key,
   nombre varchar(50) not null,
   apellido varchar(50) not null,
   biografia varchar(50) not null
);
CREATE TABLE logueados (
  id INT(11) NOT NULL ,
  usuario VARCHAR(20) NOT NULL,  
  PRIMARY KEY  (id)
);
CREATE TABLE usuarios (
  id INT(11) NOT NULL AUTO_INCREMENT,
  usuario VARCHAR(20) NOT NULL,
  password VARCHAR(10) NOT NULL,
  PRIMARY KEY  (id)
);
CREATE TABLE lista_amigos (
  id_amigo INT(11) NOT NULL,
  id_usuario INT(11) NOT NULL,
  PRIMARY KEY  (id_amigo),
  FOREIGN KEY  (id_usuario) REFERENCES usuarios(id)
);

CREATE TABLE publicaciones (
  id INT(11) NOT NULL AUTO_INCREMENT,
  id_us INT(11) NOT NULL,
  msg VARCHAR(400) NOT NULL,
  PRIMARY KEY  (id),
  FOREIGN KEY  (id_us) REFERENCES usuarios(id)
);
SELECT msg 
FROM   publicaciones
where id_us  in (SELECT la.id_amigo FROM  lista_amigos la, usuarios u where la.id_usuario = u.id and u.id=1);


SELECT id_friend FROM friend_list fl, user u where fl.id = u.id