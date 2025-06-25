// Calculate normalized Levenshtein distances
// https://en.wikipedia.org/wiki/Levenshtein_distance
class Levenshtein {
  constructor() {
    // nothing to do here, i think?
  }

  // Return the smallest of the three numbers passed in
  min3(x, y, z) {
    if (x <= y && x <= z) return x;
    if (y <= x && y <= z) return y;
    return z;
  }

  // Calculate the distance between two strings normalized as:
  // distance / length of the longer string
  calc(a, b) {
    let m = a.length;
    let n = b.length;

    // Make sure a.length >= b.length to use O(min(m,n)) space, whatever that is
    // IOW, swap ’em around if m is shorter than n
    if (m < n) {
      [b, a] = [a, b];
      [n, m] = [m, n];
    }

    const r = [[]];
    for (let c = 0; c < n + 1; ++c) {
      r[0][c] = c;
    }

    for (let i = 1; i < m + 1; ++i) {
      r[i] = []; r[i][0] = i;
      for (let j = 1; j < n + 1; ++j ) {
        const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        r[i][j] = this.min3(
          r[i-1][j] + 1,
          r[i][j-1] + 1,
          r[i-1][j-1] + cost
        );
      }
    }

    // Normalize based on the length of the longer string
    return r[r.length - 1][r[r.length - 1].length - 1] / Math.max(m, n);
  }
}

export { Levenshtein };
