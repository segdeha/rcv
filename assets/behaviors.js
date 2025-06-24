/* UI behaviors */

import { Levenshtein } from './levenshtein.js'
import { RCV } from './rcv.js'
import { VotingMachine } from './voting-machine.js'

class App {
  constructor() {
    // Levenshtein threshold under which 2 strings are considered duplicates
    this.THRSHLD = 0.2;

    // instantiate our tools
    this.lvn = new Levenshtein();
    this.rcv = new RCV();
    this.vm  = new VotingMachine();

    // stash some DOM elements
    this.dom = {
      addButton:    document.querySelector('#add button'),
      addConfirm:   document.getElementById('add-confirmation'),
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

  handleAddInputFocus(evt) {
    const { addConfirm } = this.dom;
    addConfirm.classList.remove('show');
  }

  handleAdd(evt) {
    evt.preventDefault(); // don't submit the form
    const { itemInput } = this.dom;
    const item = itemInput.value.trim();
    // check that the item is not a duplicate of existing items
    const { isDupe, isSimilar } = this.isDupe(item);
    if (isSimilar) {
      if (confirm(`${item} appears to be a duplicate of an existing item in the list. Add it anyway?`)) {
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

  handleVote(evt) {
    evt.preventDefault(); // don't submit the form
    // submit ballot
    this.vm.vote();
    // tally votes
    const tally = [];
    const html = this.buildResults(tally);
    this.render(html, this.dom.resultsList);
  }

  addEventListeners() {
    const { addButton, addForm, ballotButton, itemInput } = this.dom;
    addButton.addEventListener('click', this.handleAdd.bind(this));
    addForm.addEventListener('submit', this.handleAdd.bind(this));
    ballotButton.addEventListener('click', this.handleVote.bind(this));
    itemInput.addEventListener('focus', this.handleAddInputFocus.bind(this));
  }

  addItem(item) {
    const {itemInput, addConfirm } = this.dom;
    this.vm.add(item);
    itemInput.value = '';
    itemInput.blur();
    addConfirm.classList.add('show');
    const items = this.vm.list();
    const html = this.buildBallot(items);
    this.render(html, this.dom.itemsList);
  }

  // read vote values for each candidate from the DOM
  gatherBallot() {
    const selects = document.querySelectorAll('#ballot select');

  }

  // build some HTML based on an array of strings
  buildBallot(items) {
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

    // randomize the order to avoid bias
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);

    let options = '<option>Do Not Rank</option>';
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
  buildResults(tally) {
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
    const ths = '';
    const rows = '';
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
