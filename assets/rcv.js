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
  constructor() {
    // nothing to do here, methinks
  }

  // tally the votes

  // votes is an array of cast ballots
  // a ballot is an object with 2 properties:
  // - voter: string, unique among ballots
  // - ranks: array of rank objects
  //   a rank object has 2 properties:
  //   - candidate: string, unique among ranks
  //   - rank: number from 1 (highest ranked) to n, the number of candidates

  /*
    {
      voter: 'Sally Ride',
      ranks: [
        {
          candidate: 'Chipotle Cholula',
          rank: 2, // second highest rank
        },
        {
          candidate: 'Tabasco',
          rank: 0, // Do Not Rank
        },
        {
          candidate: 'Yellow Bird',
          rank: 1, // highest rank
        },
      ],
    }
  */

  // output of a tally is an array of candidates, sorted in descending order by
  // 1st place ranks

  /*
    [
      {
        candidate: 'Yellow Bird',
        ranks: [1, 0, 0], // 1 1st, 0 2nds, 0 3rds
      },
      {
        candidate: 'Chipotle Cholula',
        ranks: [0, 1, 0], // 0 1sts, 1 2nd, 0 3rds
      },
    ]
  */

  tally(votes) {}
}

export { RCV };
