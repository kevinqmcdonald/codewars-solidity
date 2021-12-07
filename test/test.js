const Kata = artifacts.require("Kata");
contract('Check for factor', () => {
  it("should return true", async () => {
    const d = await Kata.deployed();
    assert.equal((await d.checkForFactor.call(10, 2)).valueOf(), true);
    assert.equal((await d.checkForFactor.call(63, 7)).valueOf(), true);
    assert.equal((await d.checkForFactor.call(2450, 5)).valueOf(), true);
    assert.equal((await d.checkForFactor.call(24612, 3)).valueOf(), true);
  });

  it("should return false", async () => {
    const d = await Kata.deployed();
    assert.equal((await d.checkForFactor.call(9, 2)).valueOf(), false);
    assert.equal((await d.checkForFactor.call(653, 7)).valueOf(), false);
    assert.equal((await d.checkForFactor.call(2453, 5)).valueOf(), false);
    assert.equal((await d.checkForFactor.call(24617, 3)).valueOf(), false);
  });
});