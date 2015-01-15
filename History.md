
1.1.1 / 2015-01-15
==================

 * bump debug to 2.1.1
 * added; spm support #17 [popomore](https://github.com/popomore)

1.1.0 / 2014-10-18
==================

 * added; support for `change <path>`
 * tests; add file showing Object.observe memory leak

1.0.0 / 2014-05-09
==================

 * changed; now requires node >= 0.11.13
 * changed; now mirrors the standard Object.observe event names (add, delete, etc)
 * changed; use Object.keys() instead of getOwnPropertyNames() [runningskull](https://github.com/runningskull)
 * added; deliverChanges() which forces pending changes to emit immediately
 * updated; mocha dev dependency
 * tests; updated
 * docs; updated

0.0.3 / 2013-11-15
==================

 * added; on("changed") #1

0.0.2 / 2013-10-21
==================

 * fix package dependencies

0.0.1 / 2013-10-21
==================

 * first release
