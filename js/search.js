/*global
$, dSearch,
dSearch.instrumentNames
*/

/*jslint devel: true */

/*jshint esversion: 6 */

/*eslint-env browser*/
'use strict';
/*
* todo:  parse out value labels
*
* todo: simplify the dictionarySearch by removing blanks properties.
*
* todo: API token page has a nice Event table which has three columns: Unique Event Name, Event Name, Arm  Recreate table.
*
* todo: include sample sample schemas
* */

dSearch.debugger = false;
dSearch.version = "v1.4.1";

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

    dSearch.redcapFieldTypes = [
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

    dSearch.redcapValidations = [
        "date_dmy",
        "date_mdy",
        "date_ymd",
        "datetime_dmy",
        "datetime_mdy",
        "datetime_ymd",
        "datetime_seconds_dmy",
        "datetime_seconds_mdy",
        "datetime_seconds_ymd",
        "email",
        "integer",
        "number",
        "phone",
        "time",
        "zipcode"
    ];
    dSearch.variableWrapper = "<div class='row mt-1'><div class=\"col shadow p-3 mb-5 bg-white rounded\">";

    // dSearch.allInstrumentNames = dSearch.getAllInstrumentNames();
    dSearch.allFieldNames = dSearch.getAllFieldNames();
    dSearch.fieldsByType = dSearch.getFieldsByType();

    dSearch.resultsDiv = document.getElementById("results");
    dSearch.selectResultsDiv = document.getElementById("selectResults");
    dSearch.feedbackDiv = document.getElementById("feedback");
    dSearch.scrollToTopBtn = document.getElementById("scrollToTop");

    dSearch.searchMeta = [];
    dSearch.searchFieldTypes = [];

    dSearch.fieldValues = {};

    dSearch.addMapOptionsToSelect("instrument", dSearch.instrumentNames);

    if (dSearch.isLongitudinal) {
        dSearch.addMapOptionsToSelect("instrumentEvent", dSearch.instrumentNames);
        dSearch.addMapOptionsToSelect("eventSelect", dSearch.eventLabels);
    }
    // dSearch.addOptionsToSelect("instrument", dSearch.instrumentNames);
    dSearch.addOptionsToSelect("fieldNames", dSearch.allFieldNames);

    dSearch.handleEnter();
    document.getElementById("searchString").focus();

    if (dSearch.isLongitudinal) {
        dSearch.eventListDiv = document.getElementById("eventList");
        dSearch.instrumentsForEventDiv = document.getElementById("formsForEvent");
        dSearch.eventTableByEventsDiv = document.getElementById("eventTableByEvent");
        dSearch.eventTableByInstrumentDiv = document.getElementById("eventTableByInstrument");
        dSearch.setEventTableByEvent();
        dSearch.setEventTableByInstrument();
        dSearch.eventTableByEventsDiv.innerHTML = dSearch.eventTableByEvent;
        dSearch.eventTableByInstrumentDiv.innerHTML = dSearch.eventTableByInstrument;
        dSearch.renderLinkToDesignateInstruments();
    }

    if (dSearch.debugger) {
        document.getElementById("dSearchVersion").innerText = dSearch.version;
    }

    dSearch.selectTab(dSearch.activeTabId);
};


/**
 * Searches all meta data in a field (dictionary row) to find matches.
 * @param dictionaryRow
 * @returns {boolean}  true = matches any criteria specified.  false = does not match anything.
 */
dSearch.matchCriteria = function (dictionaryRow) {
    let isMatch = false;

    let meta = [];
    dSearch.searchMeta.forEach(function (property) {
        meta[property] = false;
    });

    if (!dSearch.searchFieldTypes.includes(dictionaryRow.field_type)) {
        return false;
    }

    if (dSearch.debugger) {
        // console.log(dictionaryRow.field_name);
    }


    for (let property of dSearch.searchMeta) {

        let metaValue = dictionaryRow[property].valueOf();
        /* Required fields, Identifiers, Matrix Ranking are included properties only when they are checked by the user
          Only then must they meet criteria below.  If the property is not included in Search Fields than the user
          did not check it and thus will be checked here for the value Y.
         */

        if (property === "required_field" && metaValue === "y") {
            meta[property] = true;
        } else if (property === "identifier" && metaValue === "y") {
            meta[property] = true;
        } else if (property === "matrix_ranking" && metaValue === "y") {
            meta[property] = true;
        } else if (property === "select_choices_or_calculations" && metaValue === "y") {
            meta[property] = true;
        }

        if (dSearch.upperCase === 1) {
            metaValue = metaValue.toUpperCase();
        }

        /* search for text if search string was submitted */
        if (dSearch.searchText.length > 0) {
            if (dSearch.fuzzy === 0) {
                if (metaValue === dSearch.searchText) {
                    meta[property] = true;
                    isMatch = true;
                }
            } else {
                if (metaValue.includes(dSearch.searchText)) {
                    meta[property] = true;
                    isMatch = true;
                }
            }
        }
    }
    console.log(dictionaryRow.field_name);
    console.log(meta);
    /* if the search string is zero than return true if the user searched for required, identifier, or matrix ranking
    * Example: Search for all required fields does not need search text.
    * */
    if (dSearch.searchText.length === 0) {
        isMatch = Object.values(meta).some(Boolean);
    }
    return isMatch;
};

/**
 * Controller for search form submission.
 */
dSearch.submitted = function () {
    dSearch.setAllFieldTypes();
    dSearch.resultsDiv.innerHTML = "";
    let feedBack = dSearch.today();
    dSearch.feedbackDiv.innerHTML = feedBack;

    dSearch.fuzzy = Number(document.querySelector("input[name=\"fuzzy\"]:checked").value);
    dSearch.upperCase = Number(document.querySelector("input[name=\"upperCase\"]:checked").value);
    dSearch.searchText = document.getElementById("searchString").value.trim();
    dSearch.setLimitToSelection();

    /*
    Limit the number for fields searched to just the user selected fields.
     */
    dSearch.setSelectedCategories();
    if (!Array.isArray(dSearch.searchMeta) || !dSearch.searchMeta.length) {
        dSearch.feedbackDiv.style.display = "block";
        dSearch.feedbackDiv.innerHTML = "Select a category to search";
        return;
    }
    dSearch.feedbackDiv.style.display = "block";
    dSearch.feedbackDiv.innerHTML = "Results generated: " + feedBack;

    /* Limit the number for fields TYPES to just the selected fields..
     */
    dSearch.setSearchFieldTypes();
    dSearch.setSearchValidations();

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
        dSearch.renderSimpleSearchResults();
    }
};

dSearch.setLimitToSelection = function () {
    dSearch.limitToSelection = Number(document.querySelector("input[name=\"all_var_info\"]:checked").value);
};

/**
 * Render the results for submitting a search.
 */
dSearch.renderSimpleSearchResults = function () {
    dSearch.resultsDisplay = "<div class=\"results\">";

    for (let result = 0; result < dSearch.results.length; result++) {
        let fieldMetaDisplay = dSearch.renderFieldMeta(dSearch.results[result]);
        dSearch.resultsDisplay += fieldMetaDisplay;
    }

    dSearch.resultsDisplay += "</div>";
    dSearch.resultsDiv.innerHTML = dSearch.resultsDisplay;
};

/**
 * @param fieldMeta  all meta data from the data dictionary for the field
 */
dSearch.renderFieldMeta = function (fieldMeta) {
    let metaHTML = "";
    let properties = Object.entries(fieldMeta);
    let searchTextHTML = dSearch.escapeHTML(dSearch.searchText);
    let regexSplit = new RegExp(searchTextHTML, "i");
    for (let i = 0; i < properties.length; i++) {
        let propertyName = properties[i][0];
        let propertyValue = properties[i][1];
        if (dSearch.limitToSelection === 1) {
            if (dSearch.searchMeta.includes(propertyName) === false &&
                propertyName !== "field_name" &&
                propertyName !== "form_name") {
                continue;
            }
        }
        if (propertyValue !== "") {
            let propertyValueHTML = "";

            // Render category label for display
            let categoryLabel = propertyName.replace(/_/g, " ");
            categoryLabel = categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1);

            if (propertyName === "field_name") {
                propertyValueHTML = dSearch.renderFieldName(fieldMeta.field_name, fieldMeta.form_name);
            } else if (propertyName === "form_name") {
                propertyValueHTML = dSearch.renderInstrumentName(fieldMeta.form_name);
            } else if (dSearch.searchMeta.includes(propertyName)) {
                propertyValueHTML = dSearch.escapeHTML(propertyValue);
                propertyValueHTML = propertyValueHTML.split(regexSplit).join("<span class='dSearch-bolder'>" + searchTextHTML + "</span>");
            } else {
                propertyValueHTML = dSearch.escapeHTML(propertyValue);
            }
            metaHTML = metaHTML + "<p><strong>" + categoryLabel + "</strong>: " + propertyValueHTML + "</p>";
        }
    }

    return dSearch.variableWrapper + metaHTML + "</div></div>";
};

dSearch.renderFieldName = function (fieldName, InstrumentShortName) {
    let display = "";
    let index = dSearch.allFieldNames.indexOf(fieldName);
    if (index < 0) {
        return "Field name not found";
    }
    if (dSearch.canAccessDesigner) {
        display += "<a target=\"blank\" href=\"" +
            dSearch.designerUrl +
            "&page=" + InstrumentShortName +
            "&field=" + fieldName +
            "\"" +
            "title='Open Designer in New Tab'>";
    }
    display += "<span style='font-weight: bold;' data-field-index='" + index + "'>" +
        fieldName + "</span>";
    if (dSearch.canAccessDesigner) {
        display += "</a>";
    }
    return display;
};

// todo: check for valid instrument name. If not valid return null
dSearch.renderInstrumentName = function (InstrumentShortName) {
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
 * If all field types is checked then hide the field type categories.
 */
dSearch.toggleFieldValidationsVisibility = function () {
    if (document.getElementById("all_field_validations").checked) {
        $(".field-validation").hide("medium");
    } else {
        $(".field-validation").show("slow");
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
dSearch.checkAllCategories = function (state) {
    dSearch.dictionaryFields.forEach(function (element, key, map) {
        dSearch.syncToggleAllCategories(state, element);
    });
};

dSearch.syncToggleAllCategories = function (state, element) {
    document.getElementById(element).checked = state;
};


/**
 * Get unique array of instrument names
 * @returns {*[]}
 */
dSearch.getAllInstrumentNames = function () {
    let instrumentNames = [];
    dSearch.dictionary.forEach(function (field) {
        instrumentNames.push(field.form_name);
    });
    return dSearch.removeDuplicates(instrumentNames);
};

/**
 * Get unique array of field names.
 * @returns {*[]}
 */
dSearch.getAllFieldNames = function () {
    let fieldNames = [];
    dSearch.dictionary.forEach(function (field) {
        fieldNames.push(field.field_name);
    });
    return dSearch.removeDuplicates(fieldNames);
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
    options.forEach(function (long, short) {
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
dSearch.addFieldNamesToSelectByInstrumentName = function (instrumentName) {
    dSearch.removeFieldNames();

    let optionAll = document.createElement("option");
    optionAll.text = "All";
    optionAll.value = "";
    let fieldNamesSelect = document.getElementById("fieldNames");
    fieldNamesSelect.add(optionAll);
    dSearch.dictionary.forEach(function (field) {
        if (field.form_name === instrumentName || instrumentName === "") {
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
        dSearch.eventListDiv.innerHTML = "";
        if (instrumentName !== "") {
            dSearch.eventListDiv.innerHTML = dSearch.displayInstrumentEvents(instrumentName);
        }
    }
    if (instrumentName !== "") {
        dSearch.displayInstrument(instrumentName);
    }
    dSearch.addFieldNamesToSelectByInstrumentName(instrumentName);
};

dSearch.getAllFieldsMetaForInstrument = function (instrumentName) {
    let resultHTML = "";
    dSearch.dictionary.forEach(function (field) {
        if (field.form_name === instrumentName) {
            resultHTML += dSearch.renderFieldMeta(field);
        }
    });
    return resultHTML;

};

dSearch.displayInstrument = function (instrumentName) {
    let resultHTML = "";
    if (!dSearch.instrumentNames.has(instrumentName)) {
        return;
    }
    resultHTML = "<div><h3 class='text-center'><em> " +
        dSearch.instrumentNames.get(instrumentName) +
        "</em></h3></div>";

    resultHTML += dSearch.getAllFieldsMetaForInstrument(instrumentName);

    return resultHTML;
};

dSearch.displayInstrumentEvents = function (instrumentName) {
    let events = dSearch.getEventsForInstrument(instrumentName);
    let eventsHTML = "";
    // Must be a valid instrument name
    if (!dSearch.instrumentNames.has(instrumentName)) {
        dSearch.eventListDiv.innerHTML = eventsHTML;
        return;
    }
    let eventsCountLabel = (events.length > 1) ? events.length + " events" : " event";
    if (0 === events.length) {
        eventsHTML = "<h3>There are no events for " + dSearch.instrumentNames.get(instrumentName) + "</h3>";
    } else {
        eventsHTML = "<h3>" + dSearch.instrumentNames.get(instrumentName) +
            " is available on the following " + eventsCountLabel + ":</h3>" +
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

/** Very quick way to prepare field meta data for display
 dSearch.allFieldNames is a look up table to find the index in dSearch.dictionary
 receives field name
 returns field meta data or "Field Not Found".
 */
dSearch.getFieldDisplayByFieldName = function (fieldName) {
    let result = "";
    let i = dSearch.allFieldNames.indexOf(fieldName);
    if (i < 0) {
        result = "Field Not Found";
    } else {
        result += dSearch.renderFieldMeta(dSearch.dictionary[i]);
    }
    return result;
};

/**
 * Debug info.
 */
dSearch.debugDictionarySearch = function () {
    console.clear();
    console.log("Debugger is on.");
    console.log("searchText=" + dSearch.searchText);
    console.log("upper=" + dSearch.upperCase);
    console.log("fuzzy=" + dSearch.fuzzy);
    console.log("limit to selection=" + dSearch.limitToSelection);
    console.log("The categories to search:");
    console.log(dSearch.searchMeta);
    console.log("Field types to search:");
    console.log(dSearch.searchFieldTypes);
    console.log("Validations to search:");
    console.log(dSearch.searchValidations);
};

/**
 *  if a single field type is checked, uncheck all_field_types
 *
 */
dSearch.setAllFieldTypes = function () {
    let oneIsChecked = dSearch.redcapFieldTypes.some(dSearch.isFieldTypeSelected);
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
 * Sets array dSearch.searchMeta
 * an empty array value is OK.
 */
dSearch.setSelectedCategories = function () {
    dSearch.searchCategories = [];
    dSearch.dictionaryFields.forEach(function (item) {
        let element = document.getElementById(item);
        if (typeof (element) !== "undefined" && element !== null) {
            if (element.checked === true) {
                dSearch.searchMeta.push(item);
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
        dSearch.searchFieldTypes = dSearch.redcapFieldTypes;
    } else {
        dSearch.redcapFieldTypes.forEach(function (item) {
            let element = document.getElementById(item);
            if (typeof (element) !== "undefined" && element !== null) {
                if (element.checked === true) {
                    dSearch.searchFieldTypes.push(item);
                }
            }
        });
    }
// FIXME: Not sure if searchMeta is used correctly.
    if (!dSearch.searchMeta.length) {
        document.getElementById("all_field_types").checked = true;
        dSearch.searchFieldTypes = ["all_field_types"];
    }
};

/**
 * Sets array dSearch.setSearchValidations
 * if nothing is selected default of all_field_types is selected and used as value.
 */

dSearch.setSearchValidations = function () {
    dSearch.searchValidations = [];
    if (document.getElementById("all_field_validations").checked) {
        dSearch.searchValidations = dSearch.redcapValidations;
    } else {
        dSearch.redcapValidations.forEach(function (item) {
            let element = document.getElementById(item);
            if (typeof (element) !== "undefined" && element !== null) {
                if (element.checked === true) {
                    dSearch.searchValidations.push(item);
                }
            }
        });
    }

    if (!dSearch.searchValidations.length) {
        document.getElementById("all_field_validations").checked = true;
        dSearch.searchFieldTypes = ["all_field_validations"];
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

dSearch.getEventsForInstrument = function (instrumentShortName) {
    let eventIds = [];
    let eventGrid = dSearch.eventGrid;
    for (let event in eventGrid) {
        if (!eventGrid.hasOwnProperty(event)) {
            continue;
        }
        let instruments = eventGrid[event];
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

dSearch.selectedEvent = function (eventNumber) {
    let display = dSearch.renderInstrumentsForEvent(eventNumber);
    dSearch.instrumentsForEventDiv.innerHTML = display;
};

dSearch.renderInstrumentsForEvent = function (eventNumber) {
    let instruments = dSearch.eventGrid[eventNumber];
    if (instruments.length === 0) {
        return "There are no instruments for that event.";
    }
    eventNumber = eventNumber * 1;
    let eventLabel = dSearch.getEventLabel(eventNumber);
    let display = "<h3>" + eventLabel +
        " has the following instruments.</h3><ul>";
    for (let instrumentName in instruments) {
        if (instruments[instrumentName]) {
            display += "<li>" + dSearch.instrumentNames.get(instrumentName) + "</li>";
        }
    }
    display += "</ul>";
    return display;
};

dSearch.renderEventsForInstrument = function (shortInstrumentName) {
    let display = dSearch.displayInstrumentEvents(shortInstrumentName);
    dSearch.instrumentsForEventDiv.innerHTML = display;
};


dSearch.setEventTableByEvent = function () {
    let table = "<h3>Events are rows</h3>" +
        "<table class='table table-bordered table-striped table-hover table-sm table-responsive event-table'>" +
        "<tr class='table-warning'><th><span class=\"designate_forms_url\">Edit</span></th>";
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
    let table = "<h3>Instrument Names are rows</h3>" +
        "<table class='table table-bordered table-striped table-hover table-sm table-responsive event-table'>" +
        "<tr class='table-warning'><th><span class=\"designate_forms_url\">Edit</span></th>";
    for (let eventId in dSearch.eventGrid) {
        table += "<th>" + dSearch.getEventLabel(parseInt(eventId)) + "</th>";
    }
    table += "</tr>";

    dSearch.instrumentNames.forEach(function (v, k) {
        let instrumentName = k;
        table += "<tr>";
        table += "<td>" + v + "</td>";
        for (let eventId in dSearch.eventGrid) {
            table += "<td>";
            if (dSearch.eventGrid[eventId][instrumentName] === true) {
                table += "&#10003;";
            }
            table += "</td>";
        }
        table += "</tr>";
    });
    table += "</table>";

    dSearch.eventTableByInstrument = table;
};

dSearch.renderSelectedResults = function (results) {
    dSearch.selectResultsDiv.innerHTML = results;
};

dSearch.displayCalcFields = function () {
    let searchField = "lh5tv_en";  // sample field to find in a calculation

//    dSearch.setCalculatedFields();
    let resultHTML = "";
    for (const field in dSearch.fieldsByType.calc) {
        let field_name = dSearch.fieldsByType.calc[field];
        /** todo this was working when this was searching for a field name
         but now all we have is the field name and nothing of the properties.
         let calcText = dSearch.calculatedFields[field].select_choices_or_calculations;
         let containedFields = calcText.match(/\[(.*?)\]/g);
         let hasText = false;
         for (let i = 0; i < containedFields.length; i++) {
            containedFields[i] = containedFields[i].replace("[", "").replace("]", "");
            if (searchField === containedFields[i]) {
                hasText = true;
            }
        }
         if (!hasText) {
            continue;
        }
         */
        resultHTML += dSearch.getFieldDisplayByFieldName(field_name);
    }
    dSearch.renderSelectedResults(resultHTML);
};

dSearch.getFieldNamesByType = function (type) {
    if (!dSearch.fieldsByType[type]) {
        return;
    }
    let fieldNames = [];
    if (type === "") {
        fieldNames = dSearch.fieldNames;
    } else {
        for (let i = 0; i < dSearch.fieldsByType[type].length; i++) {
            fieldNames.push(dSearch.fieldsByType[type][i]);
        }
    }
    return fieldNames;
};

dSearch.getFieldNamesByInstrument = function (instrumentName) {
    let fieldNames = [];
    dSearch.dictionary.forEach(function (field) {
        if (field.form_name === instrumentName || instrumentName === "") {
            fieldNames.push(field.field_name);
        }
    });
    return fieldNames;
};

dSearch.selectionController = function (property, value) {
    // todo check if valid properties and values are passed.
    if (property === "") {
        property = "form_name";
        value = document.getElementById("instrument").value;
    }
    let resultHTML = "";
    dSearch.feedbackDiv.style.display = "none";
    dSearch.renderSelectedResults(""); // clear the results;

    if (property === "text_validation_type_or_show_slider_number") {
        document.getElementById("selectFieldType").value = "text";
        document.getElementById("fieldNames").value = "";
    } else if (property === "field_type") {
        document.getElementById("fieldNames").value = "";
        document.getElementById("selectValidation").value = "";
    } else if (property === "field_name") {
        document.getElementById("selectFieldType").value = "";
        document.getElementById("selectValidation").value = "";
    } else if (property === "form_name") {
        dSearch.selectInstrument(value);

        // display event data
        if (dSearch.isLongitudinal) {
            dSearch.eventListDiv.innerHTML = "";
            if (value !== "") {
                dSearch.eventListDiv.innerHTML = dSearch.displayInstrumentEvents(value);
            }
        }
        dSearch.addFieldNamesToSelectByInstrumentName(value);
    }
    let selection = dSearch.setSelection();

    let fieldNames = dSearch.getFieldsBySelection(selection);

    resultHTML += dSearch.summary(fieldNames);
    for (let i = 0; i < fieldNames.length; i++) {
        resultHTML += dSearch.getFieldDisplayByFieldName(fieldNames[i]);
    }
    dSearch.renderSelectedResults(resultHTML);

};

dSearch.summary = function (resultArray) {
    let count = resultArray.length;
    let summaryHTML = "<div><h3 class='text-center'>There ";
    if (count === 0) {
        summaryHTML += "are no results.</h3></div>";
    } else {
        if (count === 1) {
            summaryHTML += "is 1 result.";
        } else {
            summaryHTML += "are " + count + " results.";
        }
    }
    summaryHTML += "</h3></div>";
    return summaryHTML;
};

dSearch.setSelection = function () {
    let select = new Map();
    let instruments = document.getElementById("instrument").value;
    let fields = document.getElementById("fieldNames").value;
    let types = document.getElementById("selectFieldType").value;
    let validations = document.getElementById("selectValidation").value;
    if (instruments !== "") {
        select.set('form_name', instruments);
    }
    if (fields !== "") {
        select.set('field_name', fields);
    }
    if (types !== "") {
        select.set('field_type', types);
    }
    if (validations !== "") {
        select.set('text_validation_type_or_show_slider_number', validations);
    }
    return select;
};

/** must pass each selection criteria.  All or nothing.
 *  Sample selections: {"form_name" => "project_settings", "field_type" => "calc"}
 */
dSearch.getFieldsBySelection = function (selections) {
    let fieldNames = [];
    for (let i = 0; i < dSearch.dictionary.length; i++) {
        let pass = 0;
        for (let [property, value] of selections) {
            if (dSearch.dictionary[i][property] === value) {
                pass++;
            }
        }
        if (pass === selections.size) {
            fieldNames.push(dSearch.dictionary[i].field_name);
        }
    }
    return fieldNames;
};

dSearch.propertyValue = function (dictionaryRow, property, value) {
    return dictionaryRow.filter(function (el) {
        let match = false;
        if (el) {
            console.log(el, property, value);
        }
    });
};


dSearch.getFieldsByType = function () {
    let fieldsByType = {};
    for (const type of dSearch.redcapFieldTypes) {
        fieldsByType[type] = [];
    }

    for (let field in dSearch.dictionary) {
        fieldsByType[dSearch.dictionary[field].field_type].push(dSearch.dictionary[field].field_name);
    }
    return fieldsByType;
};

dSearch.displayRadiosInCalcFields = function () {
    // 1) get Calculated fields.  Look through all calc fields for ones that reference radio or selects
    dSearch.renderSelectedResults(dSearch.fieldsByType.calc);
};

dSearch.updateAllFieldTypes = function () {
    document.getElementById("all_field_types").checked = false;
};

dSearch.updateAllFieldValidations = function () {
    document.getElementById("all_field_validations").checked = false;
};

dSearch.renderLinkToDesignateInstruments = function () {
    let display = "";
    if (dSearch.canAccessDesigner) {
        display += "<a href=\"" +
            dSearch.designateFormsUrl +
            "\">Edit</a>";
    }
    let els = document.getElementsByClassName("designate_forms_url");
    for (let i = 0; i < els.length; i++) {
        els[i].innerHTML = display;
    }
};

dSearch.escapeHTML = function escapeHtml(html) {
    var text = document.createTextNode(html);
    var p = document.createElement('p');
    p.appendChild(text);
    return p.innerHTML;
};

dSearch.selectTab = function (tabId) {
    $('#' + tabId).tab('show');
};

$(document).ready(function () {
    dSearch.initialize();
    document.getElementById("instrument")[1].selected = true;
    dSearch.selectionController("form_name", document.getElementById("instrument").value);
    window.onscroll = function () {
        dSearch.scroll();
    };
});

/** todo this was working when this was searching for a field name
 but now all we have is the field name and nothing of the properties.
 let calcText = dSearch.calculatedFields[field].select_choices_or_calculations;
 let containedFields = calcText.match(/\[(.*?)\]/g);
 let hasText = false;
 for (let i = 0; i < containedFields.length; i++) {
            containedFields[i] = containedFields[i].replace("[", "").replace("]", "");
            if (searchField === containedFields[i]) {
                hasText = true;
            }
        }
 if (!hasText) {
            continue;
        }
 */