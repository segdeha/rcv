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

  /**
   * Helper function to robustly round a number to a specified number of decimal places,
   * mitigating floating-point precision issues.
   * This is crucial for accurate percentage calculations.
   *
   * @param {number} num - The number to round.
   * @param {number} decimalPlaces - The number of decimal places to round to.
   * @returns {number} The rounded number.
   */
  static roundToDecimalPlaces(num, decimalPlaces) {
    if (typeof num !== 'number' || typeof decimalPlaces !== 'number') {
      throw new Error("Both `num` and `decimalPlaces` must be numbers.");
    }
    if (decimalPlaces < 0) {
      throw new Error("`decimalPlaces` must be a non-negative integer.");
    }
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }

  constructor() {
    // array of candidates & statuses
    /*
      {
        candidate: <string>,
        status: 'active'|'eliminated',
        currentRoundVotes: <number>,
        currentRoundPercentage: <number>,
      }
    */
    this.candidates = [];

    // array of raw votes, prepped for processing
    /*
      {
        voter: '<string>',
        status: 'active'|'exhausted',
        currentRankIndex: <number>,
        ranks: [...],
      }
    */
    this.votes = [];

    // array of results from each voting round
    /*
      {
        roundNumber: <number>,
        totalActiveBallots: <number>,
        candidateResults: {
          <candidateName>: {
            count: <number>,
            percentage: <number>,
          }
        }
      }
    */
    this.rounds = [];
  }

  // extract candidates and mark each as 'active' to start
  // Also initializes currentRoundVotes and currentRoundPercentage for candidates
  map(candidateNames) {
    return candidateNames.map(name => {
      return {
        candidate: name,
        status: RCV.STATUS_ACTIVE,
        // These properties will be updated in each round's count()
        currentRoundVotes: 0,
        currentRoundPercentage: 0,
      };
    });
  }

  // prepare raw votes for each voter:
  // - set to active to start
  // - sort ranks by rank (1 through n, with 0s at the end)
  // - add currentRankIndex to track which rank is being considered for this ballot
  prep(rawVotes) {
    return rawVotes.map(vote => {
      let { voter, ranks } = vote;
      const dnrs = ranks.filter(rank => 0 === rank.rank);
      const ranked = ranks.filter(rank => rank.rank > 0);
      // Sort non-DNRs by rank ascending (1st, 2nd, 3rd, ...)
      ranked.sort((a, b) => a.rank - b.rank);
      ranks = [...ranked, ...dnrs]; // DNRs at the end

      return {
        voter,
        status: RCV.STATUS_ACTIVE,
        currentRankIndex: 0,
        ranks,
      };
    });
  }

  /**
   * Allocates a ballot to its highest-ranked active candidate.
   * Modifies the ballot's status if exhausted.
   *
   * @param {Object} ballot - The ballot object to allocate.
   * @returns {string | null} The name of the allocated candidate, or null if exhausted.
   */
  allocate(ballot) {
    // Loop through the voter’s ranks starting from their currentRankIndex.
    // This is how votes are reallocated in subsequent rounds.
    for (let i = ballot.currentRankIndex; i < ballot.ranks.length; i += 1) {
      const { candidate: rankedCandidateName, rank } = ballot.ranks[i];

      // If this rank is 0 (DNR), or if we've gone past all ranked preferences,
      // this ballot cannot be allocated further.
      if (rank === 0) {
        ballot.status = RCV.STATUS_EXHAUSTED;
        return null;
      }

      // Find the candidate object in this.candidates to check its status
      const candidateObj = this.candidates.find(c => c.candidate === rankedCandidateName);

      // Check if the candidate exists and is currently active
      if (candidateObj && candidateObj.status === RCV.STATUS_ACTIVE) {
        // This is the highest-ranked active candidate for this ballot.
        // Update the ballot's currentRankIndex to remember this position for future rounds.
        ballot.currentRankIndex = i;
        return rankedCandidateName;
      }
      // If the candidate is eliminated or not found, continue to the next rank on this ballot.
    }

    // If the loop finishes without finding an active candidate, the ballot is exhausted.
    ballot.status = RCV.STATUS_EXHAUSTED;
    return null;
  }

  /**
   * Counts the current first-preference votes for all active candidates.
   * This function performs one round's tally based on the current state of ballots and candidates.
   *
   * @param {Array<Object>} allBallots - All ballots (active, exhausted, etc.).
   * @returns {Object} An object containing total active ballots and counts/percentages for each candidate.
   */
  count(allBallots) {
    // Reset current round votes for all candidates before tallying this round
    this.candidates.forEach(candidate => {
      candidate.currentRoundVotes = 0;
      candidate.currentRoundPercentage = 0;
    });

    const activeBallotsInRound = allBallots.filter(ballot => ballot.status === RCV.STATUS_ACTIVE);
    const totalActiveBallotsCount = activeBallotsInRound.length;

    // Allocate each active ballot and tally votes for this round
    activeBallotsInRound.forEach(ballot => {
      // allocate also updates ballot.currentRankIndex
      const allocatedCandidateName = this.allocate(ballot);
      if (allocatedCandidateName) {
        const obj = this
          .candidates
          .find(candidate => candidate.candidate === allocatedCandidateName);
        if (obj) {
          obj.currentRoundVotes += 1;
        }
      }
    });

    // Calculate percentages for active candidates based on this round's tally
    const roundCandidateResults = {};
    this.candidates.forEach(candidate => {
      if (candidate.status === RCV.STATUS_ACTIVE) {
        const percentage = totalActiveBallotsCount > 0
          ? RCV.roundToDecimalPlaces((candidate.currentRoundVotes / totalActiveBallotsCount) * 100, 0)
          : 0; // Round to 0 decimal places for whole percentages
        // Update candidate object for next round's sorting/elimination
        candidate.currentRoundPercentage = percentage;
        roundCandidateResults[candidate.candidate] = {
          count: candidate.currentRoundVotes,
          percentage: percentage,
        };
      }
      else {
        // Include eliminated candidates with 0 votes for consistent reporting
        // across rounds
        roundCandidateResults[candidate.candidate] = {
          count: 0,
          percentage: 0,
        };
      }
    });

    return {
      totalActiveBallots: totalActiveBallotsCount,
      candidateResults: roundCandidateResults,
    };
  }

  /**
   * Runs the Instant Runoff Voting algorithm.
   * @returns {Object} The final results including all rounds and the winner(s).
   */
  reduce() {
    let roundNumber = 0;
    let winnerFound = false;
    let winners     = [];

    // The recursive function for each voting round
    const runRound = () => {
      roundNumber += 1;

      // this.count updates candidate.currentRoundVotes/Percentage
      const currentRoundTally = this.count(this.votes);

      // Store the results of this round
      this.rounds.push({
        roundNumber: roundNumber,
        totalActiveBallots: currentRoundTally.totalActiveBallots,
        candidateResults: currentRoundTally.candidateResults,
      });

      // Check for Majority Winner among active candidates
      const activeCandidates = this
        .candidates
        .filter(candidate => candidate.status === RCV.STATUS_ACTIVE);

      for (const candidateObj of activeCandidates) {
        // A candidate wins if they have 50% or more of the active ballots AND have actual votes
        if (
            candidateObj.currentRoundPercentage >= 50 &&
            candidateObj.currentRoundVotes > 0
           ) {
          winnerFound = true;
          winners.push(candidateObj.candidate);
          return; // Exit the runRound function, as a winner is found
        }
      }

      // If no winner, proceed to elimination (unless there's 1 or 0 active candidates left)
      if (!winnerFound) {
        if (activeCandidates.length <= 1) {
          // If only one candidate left, they are the winner (if they have votes)
          if (activeCandidates.length === 1 && activeCandidates[0].currentRoundVotes > 0) {
            winnerFound = true;
            winners.push(activeCandidates[0].candidate);
          }
          else {
            // No active candidates left or no votes remaining. No winner.
          }
          // Exit the runRound function
          return;
        }

        // Find candidate(s) with the fewest votes among active candidates
        // Sort active candidates by currentRoundVotes ascending to find the lowest
        activeCandidates.sort((a, b) => a.currentRoundVotes - b.currentRoundVotes);

        const lowestVoteCount = activeCandidates[0].currentRoundVotes;
        const candidatesToEliminate = activeCandidates
          .filter(candidate => candidate.currentRoundVotes === lowestVoteCount);

        // Mark identified candidates as eliminated in the main this.candidates array
        candidatesToEliminate.forEach(cToElim => {
          const candidateInMainList = this
            .candidates
            .find(candidate => candidate.candidate === cToElim.candidate);
          if (candidateInMainList) {
            candidateInMainList.status = RCV.STATUS_ELIMINATED;
          }
        });

        // Check if any candidates were actually eliminated to prevent infinite loops
        const activeCandidatesAfterElimination = this
          .candidates
          .filter(candidate => candidate.status === RCV.STATUS_ACTIVE);
        if (activeCandidatesAfterElimination.length < activeCandidates.length) {
          // Recurse to the next round if eliminations occurred
          runRound();
        }
        else {
          // This means no candidates were eliminated in this step (e.g., all remaining tied with 0 votes)
          // or all candidates have been eliminated.
          // If there's a tie for winner and all have 50% (unlikely in standard IRV but possible with rounding)
          // or if all remaining candidates have 0 votes and are tied, no clear winner.
          // For simplicity, we'll just return what we have.
          if (activeCandidates.length > 0) {
             // This might be a scenario where all remaining candidates are tied with 0 votes
             // or some other deadlock. No clear winner.
          }
        }
      }
    };

    // Start the first round of the RCV process
    runRound();

    return {
      rounds: this.rounds,
      winners,
      candidates: this.candidates,
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

  /**
   * Main entry point to run the RCV tally.
   * @param {string[]} candidateNames - Array of all candidate names.
   * @param {Array<Object>} rawVotes - Array of raw vote objects.
   * @returns {Object} The final RCV results.
   */
  tally(candidateNames, rawVotes) {
    // Reset internal state for a fresh tally
    this.candidates = [];
    this.votes = [];
    this.rounds = [];

    // Initialize candidates with status
    this.candidates = this.map(candidateNames);

    // Prepare ballots with sorted ranks and initial status
    this.votes = this.prep(rawVotes);

    // record raw votes for each candidate
    this.record(this.candidates, this.votes);

    // Start the reduction process
    const result = this.reduce();

    return result;
  }
}

export { RCV };
