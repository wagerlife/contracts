const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);
const { interface, bytecode } = require('../2018-02-04-big-game/compile');

let bigGame;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  bigGame = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1500000' });
  bigGame.setProvider(provider);
});

describe('BigGame Contract', () => {
  it('deploys a contract', () => {
    assert.ok(bigGame.options.address);
  });

  it('gets playerIndex at the beginning', async () => {
    const playerIndex = await bigGame.methods
      .getPlayerIndex(accounts[0])
      .call();
    assert.equal(playerIndex, 0);
  });

  it('can enter birds', async () => {
    await bigGame.methods.enter('birds').send({
      from: accounts[0],
      value: web3.utils.toWei('0.015', 'ether'),
    });

    let balance = await bigGame.methods.getBalance().call();
    assert.equal(balance, web3.utils.toWei('0.015', 'ether'));

    const playerIndex = await bigGame.methods
      .getPlayerIndex(accounts[0])
      .call();

    assert.equal(playerIndex, 1);
  });

  it('can enter pats', async () => {
    await bigGame.methods.enter('pats').send({
      from: accounts[0],
      value: web3.utils.toWei('0.015', 'ether'),
    });

    let balance = await bigGame.methods.getBalance().call();
    assert.equal(balance, web3.utils.toWei('0.015', 'ether'));

    const playerIndex = await bigGame.methods
      .getPlayerIndex(accounts[0])
      .call();

    assert.equal(playerIndex, 2);
  });

  it('can refund everybody', async () => {
    await bigGame.methods.enter('birds').send({
      from: accounts[0],
      value: web3.utils.toWei('0.015', 'ether'),
    });

    let balance = await bigGame.methods.getBalance().call();
    assert.equal(balance, web3.utils.toWei('0.015', 'ether'));

    await bigGame.methods.refundEverybody().send({
      from: accounts[0],
    });

    balance = await bigGame.methods.getBalance().call();
    assert.equal(balance, 0);
  });

  it('only manager can call pickWinner', async () => {
    try {
      await bigGame.methods.pickWinner('birds').send({
        from: accounts[0],
      });
      /* `assert(false) will always fail our test` */
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it('lets you pick a winner', async () => {
    assert.equal(
      await web3.eth.getBalance(accounts[1]),
      web3.utils.toWei('100', 'ether'),
    );
    await bigGame.methods.enter('birds').send({
      from: accounts[1],
      value: web3.utils.toWei('0.015', 'ether'),
    });
    assert(
      (await web3.eth.getBalance(accounts[1])) <
        web3.utils.toWei('99.985', 'ether'),
    );
    await bigGame.methods.enter('pats').send({
      from: accounts[2],
      value: web3.utils.toWei('0.015', 'ether'),
    });
    await bigGame.methods.enter('pats').send({
      from: accounts[3],
      value: web3.utils.toWei('0.015', 'ether'),
    });

    let balance = await bigGame.methods.getBalance().call();
    assert.equal(balance, web3.utils.toWei('0.045', 'ether'));

    assert.equal(await bigGame.methods.getBirdsLength().call(), 1);
    assert.equal(await bigGame.methods.getPatsLength().call(), 2);

    await bigGame.methods
      .pickWinner('birds')
      .send({ from: accounts[0], gas: '1500000' });

    assert.equal(
      await bigGame.methods.finalBirdsPayout().call(),
      web3.utils.toWei('0.045', 'ether'),
    );

    assert(
      (await web3.eth.getBalance(accounts[1])) > web3.utils.toWei('1', 'ether'),
    );
    assert(
      (await web3.eth.getBalance(accounts[1])) >
        web3.utils.toWei('100.014', 'ether'),
    );
  });
});
