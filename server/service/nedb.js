var nedb = require('nedb');
var db = new nedb({filename: 'C:/Apps/Gantt/BD/banco.db', autoload: true});
var dbVendas = new nedb({filename: 'C:/Apps/Gantt/BD/vendas.db', autoload: true});
var dbProcessos = new nedb({filename: 'C:/Apps/Gantt/BD/processos.db', autoload: true});
var dbConfig = new nedb({filename: 'C:/Apps/Gantt/BD/config.db', autoload: true});
var dbCapacidade = new nedb({filename: 'C:/Apps/Gantt/BD/capacidade.db', autoload: true});
var dbGanttComercial = new nedb({filename: 'C:/Apps/Gantt/BD/ganttcomercial.db', autoload: true});
var dbApontamento = new nedb({filename: 'C:/Apps/Gantt/BD/apontamento.db', autoload: true});

function insert([dados, arquivo]) {
    console.log("Inserindo dados no arquivo: ", arquivo, " - dados: ", dados)
    eval(`db${arquivo}`).insert(dados, function(err){
        if(err)return console.log(err); //caso ocorrer algum erro
       
        console.log("Novo registro adicionado!");
       });
}
module.exports.insert = insert


function apaga([dados, arquivo]) {
    eval(`db${arquivo}`).remove({_id: dados._id}, {}, function (err) {
        if(err)return console.log(err);
      
        console.log(`Registro ${dados} removido do arquivo: ${arquivo}`);
      });
}
module.exports.apaga = apaga


function buscar([dados, arquivo]) {
    return new Promise(
        (resolve,reject)=>{
            console.log("solicitando pesquisa para:", dados)
            eval(`db${arquivo}`).find(dados, function (err, docs) {
                if(err)return reject(err);
                console.log("Registro procurado, resposta: ", docs);
                resolve(docs)
              });
        }
    )

}
module.exports.buscar = buscar

function atualizar([dados, arquivo]) {
    console.log("Atualizando dados no arquivo: ", arquivo, " - dados: ", dados)
    eval(`db${arquivo}`).update({_id: dados._id}, dados, {}, function(err){
        if(err)return console.log(err); //caso ocorrer algum erro
       
        console.log("Registro atualizado!");
       });
}
module.exports.atualizar = atualizar