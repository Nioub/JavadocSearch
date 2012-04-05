// ==UserScript==
// @name          Javadoc Instant Search
// @namespace     http://jo.zerezo.com/projects/
// @description   Instant search for Javadoc class names.
// @include       */allclasses-frame.html
// @include       */package-frame.html
// @include       */overview-frame.html
// ==/UserScript==
//
// version 0.2 (2012/04/05)
// author Joël THIEFFRY
// http://jo.zerezo.com/projects/javadocInstantSearch.html
// 
// This script is distributed under the MIT licence.
// http://www.opensource.org/licenses/mit-license.php
//

(function() {
	// ID of the container for Javadoc Instant Search
	var ELEMENT_ID = "javadocInstantSearchElement";

	// IDs for regex type selector
	var ECLIPSE_REGEX_ID = "Eclipse";
	var SIMPLIFIED_REGEX_ID = "Simplified";
	var PLAIN_REGEX_ID = "Plain";

	// Compatibility layer for adding events
	addEvent = function(element, eventname, funcname) {
		if (element.addEventListener) {
			element.addEventListener(eventname, funcname, false);
		} else if (element.attachEvent) {
			element.attachEvent("on" + eventname, funcname);
		}
	}

	// Create and insert the Javadoc Instant Search container
	install = function() {
		var indexContainer = document.getElementsByClassName("indexContainer");
		if (indexContainer) {
			indexContainer = indexContainer[0];

			var element = document.createElement("p")
			element.id = ELEMENT_ID;

			var textInput = document.createElement("input");
			textInput.type = "text";
			textInput.style.backgroundColor = "White";

			var eraseIcon = document.createElement("input");
			eraseIcon.type = "image";
			// Origin: http://www.teria.com/~koseki/tools/gm/javadoc_isearch/index.html
			eraseIcon.src = "data:image/gif;base64,R0lGODlhDQANAJEDAM%2FPz%2F%2F%2F%2F93d3UpihSH5BAEAAAMALAAAAAANAA0AAAIwnCegcpcg4nIw2sRGDZYnBAWiIHJQRZbec5XXEqnrmXIupMWdZGCXlAGhJg0h7lAAADs%3D";
			eraseIcon.alt = "erase search pattern"
			eraseIcon.style.marginLeft = "3px";
			eraseIcon.style.marginRight = "3px";

			var isOverview = document.URL.match("/overview-frame\.html$", "g") != null;
			var typeRegex = document.createElement("select");
			typeRegex.size = 1;
			typeRegex.multiple = false;
			if (!isOverview) {
				var typeRegexOptionEclipse = document.createElement("option");
				typeRegexOptionEclipse.value = ECLIPSE_REGEX_ID;
				typeRegexOptionEclipse.appendChild(document.createTextNode("Eclipse"));
				typeRegexOptionEclipse.selected = true;
				typeRegex.add(typeRegexOptionEclipse);
			}
			var typeRegexOptionSimplifiedRegex = document.createElement("option");
			typeRegexOptionSimplifiedRegex.value = SIMPLIFIED_REGEX_ID;
			typeRegexOptionSimplifiedRegex.appendChild(document.createTextNode("Simplified"));
			typeRegexOptionSimplifiedRegex.selected = isOverview;
			typeRegex.add(typeRegexOptionSimplifiedRegex);
			var typeRegexOptionPlainRegex = document.createElement("option");
			typeRegexOptionPlainRegex.value = PLAIN_REGEX_ID;
			typeRegexOptionPlainRegex.appendChild(document.createTextNode("Regex"));
			typeRegex.add(typeRegexOptionPlainRegex);

			element.appendChild(textInput);
			element.appendChild(eraseIcon);
			element.appendChild(typeRegex);
			indexContainer.insertBefore(element, indexContainer.firstChild);

			var searchTimeoutHandle = null;

			// Handle the timeout for text input
			setSearchTimeout = function() {
				if (searchTimeoutHandle) {
					clearTimeout(searchTimeoutHandle);
				}
				searchTimeoutHandle = setTimeout(runSearch, 200); // in milliseconds
			}

			// Run the search
			runSearch = function() {
				if (searchTimeoutHandle) {
					clearTimeout(searchTimeoutHandle);
					searchTimeoutHandle = null;
				}
				var acceptFunction = function() {
					return true;
				};
				if (textInput.value) {
					var regex = textInput.value;
					//console.log("input  = " + regex);
					var selectedTypeRegex = typeRegex.options[typeRegex.selectedIndex].value;
					switch (selectedTypeRegex) {
						case ECLIPSE_REGEX_ID:
							regex = "^.*" + regex.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1") +  ".*$";
							regex = regex.replace(/([A-Z])/g, "\.\*$1");
							break;
						case SIMPLIFIED_REGEX_ID:
							// Escape all except ? and *
							regex = regex.replace(/([.+^$[\]\\(){}|-])/g, "\\$1");
							regex = "^.*" + regex.replace(/(?:\*)+/g, ".*").replace(/(?:\?)+/g, ".") + ".*$";
							break;
					}
					//console.log("before = " + regex);
					regex = regex.replace(/((.[\*\?])+)(?=\2)/g, "")  // Replace successive x* and x? to only one
						         .replace(/((.)\*\2\?)+/g, ".*")      // Replace x*x? with x*
						         .replace(/((.)\?\2\*)+/g, ".*")      // Replace x?x* with x*
						         .replace(/((.)\+\2\*)+/g, ".+")      // Replace x+x* with x+
						         .replace(/((.)\*\2\+)+/g, ".+")      // Replace x*x+ with x+
						         .replace(/((.[\*\?])+)(?=\2)/g, ""); // Replace successive x* and x? to only one
					//console.log("after  = " + regex);
					try {
						var searchRegexp = new RegExp(regex, 'g');
					} catch (err) {
						textInput.style.backgroundColor = "Tomato";
						return;
					}
					textInput.style.backgroundColor = "Lavender";
					acceptFunction = function(name) {
						return searchRegexp.test(name);
					}
				} else {
					textInput.style.backgroundColor = "White";
				}

				var items = indexContainer.getElementsByTagName("li");
				for (var iItem = 0; iItem < items.length; iItem++) {
					var liItem = items[iItem];
					var itemText = liItem.firstChild.firstChild;
					if (itemText.tagName == "I") {
						itemText = itemText.firstChild;
					}
					itemText = itemText.nodeValue;
					liItem.style.display = acceptFunction(itemText) ? "" : "none";
				}
				
				textInput.focus();
			}

			// Change the type of regex
			changeRegexType = function() {
				if (textInput.value != "") {
					runSearch(); // will clear the timeout
				}
			}

			// Erase the current input pattern
			eraseSearch = function() {
				if (textInput.value != "") {
					textInput.value = "";
					runSearch(); // will clear the timeout
				}
			}

			addEvent(textInput, "input", setSearchTimeout);
			addEvent(typeRegex, "change", changeRegexType);
			addEvent(eraseIcon, "click", eraseSearch);
		}

		textInput.focus();
	}

	// Install the component when window has done loading, and the component is not already here
	if (!document.getElementById(ELEMENT_ID)) {
		install();
	}
})();
