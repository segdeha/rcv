/* UI behaviors */

import { DragAndDrop } from './drag-and-drop.js';
import { Levenshtein } from './levenshtein.js';
import { VotingMachine } from './voting-machine.js';
import { RandomNames } from './random-names.js';

class App {
  constructor() {
    // Levenshtein threshold under which 2 strings are considered duplicates
    this.THRSHLD = 0.25;

    // stash some DOM elements
    this.dom = {
      addButton:    document.querySelector('#add button'),
      addConfirm:   document.querySelector('#add-confirmation'),
      addForm:      document.querySelector('#add'),
      ballotButton: document.querySelector('#ballot button'),
      itemInput:    document.querySelector('#add input[name=item]'),
      itemsList:    document.querySelector('#unranked'),
      noItems:      document.querySelector('#no-items'),
      resultsList:  document.querySelector('#results'),
      voterInput:   document.querySelector('#ballot input[name=voter]'),
    };

    // instantiate our tools
    this.dnd = new DragAndDrop('ranked', 'unranked');
    this.lvn = new Levenshtein();
    this.vm  = new VotingMachine();
    this.rnd = new RandomNames();

    // connect it all up
    this.addEventListeners();
  }

  isDupe(item) {
    let isDupe = false;
    let isSimilar = false;
    item = item.toLowerCase();
    const candidates = this.vm.list().map(candidate => candidate.toLowerCase());
    for (let i = 0; i < candidates.length; i += 1) {
      // do the cheap comparison first
      if (candidates[i] === item) {
        isDupe = true;
      }
      else if (this.lvn.calc(item, candidates[i]) < this.THRSHLD) {
        isSimilar = true;
      }
    }
    return { isDupe, isSimilar };
  }

  // return the number of times the value shows up in the array
  countValue(array, value) {
    return array.reduce((accumulator, currentValue) => {
      return accumulator + (currentValue === value ? 1 : 0);
    }, 0);
  }

  // takes an array of any values
  hasDupes(array) {
    const uniques = new Set(array);
    return array.length !== uniques.size;
  }

  // takes an array of numbers, sorts them, eliminates dupes, then tests
  // whether the remaining numbers are sequential, starting at 0
  areSequential(array) {
    const uniques = new Set(array);
    const values = Array.from(uniques);
    values.sort((a, b) => {
      return a > b ? 1 : a < b ? -1 : 0;
    });
    // make sure there’s a 0 at the front of the array
    if (0 !== values[0]) {
      values.unshift(0);
    }
    let areSequential = true;
    for (let i = 0; i < values.length; i += 1) {
      if (i !== values[i]) {
        areSequential = false;
        break;
      }
    }
    return areSequential;
  }

  handleInputFocus(evt) {
    const { addConfirm } = this.dom;
    addConfirm.classList.remove('show');
  }

  handleAdd(evt) {
    evt.preventDefault(); // don't submit the form
    const { itemInput } = this.dom;
    const item = itemInput.value.trim();
    // check that the item is not empty
    if ('' === item) {
      alert('The item name cannot be blank.');
    }
    else {
      // check that the item is not a duplicate of existing items
      const { isDupe, isSimilar } = this.isDupe(item);
      if (isDupe) {
        alert(`${item} is an exact duplicate of an existing item in the list. Change it and try again.`);
      }
      else if (isSimilar) {
        if (confirm(`${item} is similar to an existing item in the list. Add it anyway?`)) {
          this.addItem(item);
        }
      }
      else {
        this.addItem(item);
      }
    }
  }

  handleVote(evt) {
    evt.preventDefault(); // don't submit the form
    const { resultsList, voterInput } = this.dom;

    // votes are associated with a name
    // submitting votes for an existing name overwrites their previous vote
    // if voter name is blank, generate one
    // use crypto.randomUUID() to generate unique IDs for voters in production
    const voter = voterInput.value || this.rnd.getName();

    // gather rankings for all of the candidates
    const votes = this.gatherBallot();

    // gather simple array of ranks for validation purposes
    const ranks = votes.map(vote => vote.rank).filter(vote => vote > 0);

    // if there are no items, alert the user
    if (0 === votes.length) {
      alert('Add at least one item to the ballot before casting your vote.');
    }
    else {
      // if there are items with identical ranks, alert the user
      if (this.hasDupes(ranks)) {
        alert('All items must have a unique rank.');
      }
      // if any ranks are not sequential, alert the user
      else if (!this.areSequential(ranks)) {
        alert('All ranks must be sequential, starting with 1.');
      }
      else {
        // submit ballot
        this.vm.vote(voter, votes);
        // tally votes
        const tally = this.vm.tally();
        const html = this.buildResults(tally);
        this.render(html, resultsList);
      }
    }
  }

  addEventListeners() {
    const { addButton, addConfirm, addForm, ballotButton, itemInput } = this.dom;
    addButton.addEventListener('click', this.handleAdd.bind(this));
    addForm.addEventListener('submit', this.handleAdd.bind(this));
    ballotButton.addEventListener('click', this.handleVote.bind(this));
    itemInput.addEventListener('focus', this.handleInputFocus.bind(this));
  }

  addItem(item) {
    const { addConfirm, itemInput, itemsList, noItems } = this.dom;
    this.vm.add(item);
    itemInput.value = '';
    itemInput.blur();
    noItems.style.display = 'none';
    addConfirm.classList.add('show');
    const items = this.vm.list();
    const html = this.buildBallot(items);
    this.render(html, itemsList);
  }

  // read vote values for each candidate from the DOM
  gatherBallot() {
    // grab elements on-click because they may’ve changed since the last click
    const ranked = document.querySelectorAll('#ranked .list-item, #unranked .list-item');
    const votes = [];
    ranked.forEach(item => {
      const name = item.dataset['item-name'];
      const value = item.querySelector('input[type="hidden"]').value;
      votes.push({ candidate: name, rank: +value }); // cast value as a number
    });
    return votes;
  }

  // build some HTML based on an array of strings
  // the html result from this function should be of the following form:
  // <li class="list-item" draggable data-item-name="Item A">
  //   <span>Item A</span>
  //   <input type="hidden" value="0">
  // </li>
  buildBallot(items) {
    // randomize the order to avoid bias
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    let html = '';
    shuffledItems.forEach(item => {
      html += `<li class="list-item" draggable="true" data-item-name="${item}">
                 <span>${item}</span>
                 <input type="hidden" value="0">
               </li>`;
    });
    return html;
  }

  // build some HTML based on the tallied voting results
  // - table: Candidate, %, 1sts, 2nds, 3rds, ...
  // - in order of 1st place votes, descending order
  // - item name, percentage of 1st place votes, number of 1st place votes, etc.
  //
  // the html result from this function should be of the following form:
  // <table>
  //   <tr>
  //     <th>Candidate</th>
  //     <th>%</th>
  //     <th>1sts</th>
  //     <th>2nds</th>
  //   </tr>
  //   <tr>
  //     <td>Chipotle Cholula</td>
  //     <td>43%</td>
  //     <td>71</td>
  //     <td>83</td>
  //   </tr>
  // <table>
  buildResults(tally) {
    const maxRank = tally.result.length;
    const ordinals = ['1st', '2nd', '3rd'];

    // find percentage of 1sts for each candidate
    let totalFirsts = 0;
    tally.result.forEach(vote => {
      vote.firsts = this.countValue(vote.ranks, 1);
      totalFirsts += vote.firsts;
    });
    tally.result.forEach(vote => {
      vote.pctFirsts = Math.round(vote.firsts / totalFirsts * 100);
    });

    // build column headers
    let ths = '';
    for (let i = 0; i < maxRank; i += 1) {
      if ('undefined' !== typeof ordinals[i]) {
        ths += `<th>${ordinals[i]}</th>`;
      }
      else {
        ths += `<th>${ i + 1 }th</th>`;
      }
    }
    ths += '<th>DNR</th>';

    // build rows
    let trs = '';
    tally.result.forEach(vote => {
      const tds = [`<td>${vote.candidate}</td>`];
      // percentage of 1sts
      const winner = vote.pctFirsts >= 50 ? ' class="winner"' : ''
      tds.push(`<td${winner}>${vote.pctFirsts}</td>`);
      for (let i = 1; i <= maxRank; i += 1) {
        tds.push(`<td>${this.countValue(vote.ranks, i)}</td>`);
      }
      // did not ranks come last
      tds.push(`<td>${this.countValue(vote.ranks, 0)}</td>`);
      trs += `<tr>${tds.join('')}</tr>`;
    });

    return `
      <table>
        <tr>
          <th>Candidate</th>
          <th>%</th>
          ${ths}
        </tr>
        ${trs}
      </table>
      <p><strong>Voters:</strong> ${tally.voters.join(', ')}</p>
    `
  }

  render(html, el) {
    if (html) {
      el.innerHTML = html;
    }
  }
}

function init() {
  const app = new App();
}

document.addEventListener('DOMContentLoaded', init);
