const { expect } = require("chai");
const { ethers } = require("hardhat");

const gameCreatedIfc = new ethers.utils.Interface([
  "event GameCreated(address creator, uint gameNumber, uint bet)",
]);
const gameStartedIfc = new ethers.utils.Interface([
  "event GameStarted(address[] players, uint gameNumber)",
]);
const gameCompleteIfc = new ethers.utils.Interface([
  "event GameComplete(address winner, uint gameNumber)",
]);

const getEventFromTx = async (tx, eventName) => {
  const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
  let ifc;
  switch (eventName) {
    case "GameCreated":
      ifc = gameCreatedIfc;
      break;
    case "GameStarted":
      ifc = gameStartedIfc;
      break;
    case "GameComplete":
      ifc = gameCompleteIfc;
  }

  const data = receipt.logs[0].data;
  const topics = receipt.logs[0].topics;
  return ifc.decodeEventLog(eventName, data, topics);
};

describe("Kata", function () {
  let contract;
  let owner;
  let address1;
  let address2;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    owner = signers[0];
    address1 = signers[1];
    address2 = signers[2];

    const Contract = await ethers.getContractFactory("Kata");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  describe("createGame", () => {
    it("should let us create a game", async () => {
      const bet = 1000;
      const tx = await contract.createGame(address1.address, { value: bet });
      const event = await getEventFromTx(tx, "GameCreated");
      expect(event.creator).to.equal(owner.address);
      expect(event.gameNumber);
      expect(event.bet).to.equal(bet);
    });
    it("should not let us create a game with a wager of 0", async () => {
      const bet = 0;
      await expect(
        contract.createGame(address1.address, { value: bet })
      ).revertedWith("Bets must be greater than 0 ETH");
    });
  });

  describe("joinGame", () => {
    it("should let us join a game", async () => {
      const bet = 1000;
      let tx = await contract.createGame(address1.address, { value: bet });
      let event = await getEventFromTx(tx, "GameCreated");
      const gameNumber = event.gameNumber;
      tx = await contract
        .connect(address1)
        .joinGame(gameNumber, { value: bet });
      event = await getEventFromTx(tx, "GameStarted");
      const players = event.players;
      expect(players.indexOf(owner.address)).is.greaterThan(-1);
      expect(players.indexOf(address1.address)).is.greaterThan(-1);
    });
    it("should not let us join with a bet less than the amount the game was created with", async () => {
      const bet = 1000;
      const tx = await contract.createGame(address1.address, { value: bet });
      const event = await getEventFromTx(tx, "GameCreated");
      const gameNumber = event.gameNumber;
      await expect(
        contract.connect(address1).joinGame(gameNumber, { value: 10 })
      ).revertedWith("Insufficient bet amount");
    });
    it("should not let the game creator join after creation", async () => {
      const bet = 1000;
      const tx = await contract.createGame(address1.address, { value: bet });
      const event = await getEventFromTx(tx, "GameCreated");
      const gameNumber = event.gameNumber;
      await expect(contract.joinGame(gameNumber, { value: bet })).revertedWith(
        "Game creator cannot join once game is created"
      );
    });
    it("should not let an unauthorized account join the game", async () => {
      const bet = 1000;
      const tx = await contract.createGame(address1.address, { value: bet });
      const event = await getEventFromTx(tx, "GameCreated");
      const gameNumber = event.gameNumber;
      await expect(
        contract.connect(address2).joinGame(gameNumber, { value: bet })
      ).revertedWith("Unauthorized to join game");
    });
  });

  describe("makeMove", () => {
    it("should detect a winner", async () => {
      const bet = 1000;
      let tx = await contract.createGame(address1.address, { value: bet });
      let event = await getEventFromTx(tx, "GameCreated");
      const gameNumber = event.gameNumber;
      await contract.connect(address1).joinGame(gameNumber, { value: bet });
      await contract.makeMove(gameNumber, 1); // Rock
      tx = await contract.connect(address1).makeMove(gameNumber, 2); // Paper
      event = await getEventFromTx(tx, "GameComplete");
      expect(event.winner).to.equal(address1.address);
    });
    it("should return the 0 address if the result is a tie", async () => {
      const bet = 1000;
      let tx = await contract.createGame(address1.address, { value: bet });
      let event = await getEventFromTx(tx, "GameCreated");
      const gameNumber = event.gameNumber;
      await contract.connect(address1).joinGame(gameNumber, { value: bet });
      await contract.makeMove(gameNumber, 1); // Rock
      tx = await contract.connect(address1).makeMove(gameNumber, 1); // Rock
      event = await getEventFromTx(tx, "GameComplete");
      expect(event.winner).to.equal(
        ethers.utils.getAddress("0x0000000000000000000000000000000000000000")
      );
    });
  });
});
