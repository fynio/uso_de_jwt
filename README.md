
#Hola a todos#

Hola a todos hoy les traigo un minitutorial para poder utilizar JWT en Express y Node

##Instalación##

Instalamos con npm ejecutando el comando 
npm install jsonwebtoken

![Instalación de jwt](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/t3y53s89yczfapa6uuvu.png)

También utilizaremos un par de librerías más como crypto y dotenv 

npm install crypto dotenv express


![npm install crypto dotenv express](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/o2ef9yltk0dvt05j1f2q.png)





###crypto###

Este módulo permite a los desarrolladores trabajar con operaciones criptográficas, como el cifrado y descifrado de datos, la generación de claves, la creación de resúmenes criptográficos (hashes) y más.

Este modulo lo utilizaremos para crear una clave para JWT para ello utilizaremos un metodo llamado randomBytes() el cual genera una secuencia de bytes aleatorios de longitud 64 utilizando una fuente de números aleatorios seguros proporcionada por la biblioteca criptográfica de Node.js. Los bytes generados son aleatorios y se consideran seguros para su uso en aplicaciones que requieren datos aleatorios, como claves criptográficas, tokens de autenticación, números de sesión y más.


###dotenv###

La dependencia dotenv es una herramienta comúnmente utilizada en aplicaciones Node.js para cargar variables de entorno desde un archivo llamado .env en el entorno de desarrollo. Estas variables de entorno suelen contener información sensible o configuración específica de la aplicación, como credenciales de bases de datos, claves de API, configuraciones de puerto, entre otros.

Una vez explicado lo que necesitamos y para que sirve pues **Manos a la obra**

En nuestro proyecto de node creamos un archivo para poder generar esta contraseña que servira como clave para generar nuestro jwt.

**Nota:** Este archivo es temporal solo nos servirá para poder generar nuestra contrasena, posteriormente si asi lo desean pueden eliminarlo

Archivo: encriptar.js
```
const crypto = require('crypto');
const Password = crypto.randomBytes(64).toString('hex');
console.log(Password);
```
lo guardamos con el nombre **encriptar.js** y lo ejecutamos con node de la siguiente manera:

```
node encriptar.js
```

El cual nos retornara la contraseña  

![token](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1z83m9hjcm81d9w0m7zf.png)

Ahora teniendo la contrasena la guardamos en un archivo .env el cual debe quedar de la siguiente manera:

Archivo: .env
![.env](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gro4775zqxn6tg50i6du.png)


Hasta ahora vamos bien, comenzaremos por crear nuestro archivo index.js 

Importaremos todas las dependencias que hemos instalado


Archivo: index.js

```
// importamos express
const express = require('express');
const app = express();
const router = express.Router();
// importamos jwt
const jwt = require('jsonwebtoken');

// importamos dotenv
const dotenv = require("dotenv");
// ejecutamos .config() el cual nos va a permitir acceder al archivo .env
dotenv.config();


// configurarmos el puerto donde correra nuestro servidor
//
app.set('port', process.env.PORT || 9090);


```

##Ruta encriptar


Creamos una ruta llamada **encriptar** utilizando el método **GET** que recibe como parametro un nombre

Recibiremos mediante el parametro **:nombre** el valor a encriptar 


```
app.get('/encriptar/:nombre', async (req, res)=>{
    try{

	// Recibimos como parametro el nombre
	const nombre = req.params.nombre;

	// Accedemos a la variable TOKEN_SECRET que guardamos en .env
	const SecretToken = process.env.TOKEN_SECRET;


	// Creamos el token proporcionandole lo que vamos  a encriptar, La llave, y el tiempo de expiración
	const token = jwt.sign({nombre:req.params.nombre}, SecretToken, {expiresIn:'1000s'});


	// Retornamos el token;
	res.status(200).send({msg:`El nombre es ${nombre}`, token:`${token}`})



    }
    catch(e){
	console.log("Ocurrio un error ", e);
    }

})



```

Posteriormente ponemos a la escucha el servidor el cual configuramos el puerto 9090


```
// ponemos a la escuchar el servidor creado
app.listen(app.get('port'), () =>{
    console.log(`Server on port ${app.get('port')}`);
})

```


##Middleware

Los middlewares se utilizan comúnmente en aplicaciones web para procesar y manipular las solicitudes del cliente antes de que lleguen a la capa de la aplicación principal, lo que permite realizar tareas como la validación de datos, la seguridad y la gestión de sesiones

Crearemos un middleware para validar el token creando la funcion authenticateToken el cual recibe miente el header Authorization el token.

**NOTA** para enviar el token se realiza mediante el header Authorizacion y el parametro Beared + token


```
//  MIDDLEWARE 

function authenticateToken(req, res, next) {

  // Recibe el token mediante el header authorization
  const authHeader = req.headers['authorization']
  
  // obtiene el token 
  const token = authHeader && authHeader.split(' ')[1]

  // Se valida que el token sea enviado en caso contrario manda un error
  if (token == null) return res.status(401).send({msg : 'No ha ingresado un token'})

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {

    // VERIFICAMOS QUE EL TOKEN COINCIDA CON LA CONTRASENA
    if (err) return  res.status(403).send({msg : 'Token invalido'})
    req.token = user
    next()
  })
}

```


##Utilizando el middleware  authenticateToken##


Creamos una nueva ruta llamada **desencriptar** donde agregamos el **middleware** que creamos. El cual nos retornara el token ya **desencriptado** y lo podemos utilizar mediante el parametro **req.token**.


##Descencriptando##

Mediante el método post creamos la ruta desencriptar pasandole el middleware el cual retorna el valor descencriptado

**Nota:** El usuario debera enviar el token a descencriptar mediante el **HEADER**

```
app.post('/desencriptar', authenticateToken,  async (req, res)=>{
    try{

	let Nobre = req.token.nombre;
	// Retornamos el token;
	res.status(200).send({msg:`El nombre es Nobre`})
    }
    catch(e){
	console.log("Ocurrio un error ", e);
    }

})
```

Bueno, ya teniendo esto ya tenemos listo todo nuestro código

para correr nuestro servidor ejecutamos

node index.js


![ejecutando](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lgqy313clxmn4bbzrb9x.png)


##Encriptando##

Una vez corriendo el servidor utilizare **POSTMAN** para hacer pruebas.

Utilizamos el método get y como parámetro le envió un **nombre** en este caso **rodrigo**


![Postman 1](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ofp039ss6pcnqquguerr.png)

Esto retorna el valor a encriptar y el **token** que se genera.


##Desencriptando##

Para poder descencriptar necesitamos enviar el token que obtuvimos mediante el metodo get y lo enviamos en los headers con el metodo Authorization y el parametro Beared

![post postman](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5heswoddtp2wdzrkfl1h.png)

Esto retorna el token descencriptado.


Y eso es todo.

Si tienen alguna sugerencia es bienvenida.

##Sale bye##
