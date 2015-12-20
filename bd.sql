create database test;
use test;
CREATE TABLE personaje(
   personaje_id smallint(5) unsigned not null auto_increment primary key,
   nombre varchar(50) not null,
   apellido varchar(50) not null,
   biografia varchar(50) not null
);
CREATE TABLE logueados (
  id INT(11) NOT NULL ,
  id_session VARCHAR(50) NOT NULL,
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

INSERT INTO usuarios VALUES ('','native','had');
INSERT INTO usuarios VALUES ('','mortum','had');
INSERT INTO usuarios VALUES ('','mortum2','had');
INSERT INTO usuarios VALUES ('','admin','had');
INSERT INTO usuarios VALUES ('','hans','had');

/*
SELECT msg 
FROM   publicaciones
where id_us  in (SELECT la.id_amigo FROM  lista_amigos la, usuarios u where la.id_usuario = u.id and u.id=1);

SELECT msg   
              FROM   publicaciones 
              where id_us  in (SELECT la.id_amigo 
                               FROM  lista_amigos la, usuarios u 
                               where la.id_usuario = u.id and u.id= (SELECT id 
                                                       FROM usuarios 
                                                       WHERE usuario ='native'))
*/