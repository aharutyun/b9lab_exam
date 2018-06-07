pragma solidity ^0.4.13;

import "./Owned.sol";
import "./interfaces/PausableI.sol";

contract Pausable is PausableI, Owned {

    bool paused;

    function Pausable(bool _isPaused) public {
        paused = _isPaused;
    }

    modifier whenPaused {
        require(paused);
        _;
    }

    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    function setPaused(bool newState) fromOwner returns(bool success) {
        require(paused != newState);
        paused = newState;
        LogPausedSet(msg.sender, paused);
        return true;
    }

    function isPaused() constant returns(bool isIndeed) {
        return paused;
    }
}
