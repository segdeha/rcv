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
  allocate(ballot) {
    // loop through the voter’s ranks in descending order, stop when an active
    // candidate is found
    for (let i = 0; i < ballot.ranks.length; i += 1) {
      const { candidate, rank } = ballot.ranks[i];
      // does at least 1 active candidate exist with a rank > 0?
      if (rank > 0) {
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
  // and calculate percentages
  countOccurrences(array) {
    // remove null values from array
    array = array.filter(item => null !== item);
    // Initialize all relevant counts to 0
    const counts = {};
    array.forEach(item => {
      if (counts[item]) {
        counts[item].count += 1;
      }
      else {
        counts[item] = { count: 1 };
      }
    });
    Object.keys(counts).forEach(key => {
      // we have to round because of occasional floating point sillyness
      counts[key].percentage = Math.round((counts[key].count / array.length).toPrecision(2) * 100);
    })
    return {
      total: array.length,
      counts,
    };
  }

  record(candidates, votes) {
    candidates.forEach(candidate => {
      // loop through all votes tally how many of each the candidate got
      candidate.counts = {};
      votes.forEach(vote => {
        const { ranks } = vote;
        ranks.forEach(rank => {
          if (candidate.candidate === rank.candidate) {
            if (candidate.counts[rank.rank]) {
              candidate.counts[rank.rank] += 1;
            }
            else {
              candidate.counts[rank.rank] = 1;
            }
          }
        });
      });
    });
  }

  // count vote totals & percentages for 1 voting round
  // TODO handle ties?
  count(votes) {
    const activeBallots = votes.filter(vote => {
      return vote.status === RCV.STATUS_ACTIVE;
    });
    const allocated = activeBallots.map(ballot => {
      return this.allocate(ballot);
    });
    return this.countOccurrences(allocated);
  }

  // this is where we RCV/IRV
  reduce() {
    // did any candidate get more than 50% of the active 1st place votes?
    // if not, find the candidate(s) with the fewest 1st place votes
      // use total votes across all ranks as the first tie breaker
      // use random selection as the second tie breaker
    // find the ballots with that/those candidate(s) as their top active one
      // reallocate the next highest ranked vote from those ballots

    // reset the rounds
    this.rounds = [];

    const round = () => {
      const count = this.count(this.votes);

      this.rounds.push(count);

      const winners = Object.keys(count.counts).filter(key => {
        return count.counts[key].percentage >= 50;
      });

      if (count.total > 0) {
        if (winners.length < 1) {
          const actives_pre = this.candidates.filter(candidate => {
            return candidate.status === RCV.STATUS_ACTIVE;
          });

          // eliminate the candidate with the fewest 1st place votes
          // store the latest results on the candidate
          actives_pre.forEach(candidate => {
            if (count.counts[candidate.candidate]) {
              candidate.count = count.counts[candidate.candidate].count;
              candidate.percentage = count.counts[candidate.candidate].percentage;
            }
          });
          actives_pre.sort((a, b) => {
            return a.count - b.count;
          });

          const lowest = actives_pre[0].count;

          for (let i = 0; i < actives_pre.length; i += 1) {
            const active = actives_pre[i];
            if (active.count <= lowest) {
              active.status = RCV.STATUS_ELIMINATED;
            }
          }

          // ensure we eliminated someone to avoid an infinite loop
          const actives_post = this.candidates.filter(candidate => {
            return candidate.status === RCV.STATUS_ACTIVE;
          });
          if (actives_pre.length > actives_post.length) {
            // recurse
            return round();
          }
        }
        else {
          // we have a winner (or 2 winners)!
          return winners;
        }
      };
    };

    // recursively determine the winner or winners if 2 get exactly 50%
    const winners = round();

    return {
      rounds: this.rounds,
      winners,
    };
  }

  tally(candidates, votes) {
    // map sets up results array, but also clears it if votes exist
    this.candidates = this.map(candidates); // do this first
    this.votes      = this.prep(votes);     // do this second

    // record raw votes for each candidate
    this.record(this.candidates, this.votes);

    return {
      candidates: this.candidates,
      tally:      this.reduce(),
    };
  }
}

export { RCV };
