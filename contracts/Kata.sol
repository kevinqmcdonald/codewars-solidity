//SPDX-License-Identifier: Unlicense
pragma solidity ^0.4.19;

contract Kata {

    function multiply(uint8 _repeat, string _pattern) public pure returns (string) {
        string memory _result = "";
        for(uint8 i = 0; i < _repeat; ++i) {
            _result = concat(_result, _pattern);
        }
        return _result;
    }

    // Concatenates two strings by transforming them into bytes and
    // concatenating those values (solidity 0.4.19 doesn't support
    // abi.encodePacked() by default)
    function concat(string _base, string _value) internal pure returns (string) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);

        string memory _tmp = new string(_baseBytes.length + _valueBytes.length);
        bytes memory _resultBytes = bytes(_tmp);

        uint i;
        uint j;

        for(i = 0; i < _baseBytes.length; ++i) {
            _resultBytes[j++] = _baseBytes[i];
        }

        for(i = 0; i < _valueBytes.length; ++i) {
            _resultBytes[j++] = _valueBytes[i];
        }

        return string(_resultBytes);
    }

}
