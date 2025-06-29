/* Voting Machine */

import { RCV } from './rcv.js'

// responsibilities:
// - keep a list of candidates
// - record votes (ranks for each candidate) associated with voters
// - tally the votes based on the algo of choice (RCV)

class VotingMachine {
  constructor() {
    // algorithm used to tally votes
    this.algo = new RCV();

    // simple array of strings
    this.candidates = [];

    // a vote is an object with a voter and an array of ranks
    this.votes = [
      /*
        {
          voter: 'Sally Ride',
          ranks: [
            {
              candidate: 'Chipotle Cholula',
              rank: 1,
            },
            {
              candidate: 'Tabasco',
              rank: 3,
            },
            {
              candidate: 'Yellow Bird',
              rank: 2,
            },
          ],
        }
      */
    ];
  }

  // add a new item to be voted on
  // item should be a string that can be used as the items name
  // the votes array will start empty
  add(candidate) {
    this.candidates.push(candidate);
  }

  // return a simple array of strings of the candidates
  list() {
    return this.candidates;
  }

  // record a vote (array of rankings of items associated with a name)
  vote(voter, ranks) {
    // if the voter exists, replace their vote, otherwise add it
    const idx = this.votes.findIndex(item => item.voter === voter);
    const vote = { voter, ranks };
    if (idx > -1) {
      this.votes[idx] = vote;
    }
    else {
      this.votes.push(vote);
    }
  }

  // return an array of the names of the voters
  voters() {
    return this.votes.map(vote => vote.voter);
  }

  // tally the votes
  tally() {
    // candidates, votes, voters
    const candidates = this.list();
    const votes      = this.votes;
    const voters     = this.voters();
    const result = this.algo.tally(candidates, votes, voters);
    return {
      voters: this.voters(),
      result,
    };
  }
}

export { VotingMachine };
