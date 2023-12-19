# Racket Huh

A webapp that renders and runs scheme/racket code in-browser.

## Getting Started

To install the project locally:

```sh
git clone https://github.com/jokeneversoke/racket-huh
cd racket-huh
pnpm install
```

Start a local PostgreSQL database.

Set up your environment appropriately:

```sh
cp .env.example .env
vim .env  # modify your postgresql endpoint
```

Finally, spin up your development server:

```sh
pnpm dev
```

## Mechanics

### Racket Execution

This project relies on [jcubic/lips](https://github.com/jcubic/lips)
to execute scheme code in the browser (as Racket internally also compiles
to Chez Scheme). Since the languages are not drastically different, at least
for pre-htdp2/asl rulesets (basic, basic+, isl, isl+), we do a simple
compilation/preprocess step in the browser, and pass the compiled
code to lips.

### Project Structure

The rest of the project is simple. We use typescript RPC for server client execution,
prisma as database ORM and postgresql as the database. Entries are
retrieved using dynamic pathnames.

A current hack exists in `src/lib/scheme.ts`, where we load lips into
the `globalThis` scope in a useHook due to incompatibilities of
the library with server rendering. I haven't found a better way to
load the library dynamically without it executing/being bundled on server
side.

## Why the Name?

I only called this racket-huh because of how predicates are pronounced by
NEU professors. A function called `is-prime?` would be pronounced as
`is prime huh` where `huh` stands for the unpronouncable `?`.

## Related

- [TRack](https://github.com/jokeneversoke/track) - Expermiental static-type checker for a superset of Racket
