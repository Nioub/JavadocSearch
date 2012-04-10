Greasemonkey User Script: Javadoc Instant Search
================================================
By [Joël Thieffry], under [MIT licence].

This Greasemonkey script adds Instant Search function to Javadoc class frame.

![Screenshot][screenshot]

Features
--------
* Three search pattern modes (choose in the selector):
 * Eclipse: search around capitals, for exemple ``NPException`` will show ``NullPointerException``.
 * Simplified: ``?`` to replace one character, ``*`` to replace any number of characters, for example ``N???P*Exception``.
 * Regex: for real men, use a plain regex here, for example ``^.*C(li)*p+$``.
* Pattern background becomes:
 * white if no pattern;
 * blue if active pattern;
 * red if error in pattern.
* Button to erase pattern.

Download
--------
* on Userscripts.org: [userscripts.org][Userscripts]
* local: [javadocInstantSearch.user.js][current]

For use in Firefox, you need to install the [Greasemonkey plugin]. Unless the variable ``greasemonkey.fileIsGreaseable`` is set to true in your ``about:config``, the script won't run on local files.

In Chrome, userscripts support is native since Chrome v4.

Timeline
--------
* Released [0.3 (2012/04/10)][v0.3]
  * Added: support for old javadoc versions (see Implementation details).
  * Fixed: minor fixes (set focus on startup only if successfully installed; new filename pattern).

* Released [0.2 (2012/04/05)][v0.2]
  * Fixed: simplified pattern mode was wrong interpreting ``?`` as "0 or 1 any character" instead of "1 any character".
  * Added: 200-millisecond delay between input in pattern box and search run; this improves responsiveness while typing a pattern.
  * Added: clicking on erase, or selecting of regex type, will then set focus on the pattern box.

* Released [0.1 (2012/04/03)][v0.1]
  * Initial version, written minimal documentation, uploaded to [userscripts.org][Userscripts].

Rationale
---------
I've just learned Javascript and DOM, this script is my first attempt to use it. I wanted to implement the efficient Eclipse search inside Javadoc.

There were three goals:

 1. A userscript for [Greasemonkey plugin] : done.
 2. A doclet extension: can't be done because a new doclet can't reuse standard doclet mecanism.
 3. A tool to insert the userscript into generated Javadoc : to be done.

Later, I found KOSEKI Kengo's script named [Javadoc Incremental Search]. This code and webpage inspired me (for example the embedded erase icon comes directly from it), but my implementation is really different: my code is simpler because it does less things.

Implementation details
----------------------

* I've found two formats of generated javadoc:

  * The modern hierarchy:

            html
              head
              body
                h1 (title)
                  div class="indexContainer"
                    ul (one for interfaces, one for classes)
                      li a (for every item)
                      ...

  * The old hierarchy:

            HTML
              HEAD
              BODY
                FONT B (title)
                BR
                TABLE
                  TR TD FONT
                    A BR (for every item)

  Given a corresponding page filename, if we find a div whose class is ``indexContainer`` then the modern hierarchy is assumed, otherwise we choose the old hierarchy (which is supported from v0.3).

* The search component is a paragraph whose id is ``javadocInstantSearchElement``. This id is looked for to avoid reinstalling the search component.

* The search component is added as a first child of the element whose class is ``indexContainer``.

* The regex transformation from Eclipse model to full regex follows these steps:
 1. Neutralize all special caracters: ``regex.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")``.
 2. Prepend ``^.*`` and append ``.*$`` to allow search in any position.
 3. Prepend ``.*`` before all capital letters: ``regex.replace(/([A-Z])/g, "\.\*$1")``.

* All regexes are simplified using the following replaces:

        regex = regex.replace(/((.[\*\?])+)(?=\2)/g, "")  // Replace successive x* and x? to only one
                     .replace(/((.)\*\2\?)+/g, ".*")      // Replace x*x? with x*
                     .replace(/((.)\?\2\*)+/g, ".*")      // Replace x?x* with x*
                     .replace(/((.)\+\2\*)+/g, ".+")      // Replace x+x* with x+
                     .replace(/((.)\*\2\+)+/g, ".+")      // Replace x*x+ with x+
                     .replace(/((.[\*\?])+)(?=\2)/g, ""); // Replace successive x* and x? to only one

[screenshot]: javadocInstantSearchScreenshot.png
[current]: javadocInstantSearch.user.js
[v0.1]: javadocInstantSearch-0.1.user.js
[v0.2]: javadocInstantSearch-0.2.user.js
[v0.3]: javadocInstantSearch-0.3.user.js
[Joël Thieffry]: http://jo.zerezo.com
[MIT licence]: http://www.opensource.org/licenses/mit-license.php
[Userscripts]: http://userscripts.org/scripts/show/130074
[Greasemonkey plugin]: https://addons.mozilla.org/fr/firefox/addon/greasemonkey/
[Javadoc Incremental Search]: http://www.teria.com/~koseki/tools/gm/javadoc_isearch/index.html
