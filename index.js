// importamos expres
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

// Creamos una ruta que recibe como parametro un nombre para que mediente que proporcionemos el parametro
// Ejemplo de uso: localhost:9090/NOMBRE A ENCRIPTAR
//
app.get('/encriptar/:nombre', async (req, res)=>{
    try{

	// Recibimos como parametro el nombre
	const nombre = req.params.nombre;

	// Este es el token que guardamos en .env
	const SecretToken = await process.env.TOKEN_SECRET;

	// Creamos el token proporcionandole lo que vamos  a encriptar, La llave, y el tiempo de expiración
	const token = await jwt.sign({nombre:req.params.nombre}, SecretToken, {expiresIn:'1000s'});

	// Retornamos el token;
	res.json({msg:`Este es el nombre recibido ${nombre}`, token: token})


    
    }
    catch(e){
	console.log("Ocurrio un error ", e);
    }

})



// CREARMOS UN MIDDLEWARE PARA AUTENTICAR NUESTRO JWT
//

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  // REVISAMOS QUE SI SE ENVIA UN TOKEN
  if (token == null) return res.status(401).send({msg : 'No ha ingresado un token'})

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {

    // VERIFICAMOS QUE EL TOKEN COINCIDA CON LA CONTRASENA
    if (err) return  res.status(403).send({msg : 'Token invalido'})
    req.token = user
    next()
  })
}



// Utilizando el middleware  authenticateToken

app.post('/desencriptar', authenticateToken,  async (req, res)=>{
    try{

	let token = req.token.nombre;

	// Retornamos el token;
	res.status(200).send({msg:`Este es el valor del token  ${req.token.nombre}`})



    }
    catch(e){
	console.log("Ocurrio un error ", e);
    }

})

// iniciarmos nuestro servidor
app.listen(app.get('port'), () =>{
    console.log(`Server on port ${app.get('port')}`);
})
