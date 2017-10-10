var memcached = require('memcached');

module.exports = function () {
    return createMemcachedClient;
}

function createMemcachedClient() {
    var client = new memcached('localhost:11211', {
        retries: 10, //numero de tentativas feitas por request
        retry: 10000, // tempo de tentativa até 10 segundos
        remove: true //remover do pool algum nó que esteja morto
    });

    return client;
}


