const CountByX = artifacts.require("CountByX");
contract('CountBy', function(accounts) {
  // Note: Web3's BigNumber format must be converted for JavaScript friendly presentation
  const countAndConvert = async (x,n) => {
    return (await (await CountByX.deployed()).countBy.call(x, n)).toString().split(',').map(Number);
  }
  it('should have a function "countBy" which returns an array of multiples of x', async () => {
    assert.deepEqual(await countAndConvert(1,5), [1,2,3,4,5])
    assert.deepEqual(await countAndConvert(2,5), [2,4,6,8,10])
  });
});