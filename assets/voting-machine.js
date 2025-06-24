/* Voting Machine */

// responsibilities:
// - keep a list of candidates
// - 

class VotingMachine {
  constructor(items = []) {
    this.items = items
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

  // record a vote
  vote(item, rank) {}

  // return an array of items and the votes cast for them
  votes() {}

  // tally the votes
  tally() {}
}

export { VotingMachine };
