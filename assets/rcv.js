/* RCV algorithm */

// responsibilities:
// - calculate the winner based on a data structure of ranked-choice votes
// - 

/**
 * RCV uses the common ranked-choice voting method of counting the first place
 * votes, then eliminating the candidate with the fewest votes and reallocating
 * those votes to the candidates ranked second on those ballots. This process
 * repeats until one candidate exceeds 50%.
 */

class RCV {
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
  }

  // record a vote
  vote() {}

  // tally the votes
  tally() {}
}

export { RCV };
