// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

contract RegistroCertificado {

    struct Certificado {
        uint id;
        string nomeAluno;
        string curso;
        string dataEmissao;
        bool valido;
    }

    mapping(uint => Certificado) public certificados;
    uint[] public idsCertificados;

    event CertificadoRegistrado(uint id, string nomeAluno, string curso, string dataEmissao);
    event CertificadoRevogado(uint id);

    function registrarCertificado(uint _id, string memory _nomeAluno, string memory _curso, string memory _dataEmissao) public {
        require(certificados[_id].id == 0, "ID do certificado ja existe.");

        certificados[_id] = Certificado({
            id: _id,
            nomeAluno: _nomeAluno,
            curso: _curso,
            dataEmissao: _dataEmissao,
            valido: true
        });

        idsCertificados.push(_id);

        emit CertificadoRegistrado(_id, _nomeAluno, _curso, _dataEmissao);
    }

    function obterCertificado(uint _id) public view returns (uint, string memory, string memory, string memory, bool) {
        Certificado memory cert = certificados[_id];
        require(cert.id != 0, "Certificado nao existe.");

        return (cert.id, cert.nomeAluno, cert.curso, cert.dataEmissao, cert.valido);
    }

    function revogarCertificado(uint _id) public {
        Certificado storage cert = certificados[_id];
        require(cert.id != 0, "Certificado nao existe.");
        require(cert.valido, "Certificado revogado.");

        cert.valido = false;
        emit CertificadoRevogado(_id);
    }

    function obterTodosIdsCertificados() public view returns (uint[] memory) {
        return idsCertificados;
    }
}
