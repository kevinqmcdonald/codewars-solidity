//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.2;

contract Kata {
  event GameCreated(address creator, uint gameNumber, uint bet);
  event GameStarted(address[] players, uint gameNumber);
  event GameComplete(address winner, uint gameNumber);

  struct Game {
    address[2] players;
    mapping(address => uint) playerMoves;
    uint bet;
    bool started;
    bool finished;
  }

  mapping(uint => Game) games;
  uint[] gameNumbers;

  function createGame(address payable _participant) public payable {
    require(msg.value > 0, "Bets must be greater than 0 ETH");

    // Create the game
    uint _gameNumber = gameNumbers.length + 1;
    Game storage _game = games[_gameNumber];
    _game.players = [msg.sender, _participant];
    _game.bet = msg.value;
    _game.started = false;
    _game.finished = false;
    gameNumbers.push(_gameNumber);

    // Emit
    emit GameCreated(msg.sender, _gameNumber, msg.value);
  }

  function joinGame(uint _gameNumber) public payable {
    Game storage _game = games[_gameNumber];

    // Check transaction validity
    require(msg.value >= _game.bet, "Insufficient bet amount");
    require(msg.sender != _game.players[0], "Game creator cannot join once game is created");
    require(msg.sender == _game.players[1], "Unauthorized to join game");
    require(!_game.started && !_game.finished, "Game is not joinable");

    // Refund extra bet (if required)
    if(msg.value > _game.bet) {
      bool sent = msg.sender.send(msg.value - _game.bet);
      require(sent, "Failed to issue refund for excess bet");
    }

    // Start the game
    _game.started = true;

    // Emit
    address[] memory _players = new address[](2);
    _players[0] = _game.players[0];
    _players[1] = _game.players[1];
    emit GameStarted(_players, _gameNumber);
  }

  function makeMove(uint _gameNumber, uint _moveNumber) public {
    Game storage _game = games[_gameNumber];

    // Check transaction validity
    require(_game.started, "Cannot make move for game that hasn't started yet");
    require(!_game.finished, "Cannot make move for game that has finished");
    require(msg.sender == _game.players[0] || msg.sender == _game.players[1], "Unauthorized to make move");
    require(_moveNumber > 0 && _moveNumber < 4, "Invalid move");
    require(_game.playerMoves[msg.sender] == 0, "Player has already moved");

    // Make move
    _game.playerMoves[msg.sender] = _moveNumber;

    // Check if game is finished
    if(_game.playerMoves[_game.players[0]] != 0 && _game.playerMoves[_game.players[1]] != 0) {
      // Check result
      address _winner;
      if(_game.playerMoves[_game.players[0]] == _game.playerMoves[_game.players[1]]) {
        _winner = address(0);
      } else {
        if(_game.playerMoves[_game.players[0]] == 1) { // Rock
          if(_game.playerMoves[_game.players[1]] == 2) {
            _winner = _game.players[1];
          } else {
            _winner = _game.players[0];
          }
        } else if(_game.playerMoves[_game.players[0]] == 2) { // Paper
          if(_game.playerMoves[_game.players[1]] == 3) {
            _winner = _game.players[1];
          } else {
            _winner = _game.players[0];
          }
        } else if(_game.playerMoves[_game.players[0]] == 3) { // Scissors
          if(_game.playerMoves[_game.players[1]] == 1) {
            _winner = _game.players[1];
          } else {
            _winner = _game.players[0];
          }
        }
      }

      // Send payout to winner (or both players if result was a tie)
      if(_winner != address(0)) {
        require(payable(_winner).send(_game.bet * 2), "Failed to send payout to winner");
      } else {
        require(payable(_game.players[0]).send(_game.bet), "Failed to issue bet refund");
        require(payable(_game.players[1]).send(_game.bet), "Failed to issue bet refund");
      }

      // Update game state
      _game.started = false;
      _game.finished = true;
      emit GameComplete(_winner, _gameNumber);
    }
  }
}
