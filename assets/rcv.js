/* RCV algorithm */

// responsibilities:
// - calculate the winner based on a data structure of ranked-choice votes

/**
 * RCV uses the common ranked-choice voting method of counting the first place
 * votes, then eliminating the candidate with the fewest votes and reallocating
 * those votes to the candidates ranked second on those ballots. This process
 * repeats until one candidate exceeds 50%.
 */

class RCV {
  static STATUS_ACTIVE = 'active';
  static STATUS_EXHAUSTED = 'exhausted';
  static STATUS_ELIMINATED = 'eliminated';

  constructor() {
    // array of candidates & statuses
    // [ { candidate: <string>, status: 'active'|'eliminated' }, ]
    this.candidates = [];

    // array of results from each voting round
    // [ { candidate: <string>, votes: <number of allocated votes> }, ]
   this.rounds = [];
  }

  // extract candidates and mark each as 'active' to start
  map(candidates) {
    return candidates.map(candidate => {
      return {
        candidate,
        status: RCV.STATUS_ACTIVE,
      };
    });
  }

  // prepare raw votes for each voter:
  // - set to active to start
  // - sort ranks by rank
  /* raw vote:
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
  // shape of the resulting objects in the votes array should be as follows:
  // {
  //   voter: '<string>',
  //   status: 'active',
  //   ranks: [ // sorted 1 through n, with 0s at the end
  //     { candidate: '<string>', rank: <number> },
  //   ],
  // }
  prep(votes) {
    // loop through votes
    // for each vote, add `status:'active'` and order the ranks 1, 2, ... n, 0
    return votes.map(vote => {
      let { voter, ranks } = vote;
      const dnrs = ranks.filter(rank => 0 === rank.rank);
      const ranked = ranks.filter(rank => rank.rank > 0);
      // sort only non DNRs
      ranked.sort((a, b) => {
        const rankA = a.rank;
        const rankB = b.rank;
        return rankA - rankB;
      });
      ranks = [...ranked, ...dnrs];
      return {
        voter,
        status: RCV.STATUS_ACTIVE,
        ranks,
      };
    });
  }

  // allocate a ballot to a candidate (i.e., find the highest active candidate
  // for a given ballot
  // ranks are sorted at this point, thanks to the `prep` method
  // with DNRs listed last
  // if no valid candidate is found, mark the ballot as exhausted
  allocate(ballot, activeBallots) {
    // loop through the voter’s ranks in descending order, stop when an active
    // candidate is found
    for (let i = 0; i < ballot.ranks.length; i += 1) {
      const { candidate, rank } = ballot.ranks[i];
      // does at least 1 active candidate exist with a rank > 0?
      if (rank > 0 && activeBallots.length > 0) {
        // return the first candidate that matches, if it’s active
        if (this.candidates.filter(item => {
          return item.status === RCV.STATUS_ACTIVE && item.candidate === candidate;
        }).length > 0) {
          return candidate;
        }
      }
    }
    // no candidates matched, so this ballot is exhausted
    ballot.status = RCV.STATUS_EXHAUSTED;
    return null;
  }

  // count the number of times each item in the array occurs in the array
  countOccurrences(array) {
      // Initialize all relevant counts to 0
      const counts = {};
      array.forEach(item => {
        if (counts[item]) {
          counts[item] += 1;
        }
        else {
          counts[item] = 1;
        }
      });
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
  // compareArraysByCounts(a, b) {
  //   // Calculate counts for both arrays
  //   const countsA = this.countOccurrences(a.ranks);
  //   const countsB = this.countOccurrences(b.ranks);

  //   // Iterate through the values (1 through maxRank) in priority order
  //   // i.e., ignore DNRs
  //   for (let i = 1; i <= this.maxRank; i += 1) {
  //     const countA = countsA[i];
  //     const countB = countsB[i];

  //     // If the counts for the current number are different, that determines the order.
  //     // We want arrays with MORE of a specific number to come first (descending sort by count).
  //     if (countA !== countB) {
  //       return countB - countA; // If countA > countB, this will be negative (a comes first)
  //                               // If countB > countA, this will be positive (b comes first)
  //     }
  //   }

  //   // If all counts (for 1s through maxRanks) are identical,
  //   // sort randomly so as not to influence future votes.
  //   return (Math.random() * 2) - 1;
  // }

  // // sort by 1st place votes, 2nd place votes, etc.
  // sort() {
  //   this.result.sort(this.compareArraysByCounts);
  // }

/*
Instant Runoff Voting Algorithm (Simplified Rounds):

Initialization:

- All candidates are "active."
- All ballots are "active" (not exhausted).

Repeat (for each round) until a winner is found:

1. Tally First Preferences:
- For every active ballot, identify its highest-ranked active candidate.
- Count the number of these "first preference" votes for each active candidate.

2. Check for Majority Winner:
- Calculate the total number of active ballots in this round.
- If any active candidate has more than 50% of the total active ballots' votes:
- That candidate wins. The process ends.

3. Elimination (If No Majority):
- Identify the active candidate(s) with the fewest first preference votes.
- Handle Ties for Fewest: If multiple candidates are tied for the fewest votes, apply a defined tie-breaking rule (e.g., eliminate the candidate who had fewer votes in the previous round, or randomly choose one, or eliminate all tied candidates if they are all at the bottom).
- Eliminate the identified candidate(s) from the set of active candidates.

4. Vote Redistribution:
- For every ballot that had the just-eliminated candidate(s) as its highest active preference:
- Find the next highest-ranked candidate on that ballot who is still active.
- Transfer that ballot's vote to this newly identified active candidate.
- If a ballot has no more ranked preferences for any active candidate:
- Mark that ballot as "exhausted." It will not contribute to future rounds.

5. Loop:
- Return to Step 1 (Tally First Preferences) with the updated set of active candidates and the redistributed votes.
*/

  // TODO handle ties?
  count(votes) {
    const activeBallots = votes.filter(vote => {
      return vote.status === RCV.STATUS_ACTIVE;
    });
    const allocated = activeBallots.map(ballot => {
      return this.allocate(ballot, activeBallots);
    });
    const tally = this.countOccurrences(allocated);
    return tally;
  }

  // this is where we RCV/IRV
  reduce() {

// console.log('RCV.reduce', 'this.result', this.result)

    // did any candidate get more than 50% of the active 1st place votes?
    // if not, find the candidate(s) with the fewest 1st place votes
      // use total votes across all ranks as the first tie breaker
      // use random selection as the second tie breaker
    // find the ballots with that/those candidate(s) as their top active one
      // reallocate the next highest ranked vote from those ballots
  }

  tally(candidates, votes) {
    // map sets up results array, but also clears it if votes exist
    this.candidates = this.map(candidates); // do this first
    this.votes      = this.prep(votes);     // do this second
    // this.sort();          // do this third
    // this.reduce();        // do this last
    return this.result;
  }
}

export { RCV };
