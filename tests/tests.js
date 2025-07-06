/* Unit tests for the RCV class */

import { RCV } from '../assets/rcv.js'

const results = [];

function addResult(func, actual, expected) {
  const stringified = {
    actual: JSON.stringify(actual),
    expected: JSON.stringify(expected),
  };
  // compare
  const same = stringified.actual === stringified.expected;
  // display
  results.push(`
<h2>${func}</h2>
<p>${same ? '✅' : '❌'} The actual and expected values${same ? ' ' : ' do not '}match.</p>
<table>
  <tr>
    <th>Actual</th>
    <th>Expected</th>
  </tr>
  <tr>
    <td><code>${stringified.actual}</code></td>
    <td><code>${stringified.expected}</code></td>
  </tr>
</table>
`);
}

// fixtures

// candidates
const candidatesActual = ['Yellow Bird', 'Chipotle Cholula', 'Tabasco'];
const candidatesExtendedActual = ['Yellow Bird', 'Chipotle Cholula', 'Tabasco', 'Sriracha'];
const candidatesExpected = [{"candidate":"Yellow Bird","status":"active","currentRoundVotes":0,"currentRoundPercentage":0},{"candidate":"Chipotle Cholula","status":"active","currentRoundVotes":0,"currentRoundPercentage":0},{"candidate":"Tabasco","status":"active","currentRoundVotes":0,"currentRoundPercentage":0}];
const candidatesExtendedExpected = [{candidate:'Yellow Bird',status:RCV.STATUS_ACTIVE},{candidate:'Chipotle Cholula',status:RCV.STATUS_ACTIVE},{candidate:'Tabasco',status:RCV.STATUS_ACTIVE},{candidate:'Sriracha',status:RCV.STATUS_ACTIVE}];

// votes
// {
//   voter: '<string>',
//   status: RCV.STATUS_ACTIVE,
//   ranks: [ // sorted 1 through n, with 0s at the end
//     { candidate: '<string>', rank: <number> },
//   ],
// }
const votesActual   = [{ voter: 'Sally Ride', ranks: [{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Yellow Bird', rank: 1 }]}];
const votesExpected = [{"voter":"Sally Ride","status":"active","currentRankIndex":0,"ranks":[{"candidate":"Yellow Bird","rank":1},{"candidate":"Chipotle Cholula","rank":2},{"candidate":"Tabasco","rank":0}]}];

// single vote
const voteActual = {"voter":"Sally Ride","status":"active","currentRankIndex":0,"ranks":[{"candidate":"Yellow Bird","rank":1},{"candidate":"Chipotle Cholula","rank":2},{"candidate":"Tabasco","rank":0}]};
const voteExpected = 'Yellow Bird';

// exhausted vote
const exhaustedVoteActual = { voter: 'Sally Ride', status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 }]};
const exhaustedVoteExpected = null;

// count votes
const countVotes = [
  { voter: 'Sally Ride',    status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 }]},
  { voter: 'Father Time',   status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 2 }]},
  { voter: 'Wilma Rudolph', status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 }]},
];
const countExpected = {"totalActiveBallots":3,"candidateResults":{"Yellow Bird":{"count":2,"percentage":67},"Chipotle Cholula":{"count":1,"percentage":33},"Tabasco":{"count":0,"percentage":0}}};

// count votes that result in a draw
const countDrawVotes = [
  { voter: 'Sally Ride',    status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 }]},
  { voter: 'Father Time',   status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 1 }]},
  { voter: 'Wilma Rudolph', status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 2 }]},
];
const countDrawExpected = {"totalActiveBallots":3,"candidateResults":{"Yellow Bird":{"count":1,"percentage":33},"Chipotle Cholula":{"count":1,"percentage":33},"Tabasco":{"count":1,"percentage":33}}};

// count first round of multi-round vote
const countMultiVotes = [
  { voter: 'Father Time',   ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Pablo Picasso', ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 1 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Wilma Rudolph', ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Jesse Owens',   ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'George Jetson', ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Jeff Beck',     ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Liz Cotton',    ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Phil Collins',  ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 1 }]},
  { voter: 'Sally Ride',    ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Hank Williams', ranks: [{ candidate: 'Yellow Bird', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 2 },{ candidate: 'Sriracha', rank: 1 }]},
  { voter: 'Pete Seeger',   ranks: [{ candidate: 'Yellow Bird', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 2 },{ candidate: 'Sriracha', rank: 1 }]},
  { voter: 'Deb Downer',    ranks: [{ candidate: 'Yellow Bird', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
];
const countMultiExpected = {"totalActiveBallots":12,"candidateResults":{"Yellow Bird":{"count":3,"percentage":25},"Chipotle Cholula":{"count":4,"percentage":33},"Tabasco":{"count":1,"percentage":8},"Sriracha":{"count":3,"percentage":25}}};

// tally multi-round vote
const tallyVotes = [
  { voter: 'Father Time',   ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Pablo Picasso', ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 1 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Wilma Rudolph', ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Jesse Owens',   ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'George Jetson', ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Jeff Beck',     ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Liz Cotton',    ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Phil Collins',  ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 1 }]},
  { voter: 'Sally Ride',    ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
  { voter: 'Hank Williams', ranks: [{ candidate: 'Yellow Bird', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 2 },{ candidate: 'Sriracha', rank: 1 }]},
  { voter: 'Pete Seeger',   ranks: [{ candidate: 'Yellow Bird', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 2 },{ candidate: 'Sriracha', rank: 1 }]},
  { voter: 'Deb Downer',    ranks: [{ candidate: 'Yellow Bird', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Sriracha', rank: 0 }]},
];
const tallyExpected = {"rounds":[{"roundNumber":1,"totalActiveBallots":12,"candidateResults":{"Yellow Bird":{"count":3,"percentage":25},"Chipotle Cholula":{"count":4,"percentage":33},"Tabasco":{"count":1,"percentage":8},"Sriracha":{"count":3,"percentage":25}}},{"roundNumber":2,"totalActiveBallots":11,"candidateResults":{"Yellow Bird":{"count":4,"percentage":36},"Chipotle Cholula":{"count":4,"percentage":36},"Tabasco":{"count":0,"percentage":0},"Sriracha":{"count":3,"percentage":27}}},{"roundNumber":3,"totalActiveBallots":11,"candidateResults":{"Yellow Bird":{"count":5,"percentage":45},"Chipotle Cholula":{"count":4,"percentage":36},"Tabasco":{"count":0,"percentage":0},"Sriracha":{"count":0,"percentage":0}}},{"roundNumber":4,"totalActiveBallots":9,"candidateResults":{"Yellow Bird":{"count":9,"percentage":100},"Chipotle Cholula":{"count":0,"percentage":0},"Tabasco":{"count":0,"percentage":0},"Sriracha":{"count":0,"percentage":0}}}],"winners":["Yellow Bird"],"candidates":[{"candidate":"Yellow Bird","status":"active","currentRoundVotes":9,"currentRoundPercentage":100,"counts":{"0":3,"1":3,"2":6}},{"candidate":"Chipotle Cholula","status":"eliminated","currentRoundVotes":0,"currentRoundPercentage":0,"counts":{"0":5,"1":4,"2":3}},{"candidate":"Tabasco","status":"eliminated","currentRoundVotes":0,"currentRoundPercentage":0,"counts":{"0":9,"1":1,"2":2}},{"candidate":"Sriracha","status":"eliminated","currentRoundVotes":0,"currentRoundPercentage":0,"counts":{"0":9,"1":3}}]};

function init() {
  const rcv = new RCV();

  // test map()
  addResult('rcv.map', rcv.map(candidatesActual), candidatesExpected);

  // test record()
  addResult('rcv.prep', rcv.prep(votesActual), votesExpected);

  // test allocate()
  rcv.candidates = structuredClone(candidatesExpected);

  addResult('rcv.allocate', rcv.allocate(voteActual, rcv.candidates), voteExpected);

  // test allocate() with exhausted ballot
  rcv.candidates = [{candidate:'Yellow Bird',status:RCV.STATUS_ELIMINATED},{candidate:'Chipotle Cholula',status:RCV.STATUS_ELIMINATED},{candidate:'Tabasco',status:RCV.STATUS_ACTIVE}];

  // ranked candidates eliminated, this ballot should return null and be marked exhausted
  addResult('rcv.allocate (exhausted)', rcv.allocate(exhaustedVoteActual, [{candidate:'Tabasco',status:RCV.STATUS_ACTIVE}]), exhaustedVoteExpected);
  addResult('rcv.allocate (exhausted status)', exhaustedVoteActual.status, RCV.STATUS_EXHAUSTED);

  // test tallying votes
  rcv.candidates = structuredClone(candidatesExpected);
  addResult('rcv.count', rcv.count(rcv.prep(countVotes)), countExpected);
  addResult('rcv.count (draw)', rcv.count(rcv.prep(countDrawVotes)), countDrawExpected);

  rcv.candidates = structuredClone(candidatesExtendedExpected);
  addResult('rcv.count (multi)', rcv.count(rcv.prep(countMultiVotes)), countMultiExpected);

  // test determining a winner
  addResult('rcv.tally', rcv.tally(
    candidatesExtendedActual,
    tallyVotes
  ), tallyExpected);

  document.getElementById('results').innerHTML = results.join('');
}

document.addEventListener('DOMContentLoaded', init);
