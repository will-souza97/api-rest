// Criando e configurando servidor
const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:false }))

require('./app/controllers/index')(app)


// Ligando o servidor em um porta no localhost:
app.listen(3000, ()=> console.log("Servidor Startado...."))