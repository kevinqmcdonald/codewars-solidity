const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Kata", function () {
  let contract;
  beforeEach(async () => {
    const Contract = await ethers.getContractFactory("Kata");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  it("Should pass its tests", async function () {
    /*
      expect(await greeter.greet()).to.equal("Hello, world!");

      const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

      // wait until the transaction is mined
      await setGreetingTx.wait();

      expect(await greeter.greet()).to.equal("Hola, mundo!");
    */
    expect(await contract.angle(3)).to.equal(180);
    expect(await contract.angle(4)).to.equal(360);
  });
});
