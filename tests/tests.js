/* Unit tests for the RCV class */

import { RCV } from '../assets/rcv.js'

// function compareArrays(a1, a2) {
//   if (a1.length !== a2.length) {
//     return false;
//   }
//   const samePrimitives = true;
//   const sameObjects = null;
//   for (let i = 0; i < a1.length; i += 1) {
//     for (let j = 0; j < a2.length; j += 1) {
//       if (a1[i] !== a2[j]) {
//         samePrimitives = false;
//         if (typeof a1[i] === 'object' && typeof a2[j] === 'object') {
//           compareObjects(a1[i], a2[j]);
//         }
//       }
//     }
//   }
// }

// function compareObjects(o1, o2) {
//   const samePrimitives = true;
//   const k1 = Object.keys(o1);
//   const k2 = Object.keys(o2);
//   if (k1.length !== k2.length) {
//     sameObjects = false;
//   }
//   else {
//     for (let i = 0; i < k1.length; i += 1) {
//       for (let j = 0; j < k2.length; j += 1) {
//         if (o1[k1[i]] !== o2[k2[j]]) {
//           samePrimitives = false;
//         }
//       }
//     }
//   }
//   return samePrimitives;
// }

function deepCompare(a, b) {
  // 1. Strict equality check (handles primitives, null, undefined, and same object reference)
  if (a === b) return true;

  // 2. Handle null, non-objects, and different types early
  // If either is null or not an object, and they are not strictly equal (handled above), they are different.
  if (a === null || typeof a !== 'object' ||
      b === null || typeof b !== 'object') {
    return false;
  }

  // 3. Compare Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    // Arrays must have the same length
    if (a.length !== b.length) {
      return false;
    }
    // Recursively compare each element in order
    for (let i = 0; i < a.length; i++) {
      if (!deepCompare(a[i], b[i])) {
        return false; // If any element is not deeply equal, arrays are not equal
      }
    }
    return true; // All elements are deeply equal
  }

  // 4. Compare Objects (that are not arrays)
  if (a.constructor !== b.constructor) {
    // If they have different constructors (e.g., one is a Date, one is a plain object), they are different.
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // Objects must have the same number of keys
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Recursively compare values for each key
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    // Check if key exists in b and if their values are deeply equal
    if (!Object.prototype.hasOwnProperty.call(b, key) || !deepCompare(a[key], b[key])) {
      return false; // If a key is missing in b or its value is not deeply equal, objects are not equal
    }
  }

  return true; // All keys and their values are deeply equal
}

const results = [];

function addResult(func, actual, expected) {
  // compare
  const same = deepCompare(actual, expected);
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
    <td><code>${JSON.stringify(actual)}</code></td>
    <td><code>${JSON.stringify(expected)}</code></td>
  </tr>
</table>
`);
}

// test data

// candidates
const candidatesActual = ['Yellow Bird', 'Chipotle Cholula', 'Tabasco'];
const candidatesExpected = [{candidate:'Yellow Bird',status:RCV.STATUS_ACTIVE},{candidate:'Chipotle Cholula',status:RCV.STATUS_ACTIVE},{candidate:'Tabasco',status:RCV.STATUS_ACTIVE}];

// votes
// {
//   voter: '<string>',
//   status: RCV.STATUS_ACTIVE,
//   ranks: [ // sorted 1 through n, with 0s at the end
//     { candidate: '<string>', rank: <number> },
//   ],
// }
const votesActual   = [{ voter: 'Sally Ride', ranks: [{ candidate: 'Tabasco', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Yellow Bird', rank: 1 }]}];
const votesExpected = [{ voter: 'Sally Ride', status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 }]}];

// single vote
const voteActual = { voter: 'Sally Ride', status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 }]};
const voteExpected = 'Yellow Bird';

// exhausted vote
const exhaustedVoteActual = { voter: 'Sally Ride', status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 }]};
const exhaustedVoteExpected = null;

// countOccurrences
const arrayNums = [1, 2, 2, 3, 3, 3];
const arrayStrs = ['one', 'two', 'two', 'three', 'three', 'three'];
const arrayMixd = [1, 2, 2, 'three', 'three', 'three'];
const countsNums  = {1:1,2:2,3:3};
const countsStrs  = {'one':1,'two':2,'three':3};
const countsMixds = {1:1,2:2,'three':3};

// tally votes
const tallyVotes = [
  { voter: 'Sally Ride',    status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 }]},
  { voter: 'Father Time',   status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 2 }]},
  { voter: 'Wilma Rudolph', status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 0 }]},
];
const tallyExpected = {'Yellow Bird':2,'Chipotle Cholula':1};

// tally votes that result in a draw
const tallyDrawVotes = [
  { voter: 'Sally Ride',    status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 1 },{ candidate: 'Chipotle Cholula', rank: 2 },{ candidate: 'Tabasco', rank: 0 }]},
  { voter: 'Father Time',   status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 2 },{ candidate: 'Chipotle Cholula', rank: 0 },{ candidate: 'Tabasco', rank: 1 }]},
  { voter: 'Wilma Rudolph', status: RCV.STATUS_ACTIVE, ranks: [{ candidate: 'Yellow Bird', rank: 0 },{ candidate: 'Chipotle Cholula', rank: 1 },{ candidate: 'Tabasco', rank: 2 }]},
];
const tallyDrawExpected = {'Yellow Bird':1,'Tabasco':1,'Chipotle Cholula':1};

function init() {
  const rcv = new RCV();

  // test map()
  addResult('rcv.map', rcv.map(candidatesActual), candidatesExpected);

  // test record()
  addResult('rcv.prep', rcv.prep(votesActual), votesExpected);

  // test allocate()
  rcv.candidates = [{candidate:'Yellow Bird',status:RCV.STATUS_ACTIVE},{candidate:'Chipotle Cholula',status:RCV.STATUS_ACTIVE},{candidate:'Tabasco',status:RCV.STATUS_ACTIVE}];

  addResult('rcv.allocate', rcv.allocate(voteActual, rcv.candidates), voteExpected);

  // test allocate() with exhausted ballot
  rcv.candidates = [{candidate:'Yellow Bird',status:RCV.STATUS_ELIMINATED},{candidate:'Chipotle Cholula',status:RCV.STATUS_ELIMINATED},{candidate:'Tabasco',status:RCV.STATUS_ACTIVE}];

  // ranked candidates eliminated, this ballot should return null and be marked exhausted
  addResult('rcv.allocate (exhausted)', rcv.allocate(exhaustedVoteActual, [{candidate:'Tabasco',status:RCV.STATUS_ACTIVE}]), exhaustedVoteExpected);
  addResult('rcv.allocate (exhausted status)', exhaustedVoteActual.status, RCV.STATUS_EXHAUSTED);

  // test countOccurrences()
  addResult('rcv.countOccurrences (numbers)', rcv.countOccurrences(arrayNums), countsNums);
  addResult('rcv.countOccurrences (strings)', rcv.countOccurrences(arrayStrs), countsStrs);
  addResult('rcv.countOccurrences (mixed)', rcv.countOccurrences(arrayMixd), countsMixds);

  // test tallying votes
  rcv.candidates = [{candidate:'Yellow Bird',status:RCV.STATUS_ACTIVE},{candidate:'Chipotle Cholula',status:RCV.STATUS_ACTIVE},{candidate:'Tabasco',status:RCV.STATUS_ACTIVE}];

  addResult('rcv.count', rcv.count(rcv.prep(tallyVotes)), tallyExpected);

  addResult('rcv.count (multi)', rcv.count(rcv.prep(tallyDrawVotes)), tallyDrawExpected);

// console.log(JSON.stringify(structuredClone(rcv)))

  // test determining a winner

  document.body.innerHTML = results.join('');
}

document.addEventListener('DOMContentLoaded', init);
