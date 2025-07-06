# RCV

RCV is a simple [ranked-choice voting](https://en.wikipedia.org/wiki/Ranked_voting) implementation using an [instant-runoff](https://en.wikipedia.org/wiki/Instant-runoff_voting) algorithm.

Instant runoff works as follows:

1. Count the number of 1st-ranked votes for each candidate
2. If any candidate reaches 50% of the votes, they win
3. If no candidate reaches 50%, eliminate the candidate with the lowest number of 1st-ranked votes
4. Allocate the ballots for the just-eliminated candidate to each ballot’s next-highest-ranked active candidate
5. GOTO 1

My motivation for building RCV was to better understand the dynamics of instant-runoff elections.

## Installation

At a command line:

### 1. Download source

```bash
git clone git@github.com:segdeha/rcv.git
```

### 2. Navigate to the project directory

```bash
cd rcv
```

### 3. Start a web server (Python 3 shown)

```bash
python -m http.server
```

### 4. Visit the page in a browser

```bash
open http://localhost:8000
```

## Usage

On [the application page](http://localhost:8000):

1. Add candidates to the ballot (or use the “Seed ballot” link to add sample candidates)
2. Drag candidates from the “Unranked” area to the “Ranked” area and order them in order of preference
3. Add a name for the person submitting the ballot (optional, if left blank a random name will be generated)
4. Click “Cast ballot”
