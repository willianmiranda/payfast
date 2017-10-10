let soap = require('soap');

soap.createClient('', (erro, cliente) => {
  if (erro) {
    console.log('deu erro', erro);
    return;
  }
  console.log('cliente soap criado');
  cliente
    .CalcPrazo({
      nCdServico: 40010,
      sCepOrigem: '04563000',
      sCepDestino: '0488010'
    },
    (err, resultado) => {
      console.log(JSON.stringify(resultado));
    }
  );
});