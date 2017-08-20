module.exports = (app) => {
    app.get('/pagamentos', (req, res) => {
        console.log('recebidos');
        res.send('OK');
    });

    app.post('/pagamentos/pagamento', (req, res) => {
        
        req
            .assert("forma_de_pagamento", "forma de pagamento é obrigatório")
            .notEmpty();
        req
            .assert("valor", "valor tem de ser decimal e não pode ser vazio")
            .notEmpty()
            .isFloat();

        let erros = req.validationErrors();

        if (erros) {
            console.log('erros de validação encontrados');
            res.status(400).send(erros);
            return;
        }

        let pagamento = req.body;
        
        console.log(pagamento);
        
        pagamento.status = 'criado';
        pagamento.data = new Date();

        let connection = app.persistencia.connectionFactory;
        let pagamentoDao = app.persistencia.PagamentoDAO(connection);

        pagamentoDAO.salva(pagamento, (erro, resultado) => {
            if (erro) {
                console.log('erro ao inserir no banco: ' + erro);
                res.status(500).send(erro);
            } else {
                console.log('pagamento salvo');
                res.location('/pagamentos/pagamento/' + resultado.insertIde);
                res.status(201).json(pagamento);
            }
        });

        // res.send(pagamento);
    });
}
