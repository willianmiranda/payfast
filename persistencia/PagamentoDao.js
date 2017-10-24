module.exports = function (app) {
    function PagamentoDao(connection) {
        this._connection = connection;
    }
    
    PagamentoDao.prototype.salva = function (pagamento, callback) {
        if (this._connection && this._connection.query) {
            this._connection.query('INSERT INTO pagamentos SET ?', pagamento, callback);
        } else {
            app.locals.db['pagamentos'].insert(pagamento, callback);
        }
    }
    
    PagamentoDao.prototype.atualiza = function (pagamento, callback) {
        this._connection.query('UPDATE pagamentos SET status = ? where id = ?', [pagamento.status, pagamento.id], callback);
    }
    
    PagamentoDao.prototype.lista = function (callback) {
        this._connection.query('select * from pagamentos', callback);
    }
    
    PagamentoDao.prototype.buscaPorId = function (id, callback) {
        this._connection.query("select * from pagamentos where id = ?", [id], callback);
    }

    return PagamentoDao;
};
