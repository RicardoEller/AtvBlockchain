const RegistroCertificado = artifacts.require('../contracts/RegistroCertificado.sol');

module.exports = async function (_deployer) {
  await _deployer.deploy(RegistroCertificado);
  await RegistroCertificado.deployed();
};
