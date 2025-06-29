/* Random Names */

// responsibilities:
// - generate random, plausible-sounding people names

class RandomNames {
  // set a maximum number of tries to find a unique name to prevent locking up
  // the browser
  static maxAttempts = 500;

  constructor() {
    this.givens = ['alicia','antonio','ariel','arturo','aubrey','beatrice','caden','camila','cassidy','cecilia','damian','dario','delilah','devon','elias','esther','finn','gideon','greta','indigo','isaac','jasper','julian','juno','kaiya','leon','liam','luna','magnus','marcel','nina','oliver','olivia','owen','phoebe','quinn','rafael','reese','riley','roman','rowan','sabrina','sasha','silas','skylar','theo','vera','violet','willow','xavier'];
    this.families = ['abbott','adams','bailey','baker','bell','bennett','cameron','carter','clark','cole','cooper','cox','cruz','edwards','ellis','evans','flores','foster','gray','green','hall','hamilton','harper','hayes','henderson','hill','howard','hughes','irwin','kelly','king','knight','lawrence','lewis','long','lynch','myers','nelson','parker','reed','reynolds','richards','rivera','ross','russell','sanders','scott','simmons','stevens','wood'];
    this.maxNames = this.givens.length * this.families.length;
    this.generated = new Set();
  }
  rndFromArray(array) {
    const idx = Math.floor(Math.random() * array.length);
    return array[idx];
  }
  titleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  generateName() {
    const { families, givens, rndFromArray, titleCase } = this;
    const given = rndFromArray(givens);
    const family = rndFromArray(families);
    return `${titleCase(given)} ${titleCase(family)}`;
  }
  getName() {
    const { generated, maxAttempts, maxNames } = this;
    if (generated.size >= maxNames) {
      throw new Error('All possible unique names have been generated. Unable to create more.');
    }
    let name;
    let attempts = 0;
    do {
      if (attempts > maxAttempts) {
        throw new Error('Maximum number of attempts exceeded. Unable to proceed.');
      }
      name = this.generateName();
      attempts += 1;
    }
    while (generated.has(name));
    generated.add(name);
    return name;
  }
}

export { RandomNames };
