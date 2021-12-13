const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Repeater", function () {
  let repeater;
  beforeEach(async () => {
    const Repeater = await ethers.getContractFactory("Kata");
    repeater = await Repeater.deploy();
    await repeater.deployed();
  });

  it("should have a function 'multiply' that correctly multiplies two integers (Sample Test)", async function () {
    expect(await repeater.multiply(4, "a")).to.equal("aaaa");
    expect(await repeater.multiply(3, "Hello")).to.equal("HelloHelloHello");
    expect(await repeater.multiply(5, "")).to.equal("");
    expect(await repeater.multiply(0, "kata")).to.equal("");
  });
});
