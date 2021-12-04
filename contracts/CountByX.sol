pragma solidity ^0.4.19;

contract CountByX {
  function countBy(int _x, int _n) public view returns (int[]) {
    int[] z;
    z.push(_x);
    for(uint i = 1; i < uint(_n); i++) {
      z.push( _x * int(i + 1));
    }
    return z;
  }
}
