/* Voting Machine */

// responsibilities:
// - keep a list of candidates
// - record votes associated with voters

class VotingMachine {
  constructor() {
    this.items = [
      /*
      {
        name: 'Yellow Bird',
        votes: [3, 2, 1], // 3 1sts, 2 2nds, 1 3rd
      }
      */
    ];
    this.votes = {
      /*
      'Jerry Tanaka': {
        'Yellow Bird': 1, // ranked 1st
        'Tabasco': 3, // ranked 3rd
        'Chipotle Cholula': 2, // ranked 2nd
      },
      */
    };
  }

  // add a new item to be voted on
  // item should be a string that can be used as the items name
  // the votes array will start empty
  add(item) {
    this.items.push({
      name: item,
      votes: [],
    })

console.table(this.items)

  }

  // return a simple array of strings of the candidate items
  list() {
    return this.items.map(item => item.name);
  }

  // record a vote (array of rankings of items associated with a name)
  vote(name, votes) {}

  // return an array of the names of the voters
  voters() {
    return Object.keys(this.votes);
  }

  // return an array of items and the votes cast for them
  votes() {}

  // tally the votes
  tally() {
    const result = {
      voters: this.voters(),
      votes: [],
    };
  }
}

export { VotingMachine };
