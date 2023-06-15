

const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser');
const app = express()

const db = require('./service/nedb')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors())
const port = 3008

app.get('/', (req, res) => {
    res.send('Hello World!')
    console.log("Require recebida: ", req)
})

app.post('/postagem', (req, res) => {
    res.send('Hello!!!! Este é um post!')
    console.log("Require recebida no post: ", req.body)
})

//   Inserir dados no BD
app.post('/inserir', (req, res) => {
    res.send('Solicitação de inclusão recebida')
    db.insert(req.body)
})

//   Consultar dados do BD
app.post('/buscar', (req, res) => {
    db.buscar(req.body).then(
        resposta => {
            res.send(resposta)
            console.log("Resposta obtida da consulta do BD", resposta)
            //res.status().send(body)
        }
    )
})

// Apagar dados do DB
app.post('/apagar', (req, res) => {
    res.send('Solicitação de exclusão recebida para o id: ')
    db.apaga(req.body)
})

//   Inserir dados no BD
app.post('/atualizar', (req, res) => {
    res.send('Solicitação de alteração recebida')
    db.atualizar(req.body)
})


app.listen(port, () => {
    console.log(`Server rodando na porta ${port}`)
})

