pragma solidity ^0.4.18;

contract BigGame {
    address public manager;
    address[] public teamBirds;
    address[] public teamPats;
    mapping (address => uint) playerIndex;
    uint public finalPatsPayout;
    uint public finalBirdsPayout;

    function BigGame() public {
        manager = msg.sender;
        finalPatsPayout = 0;
        finalBirdsPayout = 0;
    }

    modifier restricted() {
      require(msg.sender == manager);
      _;
    }

    function compareStrings (string a, string b) internal pure returns (bool) {
      return keccak256(a) == keccak256(b);
    }

    function getPlayerIndex(address userAccount) public view returns (uint) {
      return playerIndex[userAccount];
    }

    function getBalance() public view returns (uint) {
        return this.balance;
    }

    function getBirdsLength() public view returns (uint) {
        return teamBirds.length;
    }

    function getPatsLength() public view returns (uint) {
        return teamPats.length;
    }

    function getBirdsPayout() public view returns (uint) {
        return this.balance / teamBirds.length;
    }

    function getPatsPayout() public view returns (uint) {
        return this.balance / teamPats.length;
    }

    function enter(string teamChoice) public payable {
        /* It cost 0.015 ETH. */
        require(msg.value == .015 ether);

        /* Make sure they aren't entered twice. */
        require(playerIndex[msg.sender] == 0);

        if (compareStrings("birds", teamChoice)) {
          teamBirds.push(msg.sender);
          playerIndex[msg.sender] = 1;
        } else if (compareStrings("pats", teamChoice)) {
          teamPats.push(msg.sender);
          playerIndex[msg.sender] = 2;
        }
    }

    function pickWinner(string winningTeam) public restricted {
        if (compareStrings("birds", winningTeam)) {
            uint birdsPayout = getBirdsPayout();
            finalBirdsPayout = birdsPayout;
            for (uint i = 0; i < teamBirds.length; i ++) {
                teamBirds[i].transfer(birdsPayout);
                playerIndex[teamBirds[i]] = 3;
            }
            for (uint j = 0; j < teamPats.length; j ++) {
                playerIndex[teamPats[j]] = 4;
            }
        } else if (compareStrings("pats", winningTeam)) {
            uint patsPayout = getPatsPayout();
            finalPatsPayout = patsPayout;
            for (uint k = 0; k < teamPats.length; k ++) {
                teamPats[k].transfer(patsPayout);
                playerIndex[teamPats[k]] = 5;
            }
            for (uint l = 0; l < teamBirds.length; l ++) {
                playerIndex[teamBirds[l]] = 6;
            }
        }
    }

    function refundEverybody() public payable returns (bool) {
      for (uint i = 0; i < teamBirds.length; i ++) {
        teamBirds[i].transfer(.015 ether);
      }
      for (uint j = 0; j < teamPats.length; j ++) {
        teamPats[j].transfer(.015 ether);
      }

      playerIndex[msg.sender] = 9;
      delete teamBirds;
      delete teamPats;

      return true;
    }
}
