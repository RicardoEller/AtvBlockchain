const express = require('express');
const { Web3 } = require('web3');
const { abi, networks } = require('./build/contracts/RegistroCertificado.json');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const port = 3000;

const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
const web3 = new Web3(provider);

const networkId = "5777";
const contratoAddress = networks[networkId]?.address;

if (!contratoAddress) {
    throw new Error(`O Contrato não implantado na rede especificada (networkId: ${networkId}).`);
}

const contrato = new web3.eth.Contract(abi, contratoAddress);

function stringifyBigInt(obj) {
    return JSON.parse(
        JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )
    );
}

app.post('/certificado', async (req, res) => {
    const { action, id, nomeAluno, curso, dataEmissao } = req.body;
    const accounts = await web3.eth.getAccounts();

    try {
        if (action === 'register') {
            await contrato.methods.registrarCertificado(id, nomeAluno, curso, dataEmissao)
                .send({ from: accounts[0], gas: 500000 });
            res.json({ message: 'O certificado foi registrado!' });
        } else if (action === 'get') {
            const certificado = await contrato.methods.obterCertificado(id).call();
            const result = stringifyBigInt({
                id: certificado[0],
                nomeAluno: certificado[1],
                curso: certificado[2],
                dataEmissao: certificado[3],
                valido: certificado[4]
            });
            res.json(result);
        } else if (action === 'revoke') {
            await contrato.methods.revogarCertificado(id)
                .send({ from: accounts[0], gas: 500000 });
            res.json({ message: 'Certificado revogado' });
        } else {
            res.status(400).json({ error: 'Ação inválida.' });
        }
    } catch (error) {
        console.error("Erro ao executar ação:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/certificados', async (req, res) => {
    try {
        const ids = await contrato.methods.obterTodosIdsCertificados().call();
        const certificados = await Promise.all(
            ids.map(async (id) => {
                const certificado = await contrato.methods.obterCertificado(id).call();
                return {
                    id: certificado[0].toString(),
                    valido: certificado[4]
                };
            })
        );
        res.json(certificados);
    } catch (error) {
        console.error("Erro na listagem:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor em: http://localhost:${port}`);
});
