/* RCV algorithm */

// responsibilities:
// - calculate the winner based on a data structure of ranked-choice votes

// tally the votes

// votes is an array of cast ballots
// a ballot is an object with 2 properties:
// - voter: string, unique among ballots
// - ranks: array of rank objects
//   a rank object has 2 properties:
//   - candidate: string, unique among ranks
//   - rank: number from 1 (highest ranked) to n, the number of candidates

/* vote:

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

/* votes:

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

/**
 * RCV uses the common ranked-choice voting method of counting the first place
 * votes, then eliminating the candidate with the fewest votes and reallocating
 * those votes to the candidates ranked second on those ballots. This process
 * repeats until one candidate exceeds 50%.
 */

class RCV {
  constructor() {
    // intermediary object to make it efficient to record raw votes
    this.results = {};
    // array of results to make it easy to sort and display
    this.result = [];
    // bind this so it works in the context of the sort
    this.compareArraysByCounts = this.compareArraysByCounts.bind(this);
    this.maxRank = 0;
  }

  // extract candidates and create empty ranks arrays from array of votes
  map(candidates) {
    return candidates.forEach(candidate => {
      this.results[candidate] = [];
    });
  }

  // record the raw votes for each candidate
  record(votes) {
    votes.forEach(vote => {
      vote.ranks.forEach(rank => {
        this.results[rank.candidate].push(rank.rank);
      });
    });
    this.result = Object.keys(this.results).map(key => {
      return {
        candidate: key,
        ranks: this.results[key],
      };
    });
  }

  /**
   * Counts the occurrences of numbers 1 through this.maxRank within a single array.
   * Initializes counts for all specified numbers to ensure consistent comparison.
   * @param {number[]} arr The array to count values from.
   * @returns {Object.<number, number>} An object where keys are numbers
   *          (1 through this.maxRank) and values are their counts.
   */
  countOccurrences(array) {
      // Initialize all relevant counts to 0
      const counts = {};
      for (let i = 0; i <= this.maxRank; i += 1) {
        counts[i] = 0;
      }
      for (const item of array) {
        // Only count items w/in the valid range (1 thru this.maxRank)
        if (item >= 1 && item <= this.maxRank) {
          counts[item]++;
        }
      }
      return counts;
  }

  /**
   * Compares two arrays based on the descending count of numbers 1 through 5.
   * It first compares the count of 1s. If they are equal, it compares the count of 2s, and so on.
   * More occurrences of a number mean it comes first in the sort order.
   *
   * @param {number[]} arrA The first array to compare.
   * @param {number[]} arrB The second array to compare.
   * @returns {number} A negative number if arrA should come before arrB,
   * a positive number if arrA should come after arrB,
   * or 0 if their order doesn't matter based on these criteria.
   */
  compareArraysByCounts(a, b) {
    // Calculate counts for both arrays
    const countsA = this.countOccurrences(a.ranks);
    const countsB = this.countOccurrences(b.ranks);

    // Iterate through the values (1 through maxRank) in priority order
    // i.e., ignore DNRs
    for (let i = 1; i <= this.maxRank; i += 1) {
      const countA = countsA[i];
      const countB = countsB[i];

      // If the counts for the current number are different, that determines the order.
      // We want arrays with MORE of a specific number to come first (descending sort by count).
      if (countA !== countB) {
        return countB - countA; // If countA > countB, this will be negative (a comes first)
                                // If countB > countA, this will be positive (b comes first)
      }
    }

    // If all counts (for 1s through maxRanks) are identical,
    // sort randomly so as not to influence future votes.
    return (Math.random() * 2) - 1;
  }

  // sort by 1st place votes, 2nd place votes, etc.
  sort() {
    this.result.sort(this.compareArraysByCounts);
  }

  tally(candidates, votes) {
    this.maxRank = candidates.length;
    // map sets up results array, but also clears it if votes exist
    this.map(candidates); // do this first
    this.record(votes);   // do this second
    this.sort();          // do this third
    return this.result;
  }
}

export { RCV };
