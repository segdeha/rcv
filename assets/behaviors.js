/* UI behaviors */

import { Levenshtein } from './levenshtein.js'
import { VotingMachine } from './voting-machine.js'
import { RandomNames } from './random-names.js'

class App {
  constructor() {
    // Levenshtein threshold under which 2 strings are considered duplicates
    this.THRSHLD = 0.25;

    // instantiate our tools
    this.lvn = new Levenshtein();
    this.vm  = new VotingMachine();
    this.rnd = new RandomNames();

    // stash some DOM elements
    this.dom = {
      addButton:    document.querySelector('#add button'),
      addConfirm:   document.querySelector('#add-confirmation'),
      addForm:      document.querySelector('#add'),
      ballotButton: document.querySelector('#ballot button'),
      itemInput:    document.querySelector('input[name=item]'),
      itemsList:    document.querySelector('#items'),
      resultsList:  document.querySelector('#results'),
    };

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

  // takes an array of objects where one of the properties is named `value`
  hasDupes(array) {
    const seen = new Set();
    for (let i = 0; i < array.length; i += 1) {
      const { value } = array[i];
      if (seen.has(value)) {
        return true;
      }
      // exclude "Do Not Rank"
      else if (value > 0) {
        seen.add(value);
      }
    }
    return false;
  }

  handleInputFocus(evt) {
    this.dom.addConfirm.classList.remove('show');
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
      if (isSimilar) {
        if (confirm(`${item} is similar to an existing item in the list. Add it anyway?`)) {
          this.addItem(item);
        }
      }
      else if (isDupe) {
        alert(`${item} is an exact duplicate of an existing item in the list. Change it and try again.`);
      }
      else {
        this.addItem(item);
      }
    }
  }

  handleVote(evt) {
    evt.preventDefault(); // don't submit the form
    const { resultsList } = this.dom;
    // gather rankings for all of the candidates
    const votes = this.gatherBallot();
    // if there are no items, alert the user
    if (0 === votes.length) {
      alert('Add at least one item to the ballot before casting your vote.');
    }
    else {
      // if there are items with identical ranks, alert the user
      if (this.hasDupes(votes)) {
        alert('All items must have a unique rank.');
      }
      else {
        // submit ballot
        // votes are associated with a name
        // submitting votes for an existing name overwrites their previous vote
        const name = this.rnd.getName();
        this.vm.vote(name, votes);
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
    const { addConfirm, itemInput, itemsList } = this.dom;
    this.vm.add(item);
    itemInput.value = '';
    itemInput.blur();
    addConfirm.classList.add('show');
    const items = this.vm.list();
    const html = this.buildBallot(items);
    this.render(html, itemsList);
  }

  // read vote values for each candidate from the DOM
  gatherBallot() {
    // grab elements on-click because they may’ve changed since the last click
    const selects = document.querySelectorAll('#ballot select');
    const votes = [];
    selects.forEach(select => {
      const { name, value } = select;
      votes.push({ name, value: +value }); // cast value as a number
    });
    return votes;
  }

  // build some HTML based on an array of strings
  // the html result from this function should be of the following form:
  // <label>
  //   My Item 1
  //   <select name="My Item 1">
  //     <option>Do Not Rank</option>
  //     <option>1</option>
  //     <option>2</option>
  //   <select>
  // </label>
  // <label>
  //   My Item 2
  //   <select name="My Item 2">
  //     <option>Do Not Rank</option>
  //     <option>1</option>
  //     <option>2</option>
  //   <select>
  // </label>
  buildBallot(items) {
    // randomize the order to avoid bias
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    let options = '<option value="0">Do Not Rank</option>';
    for (let i = 0; i < shuffledItems.length; i += 1) {
      options += `<option>${i + 1}</option>`;
    }
    let html = '';
    for (let i = 0; i < shuffledItems.length; i += 1) {
      html += `<label>${shuffledItems[i]} <select name="${shuffledItems[i]}">${options}</select></label>`;
    }
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
    const ordinals = ['1st', '2nd', '3rd'];
    let ths = '';
    let rows = '';
    // build column headers
    for (let i = 0; i < tally.voters.length; i += 1) {
      if ('undefined' !== typeof ordinals[i]) {
        ths += `<th>${ordinals[i]}</th>`;
      }
      else {
        ths += `<th>${ i + 1 }th</th>`;
      }
    }
    // build rows
    for (let i = 0; i < tally.length; i += 1) {}
    return `
      <table>
        <tr>
          <th>Candidate</th>
          <th>%</th>
          ${ths}
        </tr>
        ${rows}
      </table>
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
