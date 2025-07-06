# rcv

A simple [ranked-choice voting](https://en.wikipedia.org/wiki/Ranked_voting) implementation using an [instant-runoff](https://en.wikipedia.org/wiki/Instant-runoff_voting) algorithm.

My motivation for building RCV was to better understand the dynamics of instant-runoff elections.

## installation

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

## usage

On [the application page](http://localhost:8000):

1. Add candidates to the ballot (or use the “Seed ballot” link to add sample candidates)
2. Drag candidates from the “Unranked” area to the “Ranked” area and order them in order of preference
3. Add a name for the person submitting the ballot (optional, if left blank a random name will be generated)
4. Click “Cast ballot”
