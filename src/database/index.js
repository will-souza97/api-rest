// Conectando no Banco de Dados ( MongoDB )
const mongoose = require('mongoose');

// Criando conexão com o Mongodb Client: ( Banco de Dados Mongodb instalado no computador )
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test123', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
// Criando conexão com o Mongodb Atlas: ( na Nuvem )
//mongoose.connect('', { useNewUrlParser: true, useUnifiedTopology: true})

module.exports = mongoose;
