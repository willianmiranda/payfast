module.exports = (app) => {
    app.get('/pagamentos', (req, res) => {
        console.log('recebidos');
        res.send('OK');
    });

    app.get('/pagamentos/pagamento/:id', function (req, res) {
        var id = req.params.id;
        console.log('consultando pagamento: ' + id);

        var memcachedClient = app.servicos.memcachedClient();

        memcachedClient.get('pagamento-' + id, function (erro, retorno) {
            if (erro || !retorno) {
                console.log('MISS - chave não encontrada');

                let connection = app.persistencia.connectionFactory();
                let pagamentoDAO = app.persistencia.PagamentoDAO(connection);

                pagamentoDAO.buscaPorId(id, function (erro, resultado) {
                    if (erro) {
                        console.log('erro ao consultar o banco: ' + erro);
                        res.status(500).send(erro);
                        return;
                    }

                    console.log('pagamento encontrado: ' + JSON.stringify(resultado));
                    res.json(resultado);
                    return;
                });
                // HIT no cache
            } else {
                console.log('HIT - valor: ' + JSON.stringify(retorno));
                res.json(resultado);
                return;
            }
        });
    })

    app.delete('/pagamentos/pagamento/:id', (req, res) => {

        let id = req.params.id;

        let pagamento = {};
        pagamento.id = id;
        pagamento.status = "cancelado";

        let connection = app.persistencia.connectionFactory();
        let pagamentoDAO = app.persistencia.PagamentoDAO(connection);

        pagamentoDAO.atualiza(pagamento, (erro) => {
            if (erro) {
                res.status(500).send(erro);
                return;
            }
            console.log('pagamento cancelado');
            res.send(pagamento);
        });
    });

    app.put('/pagamentos/pagamento/:id', (req, res) => {

        let id = req.params.id;

        let pagamento = {};
        pagamento.id = id;
        pagamento.status = "confirmado";

        let connection = app.persistencia.connectionFactory();
        let pagamentoDAO = app.persistencia.PagamentoDAO(connection);

        pagamentoDAO.atualiza(pagamento, (erro) => {
            if (erro) {
                res.status(204).send(erro);
                return;
            }
            console.log('pagamento confirmado');
            res.send(pagamento);
        });
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
                // res.status(201).json(pagamento);

                var memcachedClient = app.servicos.memcachedClient();

                memcachedClient.set('pagamento-' + resultado.id, pagamento, 60000, function (erro) {
                    console.log('nova chave adicionada ao cache: pagamento-' + resultado.id);
                });

                if (pagamento.forma_de_pagamento == "cartao") {
                    let cartao = req.body['cartao'];

                    // clienteCartoes.autoriza(cartao);

                    let clienteCartoes = new app.servicos.clienteCartoes();

                    clienteCartoes.autoriza(cartao, (exception, request, response, retorno) => {
                        if (exception) {
                            console.log(exception);
                            res.status(400).send(exception);
                            return;
                        }
                        console.log(retorno);
                        res.status(201).json(retorno);
                        return;
                    });

                    res.status(201).json(cartao);

                } else {
                    res.location('/pagamentos/pagamento/' + pagamento.id);

                    let response = {
                        dados_do_pagamento: pagamento,
                        links: [
                            {
                                href: 'http://localhost:3000/pagamentos/pagamento' + pagamento.id,
                                rel: "confimar",
                                method: "PUT"
                            },
                            {
                                href: 'http://localhost:3000/pagamentos/pagamento' + pagamento.id,
                                rel: "cancelar",
                                method: "DELETE"
                            }
                        ]
                    };

                    res.status(201).json(pagamento);
                }
            }
        });

        // res.send(pagamento);
    });

}
