/*global
$, dSearch, designerUrl, canAccessDesigner, dictionary
*/
/*jslint devel: true */

/*jshint esversion: 6 */
'use strict';
/*
* TODO:
*  parse out value labels
*  Does output need to be properly escaped? (looking for double quotes).
*  When searching for text all returned values are strong, when only search criteria should be
*     strong when displaying ALL Information
*
* bug: Search for [ and field type only Yes/No.  Returns calculated field in pid=33.  It shouldn't
* If someone want a list of all SQL fields, how would they get that list?
*
* TODO: hide the event tab if it is not longitudinal or there are zero events
* TODO: Add select page options to select all calculated fields, custom alignments etc.  People may want a list of those things.
*  TODO: API token page has a nice Event table which has three columns: Unique Event Name, Event Name, Arm  REcreate table.
* */

dSearch.debugger = true;

dSearch.initialize = function () {
    dSearch.dictionaryFields = [
        "field_name",
        "form_name",
        "section_header",
        "field_type",
        "field_label",
        "field_note",
        "select_choices_or_calculations",
        "text_validation_type_or_show_slider_number",
        "text_validation_min",
        "text_validation_max",
        "identifier",
        "matrix_ranking",
        "matrix_group_name",
        "question_number",
        "field_annotation",
        "branching_logic",
        "required_field",
        "custom_alignment"
    ];

    dSearch.redcap_field_types = [
        "text",
        "notes",
        "calc",
        "dropdown",
        "radio",
        "checkbox",
        "yesno",
        "truefalse",
        "file",
        "slider",
        "descriptive",
        "sql"
    ];

    dSearch.instruments = dSearch.getFormNames();
    dSearch.fieldNames = dSearch.getFieldNames();

    dSearch.resultsDiv = document.getElementById("results");
    dSearch.selectResultsDiv = document.getElementById("selectResults");
    dSearch.feedbackDiv = document.getElementById("feedback");
    dSearch.scrollToTopBtn = document.getElementById("scrollToTop");

    dSearch.searchCategories = [];
    dSearch.searchFieldTypes = [];

    dSearch.fieldValues = {};

    dSearch.addMapOptionsToSelect("instrument", dSearch.instrumentNames);

    if (dSearch.isLongitudinal) {
        dSearch.addMapOptionsToSelect("instrumentEvent", dSearch.instrumentNames);
        dSearch.addMapOptionsToSelect("eventSelect", dSearch.eventLabels);
    }
    // dSearch.addOptionsToSelect("instrument", dSearch.instrumentNames);
    dSearch.addOptionsToSelect("fieldNames", dSearch.fieldNames);

    dSearch.dictionaryUC = dSearch.dictionary.map(dSearch.toUpper);

    dSearch.handleEnter();
    document.getElementById("searchString").focus();

    if (!dSearch.isLongitudinal) {
        document.getElementById("nav-events-tab").style.display = "none";
    } else {
        dSearch.eventListDiv = document.getElementById("eventList");
        dSearch.formsForEventDiv = document.getElementById("formsForEvent");
        dSearch.eventTableByEventsDiv = document.getElementById("eventTableByEvent");
        dSearch.eventTableByInstrumentDiv = document.getElementById("eventTableByInstrument");
        dSearch.setEventTableByEvent();
        dSearch.setEventTableByInstrument();
        dSearch.eventTableByEventsDiv.innerHTML = dSearch.eventTableByEvent;
        dSearch.eventTableByInstrumentDiv.innerHTML = dSearch.eventTableByInstrument;
    }
};


/**
 * Searches all meta data in a field (dictionary row) to find matches.
 * @param dictionaryRow
 * @returns {boolean}  true = matches any criteria specified.  false = does not match anything.
 */
dSearch.matchCriteria = function (dictionaryRow) {
    let meetsCriteria = false;
    const dictionaryRowValues = Object.values(dictionaryRow);

    /*
     remove empty values from being cycled through later.
    */
    const filteredDictionaryRowValues = dictionaryRowValues.filter(function (el) {
        return el !== "";
    });

    let matchProperties = [];
    dSearch.searchCategories.forEach(function (property) {
        matchProperties[property] = false;
    });

    if (!dSearch.searchFieldTypes.includes(dictionaryRow.field_type)) {
        console.log(dSearch.searchFieldTypes);
        console.log("got a match: " + dictionaryRow.field_type);
        return false;
    }

    // console.log(dictionaryRow.field_name);

    for (let property of dSearch.searchCategories) {

        let valueOfField = dictionaryRow[property].valueOf();
        /* Required fields, Identifiers, Matrix Ranking are included properties only when they are checked by the user
          Only then must they meet criteria below.  If the property is not included in Search Fields than the user
          did not check it and thus will be checked here for the value Y.
         */

        if (property === "required_field" && valueOfField === "y") {
            matchProperties[property] = true;
        } else if (property === "identifier" && valueOfField === "y") {
            matchProperties[property] = true;
        } else if (property === "matrix_ranking" && valueOfField === "y") {
            matchProperties[property] = true;
        }

        if (dSearch.upperCase === 1) {
            valueOfField = valueOfField.toUpperCase();
        }

        /* search for text if search string was submitted */
        if (dSearch.searchText.length > 0) {
            if (dSearch.fuzzy === 0) {
                if (valueOfField === dSearch.searchText) {
                    matchProperties[property] = true;
                    meetsCriteria = true;
                }
            } else {
                if (valueOfField.includes(dSearch.searchText)) {
                    matchProperties[property] = true;
                    meetsCriteria = true;
                }
            }
        }
    }
    /* if the search string is zero than return true is the user searched for required, identifier, or matrix ranking
    * Example: Search for all required fields does not need search text.
    * */
    if (dSearch.searchText.length === 0) {
        meetsCriteria = Object.values(matchProperties).some(Boolean);
    }
    return meetsCriteria;
};

/**
 * Controller for search form submission.
 */
dSearch.submitted = function () {
    dSearch.setAllFieldTypes();
    dSearch.resultsDiv.innerHTML = "";
    let feedBack = dSearch.today();
    console.log(feedBack);
    dSearch.feedbackDiv.innerHTML = feedBack;

    dSearch.fuzzy = Number(document.querySelector("input[name=\"fuzzy\"]:checked").value);
    dSearch.upperCase = Number(document.querySelector("input[name=\"upperCase\"]:checked").value);
    dSearch.searchText = document.getElementById("searchString").value.trim();
    dSearch.setLimitToSelection();

    /*
    Limit the number for fields searched to just the user selected fields.
     */
    dSearch.setSelectedCategories();
    if (!Array.isArray(dSearch.searchCategories) || !dSearch.searchCategories.length) {
        dSearch.feedbackDiv.style.display = "block";
        dSearch.feedbackDiv.innerHTML = "Select a category to search";
        return;
    }
    dSearch.feedbackDiv.style.display = "block";
    dSearch.feedbackDiv.innerHTML = "Results generated: " + feedBack;

    // dSearch.feedbackDiv.style.display = "none";
    /*
    Limit the number for fields TYPES to just the selected fields..
     */
    dSearch.setSearchFieldTypes();
    console.log(dSearch.setSearchFieldTypes);

    if (dSearch.upperCase === 1) {
        dSearch.searchText = dSearch.searchText.toUpperCase();
    }
    if (dSearch.debugger) {
        dSearch.debugDictionarySearch();
    }

    dSearch.results = dSearch.dictionary.filter(dSearch.matchCriteria);

    if (Array.isArray(dSearch.results) && dSearch.results.length === 0) {
        dSearch.resultsDiv.innerHTML = "The dictionary was searched and nothing was found.";
    } else {
        dSearch.showResults();
    }
};

dSearch.setLimitToSelection = function () {
    dSearch.limitToSelection = Number(document.querySelector("input[name=\"all_var_info\"]:checked").value);
};

/**
 * Render the results for submitting a search.
 */
dSearch.showResults = function () {
    dSearch.resultsDisplay = "<div>";

    for (let result = 0; result < dSearch.results.length; result++) {
        let fieldMetaDisplay = dSearch.RenderFieldMeta(dSearch.results[result]);
        dSearch.resultsDisplay += "<div style='border:1px solid grey;padding:20px;'>" +
            fieldMetaDisplay +
            "</div>";
    }

    dSearch.resultsDisplay += "</div>";
    dSearch.resultsDiv.innerHTML = dSearch.resultsDisplay;
};

/**
 * @param fieldMeta
 */
dSearch.RenderFieldMeta = function (fieldMeta) {
    let fieldMetaDisplay = "";
    for (let propertyName in fieldMeta) {
        if (dSearch.limitToSelection === 1) {
            if (dSearch.searchCategories.includes(propertyName) === false &&
                propertyName !== "field_name" &&
                propertyName !== "form_name") {
                continue;
            }
        }

        if (fieldMeta.hasOwnProperty(propertyName)) {
            if (fieldMeta[propertyName] !== "") {
                let propertyValue = fieldMeta[propertyName].split(dSearch.searchText).join("<span class='dSearch-bolder'>" + dSearch.searchText + "</span>");

                let fieldCategoryLabel = propertyName.replace(/_/g, " ");
                fieldCategoryLabel = fieldCategoryLabel.charAt(0).toUpperCase() + fieldCategoryLabel.slice(1);

                if (propertyName === "field_name") {
                    propertyValue = dSearch.RenderFieldName(fieldMeta.field_name, fieldMeta.form_name);
                } else if (propertyName === "form_name") {
                    propertyValue = dSearch.renderFormName(fieldMeta.form_name);
                }
                fieldMetaDisplay = fieldMetaDisplay + "<p><strong>" + fieldCategoryLabel + "</strong>: " + propertyValue + "</p>";
            }
        }
    }

    return fieldMetaDisplay;
};

dSearch.RenderFieldName = function (fieldName, InstrumentShortName) {
    let display = "";
    if (dSearch.canAccessDesigner) {
        display += "<a target=\"blank\" href=\"" +
            dSearch.designerUrl +
            "&page=" + InstrumentShortName + "&field=" + fieldName + "\">";
    }

    display += "<strong>" + fieldName + "</strong>";
    if (dSearch.canAccessDesigner) {
        display += "</a>";
    }
    return display;
};


dSearch.renderFormName = function (InstrumentShortName) {
    let display = "";
    if (dSearch.canAccessDesigner) {
        display += "<a target=\"blank\" href=\"" +
            dSearch.designerUrl +
            "&page=" + InstrumentShortName + "\">";
    }

    display += dSearch.instrumentNames.get(InstrumentShortName);

    if (dSearch.canAccessDesigner) {
        display += "</a>";
    }
    return display;
};

/**
 * If all field types is checked then hide the field type categories.
 */
dSearch.toggleFieldTypesVisibility = function () {
    if (document.getElementById("all_field_types").checked) {
        $(".field-type").hide("medium");
    } else {
        $(".field-type").show("slow");
    }
};

/**
 * toggle checkmarks for all categories
 */
dSearch.toggleAllCategories = function () {
    let isChecked = document.getElementById("all_categories").checked;
    dSearch.checkAllCategories(isChecked);
};

/**
 *  if any category is checked, uncheck all_categories
 *
 */
dSearch.checkAllCategories = function (action) {
    dSearch.dictionaryFields.forEach(function (value, key, map) {
        dSearch.syncToggleAllCategories(action, value);
    });
};

dSearch.syncToggleAllCategories = function (action, value) {
    document.getElementById(value).checked = action;
};


/**
 * Get unique array of instrument names
 * @returns {*[]}
 */
dSearch.getFormNames = function () {
    let forms = [];
    dSearch.dictionary.forEach(function (field) {
        forms.push(field.form_name);
    });
    return dSearch.removeDuplicates(forms);
};

/**
 * Get unique array of field names.
 * @returns {*[]}
 */
dSearch.getFieldNames = function () {
    let fields = [];
    dSearch.dictionary.forEach(function (field) {
        fields.push(field.field_name);
    });
    return dSearch.removeDuplicates(fields);
};

/**
 * Add array of options where both values and text are the same value to a select element.
 * @param selectID
 * @param options
 */
dSearch.addOptionsToSelect = function (selectID, options) {
    options.forEach(function (item) {
        let option = document.createElement("option");
        option.text = item;
        option.value = item;
        document.getElementById(selectID).add(option);
    });
};

/**
 * Add MAP of options where both values and text are the same value to a select element.
 * @param selectID
 * @param options | Javascript Map of options
 */
dSearch.addMapOptionsToSelect = function (selectID, options) {
    options.forEach(function (long, short, i) {
        let option = document.createElement("option");
        option.text = long;
        option.value = short;
        document.getElementById(selectID).add(option);
    });
};

/**
 * Removes all field names from fieldNames choice
 *
 */
dSearch.removeFieldNames = function () {
    const options = document.querySelectorAll("#fieldNames option");
    options.forEach(option => option.remove());
};

/**
 * Removes all field names from fieldNames choice and adds all fields in the selected single instrument.
 * @param instrumentName
 */
dSearch.addFieldNamesToSelectByFormName = function (instrumentName) {
    dSearch.removeFieldNames();

    let optionAll = document.createElement("option");
    optionAll.text = "All";
    optionAll.value = "all";
    let fieldNamesSelect = document.getElementById("fieldNames");
    fieldNamesSelect.add(optionAll);
    dSearch.dictionary.forEach(function (field) {
        if (field.form_name === instrumentName || instrumentName === "any") {
            let option = document.createElement("option");
            option.text = field.field_name;
            option.value = field.field_name;
            fieldNamesSelect.add(option);
        }
    });
};


/**
 * Remove duplicates from an array.
 * @param data
 * @returns {any[]}
 */
dSearch.removeDuplicates = function (data) {
    return [...new Set(data)];
};

dSearch.selectInstrument = function (instrumentName) {
    dSearch.feedbackDiv.style.display = "none";
    if (dSearch.isLongitudinal) {
        dSearch.eventListDiv.innerHTML = dSearch.displayFormEvents(instrumentName);
    }
    dSearch.displayInstrument(instrumentName);
    dSearch.addFieldNamesToSelectByFormName(instrumentName);
};


dSearch.displayInstrument = function (instrumentName) {
    dSearch.selectedResults = "";
    dSearch.dictionary.forEach(function (field) {
        if (field.form_name === instrumentName) {
            dSearch.selectedResults += "<div class='row mt-1'>" +
                "<div class='col shadow p-3 mb-5 bg-white rounded'>" +
                dSearch.RenderFieldMeta(field) +
                "</div></div>";
        }
    });
    dSearch.selectResultsDiv.innerHTML = dSearch.selectedResults;
};


// todo return the event grid instead of set innerHTML
dSearch.displayFormEvents = function (instrumentName) {
    let events = dSearch.getEventsForInstrument(instrumentName);
    let eventsHTML = "";
    // Must be a valid instrument name
    if (!dSearch.instrumentNames.get(instrumentName)) {
        dSearch.eventListDiv.innerHTML = eventsHTML;
        return;
    }
    let eventsCountLabel = (events.length > 1) ? events.length + " events" : " event";
    if (0 === events.length) {
        eventsHTML = "There are no events for " + dSearch.instrumentNames.get(instrumentName);
    } else {
        eventsHTML = "<p><strong>" + dSearch.instrumentNames.get(instrumentName) +
            " is available on the following " + eventsCountLabel + ":</strong></p>" +
            "<ul>";
        for (let i = 0; i < events.length; i++) {
            eventsHTML += "<li>";
            let eventLabel = dSearch.getEventLabel(parseInt(events[i]));
            if (eventLabel) {
                eventsHTML += eventLabel;
            } else {
                eventsHTML += events[i];
            }
            eventsHTML += "</li>";
        }
        eventsHTML += "<ul>";
    }
    return eventsHTML;
};

/* when all you know is the field name to display
   Tricky because "all" is available if an instrument is selected.
 */

dSearch.displayField = function (fieldName) {
    dSearch.selectResultsDiv.innerHTML = "";
    if (fieldName === "all") {
        dSearch.displayInstrument(document.getElementById("instrument").value);
    } else {
        dSearch.selectResultsDiv.innerHTML = dSearch.getFieldDisplayByFieldName(fieldName);
    }
};

dSearch.getFieldDisplayByFieldName = function (fieldName) {
    let result = "";
    for (let i = 0; i < dSearch.dictionary.length; i++) {
        if (fieldName === dSearch.dictionary[i].field_name) {
            result += dSearch.RenderFieldMeta(dSearch.dictionary[i]);
            break;
        }
    }
    return result;
};

/**
 * Debug info.
 */
dSearch.debugDictionarySearch = function () {
    console.clear();
    console.log("searchText=" + dSearch.searchText);
    console.log("upper=" + dSearch.upperCase);
    console.log("fuzzy=" + dSearch.fuzzy);
    console.log("limit to selection=" + dSearch.limitToSelection);
    console.log("The Following Field Types:");
    console.log(dSearch.searchFieldTypes);
};

/**
 *  if a single field type is checked, uncheck all_field_types
 *
 */
dSearch.setAllFieldTypes = function () {
    let oneIsChecked = dSearch.redcap_field_types.some(dSearch.isFieldTypeSelected);
    document.getElementById("all_field_types").checked = !oneIsChecked;
};

/**
 *
 * @param element, Id of HTML element to see if it is checked or not
 * @returns boolean, true=checked, False if not checked.
 */
dSearch.isFieldTypeSelected = function (element) {
    return document.getElementById(element).checked;
};

/**
 *
 * @param str
 * @returns {Map<any, any>}
 */
dSearch.getValuesAndLabels = function (str) {
    let vallabs = str.split("|");
    let valuesAndLabels = new Map();
    for (let i = 0; i < vallabs.length; i++) {
        let commaLoc = vallabs[i].indexOf(",");
        let val = vallabs[i].substring(0, commaLoc).trim();
        let lab = vallabs[i].substring(commaLoc + 1).trim();
        valuesAndLabels.set(val, lab);
    }
    return valuesAndLabels;
};

dSearch.toUpper = function (item) {
    return item.toUpperCase;
};

/**
 * Sets array dSearch.searchCategories
 * an empty array value is OK.
 */
dSearch.setSelectedCategories = function () {
    dSearch.searchCategories = [];
    dSearch.dictionaryFields.forEach(function (item) {
        let element = document.getElementById(item);
        if (typeof (element) !== "undefined" && element !== null) {
            if (element.checked === true) {
                dSearch.searchCategories.push(item);
            }
        }
    });
};

/**
 * Sets array dSearch.searchFieldTypes
 * if nothing is selected default of all_field_types is selected and used as value.
 */

dSearch.setSearchFieldTypes = function () {
    dSearch.searchFieldTypes = [];
    if (document.getElementById("all_field_types").checked) {
        dSearch.searchFieldTypes = dSearch.redcap_field_types;
    } else {
        dSearch.redcap_field_types.forEach(function (item) {
            let element = document.getElementById(item);
            if (typeof (element) !== "undefined" && element !== null) {
                if (element.checked === true) {
                    dSearch.searchFieldTypes.push(item);
                }
            }
        });
    }

    if (!dSearch.searchCategories.length) {
        document.getElementById("all_field_types").checked = true;
        dSearch.searchFieldTypes = ["all_field_types"];
    }
};

// handle enter plain javascript
dSearch.handleEnter = function (e) {
    var input = document.getElementById("searchString");
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            dSearch.submitted();
        }
    });
};

// todo call this function again to get the events on the event page.

dSearch.getEventsForInstrument = function (instrumentShortName) {
    let eventIds = [];
    let eventGrid = dSearch.eventGrid;
    for (let event in eventGrid) {
        if (!eventGrid.hasOwnProperty(event)) {
            continue;
        }
        let instruments = eventGrid[event];
        // console.log(instruments);
        for (let instrument in instruments) {
            // skip loop if the property is from prototype
            if (!instruments.hasOwnProperty(instrument)) {
                continue;
            }
            if (instrumentShortName === instrument) {
                if (instruments[instrument] === true) {
                    eventIds.push(event);
                }
            }
        }
    }
    return eventIds;
};

/**
 * @param eventId integer must be passed as an integer not a string.
 * returns event short name
 */
dSearch.getEventName = function (eventId) {
    eventId = eventId * 1;
    if (dSearch.eventNames.get(eventId)) {
        return dSearch.eventNames.get(eventId);
    } else {
        return null;
    }
};

/**
 * @param eventId integer must be passed as an integer not a string.
 * returns event long name (label) which is human readable.
 */
dSearch.getEventLabel = function (eventId) {
    if (dSearch.eventLabels.get(eventId)) {
        return dSearch.eventLabels.get(eventId);
    } else {
        return null;
    }
};

// Returns human readable today as Month Day Year
dSearch.today = function () {
    let today = new Date();
    const month = today.toLocaleString("default", {month: "long"});
    let prettyDate = month + " " + today.getDate() + ", " + today.getFullYear();
    return prettyDate;
};

dSearch.scroll = function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        dSearch.scrollToTopBtn.style.display = "block";
    }
};

dSearch.scrollToTop = function () {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
};


dSearch.renderFormsForEvent = function (eventNumber) {
    let instruments = dSearch.eventGrid[eventNumber];
    if (instruments.length === 0) {
        return "There are no instruments for that event.";
    }
    eventNumber = eventNumber * 1;
    let eventLabel = dSearch.getEventLabel(eventNumber);
    let display = "<h3>" + eventLabel +
        " has the following instruments.</h3><ul>";
    for (let formName in instruments) {
        if (instruments[formName]) {
            display += "<li>" + dSearch.instrumentNames.get(formName) + "</li>";
        }
    }
    display += "</ul>";
    dSearch.formsForEventDiv.innerHTML = display;
};

dSearch.renderEventsForForm = function (shortFormName) {
    let display = dSearch.displayFormEvents(shortFormName);
    dSearch.formsForEventDiv.innerHTML = display;
};


dSearch.setEventTableByEvent = function setEventTableByEvent() {
    let table = "<h3>Event Table <em>(Events are rows)</em></h3>" +
        "<table class='table table-bordered table-striped table-hover table-sm table-responsive event-table'>" +
        "<tr class='table-warning'><th></th>";
    for (let [shortName, longName] of dSearch.instrumentNames) {
        table += "<th data-form-name='" + shortName + "'>" + longName + "</th>";
    }
    table += "</tr>";

    for (let eventId in dSearch.eventGrid) {
        if (!dSearch.eventGrid.hasOwnProperty(eventId)) {
            continue;
        }
        table += "<tr><td>" + dSearch.getEventLabel(parseInt(eventId)) + "</td>";
        let instruments = dSearch.eventGrid[eventId];

        for (let name in instruments) {
            table += "<td>";
            if (instruments[name] === true) {
                table += "&#10003;";
            }
            table += "</td>";
        }
        table += "</tr>";
    }
    table += "</table>";

    dSearch.eventTableByEvent = table;
};

dSearch.setEventTableByInstrument = function () {
    let table = "<h3>Event Table <em>(Instrument Names are rows)</em></h3>" +
        "<table class='table table-bordered table-striped table-hover table-sm table-responsive event-table'>" +
        "<tr class='table-warning'><th></th>";
    for (let eventId in dSearch.eventGrid) {
        table += "<th>" + dSearch.getEventLabel(parseInt(eventId)) + "</th>";
    }
    table += "</tr>";

    dSearch.instrumentNames.forEach(function (v, k) {
        let insturmentName = k;
        console.log(insturmentName);
        table += "<tr>";
        table += "<td>" + v + "</td>";
        for (let eventId in dSearch.eventGrid) {
            table += "<td>";
            console.log(dSearch.eventGrid[eventId][insturmentName]);
            if (dSearch.eventGrid[eventId][insturmentName] === true) {
                table += "&#10003;";
            }
            table += "</td>";
        }
        table += "</tr>";
    });
    table += "</table>";

    dSearch.eventTableByInstrument = table;
};


$(document).ready(function () {
    dSearch.initialize();
    document.getElementById("instrument")[1].selected = true;
    dSearch.selectInstrument(document.getElementById("instrument").value);
    window.onscroll = function () {
        dSearch.scroll();
    };

});