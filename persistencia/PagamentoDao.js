module.exports = function (app) {
    function PagamentoDao(connection) {
        this._connection = connection;
    }

    PagamentoDao.prototype.salva = function (pagamento, callback) {
        if (this._connection && this._connection.query) {
            this._connection.query('INSERT INTO pagamentos SET ?', pagamento, callback);
        } else {
            app.locals.db.collection('pagamentos').insert(pagamento, callback);
        }
    }

    PagamentoDao.prototype.atualiza = function (pagamento, callback) {
        if (this._connection && this._connection.query) {
            this._connection.query('UPDATE pagamentos SET status = ? where id = ?', [pagamento.status, pagamento.id], callback);
        } else {
            app.locals.db.collection('pagamentos').update(pagamento._id, pagamento, callback);
        }
    }

    PagamentoDao.prototype.lista = function (callback) {
        if (this._connection && this._connection.query) {
            this._connection.query('select * from pagamentos', callback);
        } else {
            app.locals.db.collection('pagamentos').find({}, callback);
        }
    }

    PagamentoDao.prototype.buscaPorId = function (id, callback) {
        if (this._connection && this._connection.query) {
            this._connection.query("select * from pagamentos where id = ?", [id], callback);
        } else {
            app.locals.db.collection('pagamentos').findOne({ _id: pagamento._id }, callback);
        }
    }

    return PagamentoDao;
};
