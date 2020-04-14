/*global
dictionary, designerUrl, $
*/
/*jslint devel: true */

/*jshint esversion: 6 */
'use strict';
/*
* TODO:  multiple selections to be searched.
*  parse out value labels
*  properly escape output (looking for double quotes).
*
* */

var dSearch = {};

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
        "file",
        "slider",
        "descriptive",
        "sql"
    ];

    dSearch.instruments = dSearch.getFormNames();
    dSearch.fieldNames = dSearch.getFieldNames();

    dSearch.resultsDiv = document.getElementById("results");
    dSearch.feedbackDiv = document.getElementById("feedback");

    dSearch.searchFields = [];
    dSearch.searchFieldTypes = [];

    dSearch.fieldValues = {};

    dSearch.addFormNamesToSelect();
    dSearch.addAllFieldNamesToSelect();

    dSearch.dictionaryUC = dictionary.map(dSearch.toUpper);
};


dSearch.matchCriteria = function (dictionaryRow) {
    let fieldValue;
    let meetsCriteria = false;
    const dictionaryRowValues = Object.values(dictionaryRow);

    /*
     remove empty values from being cycled through later.
    */
    const filteredDictionaryRowValues = dictionaryRowValues.filter(function (el) {
        return el !== "";
    });

    for (let property of dSearch.searchFields) {

        let valueOfField = dictionaryRow[property].valueOf();

        if (dSearch.upperCase === 1) {
            valueOfField = valueOfField.toUpperCase();
        }

        if (dSearch.fuzzy === 0) {
            if (valueOfField === dSearch.searchText) {
                meetsCriteria = true;
            }
        } else {
            if (valueOfField.includes(dSearch.searchText)) {
                meetsCriteria = true;
            }
        }
    }

    return meetsCriteria;
};

dSearch.findElements = function () {
    dSearch.setAllFieldTypes();
    dSearch.debugDictionarySearch();
    dSearch.resultsDiv.innerHTML = "";
    dSearch.feedbackDiv.innerHTML = "";

    dSearch.fuzzy = Number(document.querySelector("input[name=\"fuzzy\"]:checked").value);
    dSearch.upperCase = Number(document.querySelector("input[name=\"upperCase\"]:checked").value);
    dSearch.searchText = document.getElementById("searchString").value.trim();
    dSearch.limitToSelection = Number(document.querySelector("input[name=\"all_var_info\"]:checked").value);

    if (dSearch.searchText.length < 1) {
        dSearch.feedbackDiv.innerHTML = "What are you searching for?";
        return;
    }

    /*
    Limit the number for fields searched to just the user selected fields.
     */
    dSearch.setSelectedFields();
    if (!Array.isArray(dSearch.searchFields) || !dSearch.searchFields.length) {
        dSearch.feedbackDiv.innerHTML = "Select a category to search";
        return;
    }

    /*
    Limit the number for fields types  to just the selected fields..
     */
    dSearch.setSearchFieldTypes();

    if (dSearch.upperCase === 1) {
        dSearch.searchText = dSearch.searchText.toUpperCase();
    }

    dSearch.results = dictionary.filter(dSearch.matchCriteria);

    if (Array.isArray(dSearch.results) && dSearch.results.length === 0) {
        dSearch.resultsDiv.innerHTML = "The dictionary was searched and nothing was found.";
    } else {
        dSearch.showResults();
    }
};

dSearch.showResults = function () {
    dSearch.resultsDisplay = "<div>";
    dSearch.results.forEach(dSearch.displaySingleField);
    dSearch.resultsDisplay += "</div>";
    dSearch.feedbackDiv.innerHTML = "Results";
    dSearch.resultsDiv.innerHTML = dSearch.resultsDisplay;
};

dSearch.displaySingleField = function (item) {
    let singleField;
    singleField = "";

    for (let propertyName in item) {
        if (dSearch.limitToSelection === 1) {
            if (dSearch.searchFields.includes(propertyName) === false &&
                propertyName !== "field_name" &&
                propertyName !== "form_name") {
                continue;
            }
        }
        let property = "";

        if (item.hasOwnProperty(propertyName)) {
            if (item[propertyName] !== "") {
                property = propertyName + ": " +
                    item[propertyName].replace(new RegExp(dSearch.searchText, "gi"), "<strong>" + dSearch.searchText + "</strong>");
                if (propertyName === "field_name") {
                    dSearch.feedbackDiv.innerHTML = "Searching: " + item[propertyName];
                    property = "<strong>" + property + "</strong>";
                }
                if (propertyName === "form_name") {
                    property = "<a target=\"blank\" href=\"" + designerUrl + "&page=" + item[propertyName] + "\">" +
                        propertyName + ": " + item[propertyName] + "</a>";
                }
                singleField = singleField + property + "<br>";
            }
        }
    }

    dSearch.resultsDisplay += "<div style='border:1px solid grey;padding:20px;'>" + singleField + "</div>";
};

dSearch.toggleFieldTypesVisibility = function () {
    if (document.getElementById("all_field_types").checked) {
        $(".field-type").hide("medium");
    } else {
        $(".field-type").show("slow");
    }

};

dSearch.getFormNames = function () {
    let forms = [];
    dictionary.forEach(function (field) {
        forms.push(field.form_name);
    });
    return dSearch.removeDuplicates(forms);
};

dSearch.getFieldNames = function () {
    let fields = [];
    dictionary.forEach(function (field) {
        fields.push(field.field_name);
    });
    return dSearch.removeDuplicates(fields);
};

dSearch.addFormNamesToSelect = function () {
    dSearch.instruments.forEach(function (item) {
        let option = document.createElement("option");
        option.text = item;
        option.value = item;
        document.getElementById("instrument").add(option);
    });
};

dSearch.addAllFieldNamesToSelect = function () {
    dSearch.fieldNames.forEach(function (item) {
        let option = document.createElement("option");
        option.text = item;
        option.value = item;
        document.getElementById("fieldNames").add(option);
    });
};

dSearch.removeFieldNames = function () {
    const options = document.querySelectorAll("#fieldNames option");
    options.forEach(option => option.remove());
};

dSearch.addFieldNamesToSelectByFormName = function (instrumentName) {
    dSearch.removeFieldNames();

    let optionAll = document.createElement("option");
    optionAll.text = "All";
    optionAll.value = "all";
    let fieldNamesSelect = document.getElementById("fieldNames")
    fieldNamesSelect.add(optionAll);
    dictionary.forEach(function (field) {
        if (field.form_name === instrumentName || instrumentName === "any") {
            let option = document.createElement("option");
            option.text = field.field_name;
            option.value = field.field_name;
            fieldNamesSelect.add(option);
        }
    });
};


dSearch.removeDuplicates = function (data) {
    return [...new Set(data)];
};

// TODO this is cycling through the dictionary twice.
//  The first time to get the instrument.
//  The second time to get the field info.

dSearch.displayInstrument = function (instrumentName) {
    dSearch.selectedResults = "";
    dictionary.forEach(function (field) {
        if (field.form_name === instrumentName) {
            dSearch.selectedResults += dSearch.getFieldMetaForDisplay(field, field.field_name);
            dSearch.selectedResults += "<hr>";
        }
    });
    dSearch.resultsDiv.innerHTML = dSearch.selectedResults;
    dSearch.addFieldNamesToSelectByFormName(instrumentName);
};

// todo
//  this should not be checking to see if the fieldName matches anything.  It should be done before this step.

dSearch.getFieldMetaForDisplay = function (field, fieldName) {
    let fieldMeta = "<ul style=\"list-style-type:none;\">";
    if (field.field_name === fieldName || fieldName === "all") {
        for (const property in field) {
            if (field.hasOwnProperty(property)) {
                if (field[property] === "") {
                    continue;
                }
                fieldMeta += "<li>" +
                    "<strong>" + property.replace("_", " ") + "</strong>: ";
                if (property === "form_name") {
                    fieldMeta += "<a target=\"blank\" href=\"" + designerUrl + "&page=" + field[property] + "\">";
                }
                fieldMeta += field[property] + "</li>";
                if (property === "form_name") {
                    fieldMeta += "</a>";
                }
                if (property === "select_choices_or_calculations") {
                    fieldMeta += "<ul>";
                    let valueLabelMap = dSearch.getValuesAndLabels(field[property]);
                    for (const [key, value] of valueLabelMap.entries()) {
                        fieldMeta += "<li>" + key + ": " + value + "</li>";
                    }
                    fieldMeta += "</ul>";
                }
            }
        }
    }
    fieldMeta += "</ul>";
    return fieldMeta;
};

// todo finish this function for displaying a single field.
dSearch.displayField = function (fieldName) {
    let results = "";
    dictionary.forEach(function (field) {
        if (fieldName === field.field_name) {
            results += dSearch.getFieldMetaForDisplay(field, field.field_name);
        }
    });
    dSearch.resultsDiv.innerHTML = results;
};

dSearch.debugDictionarySearch = function () {
    console.clear();
    console.log("searchText=" + dSearch.searchText);
    console.log("upper=" + dSearch.upperCase);
    console.log("fuzzy=" + dSearch.fuzzy);
    console.log("limit to selection=" + dSearch.limitToSelection);
};

dSearch.setAllFieldTypes = function () {
    let oneIsChecked = dSearch.redcap_field_types.some(dSearch.isFieldTypeSelected);
    document.getElementById("all_field_types").checked = oneIsChecked ? false : true;
};

dSearch.isFieldTypeSelected = function (element) {
    return document.getElementById(element).checked;
};

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

dSearch.onlyFieldsMatched = function (fieldName) {
    console.log("Only Fields Matached");
    if (fieldName === "all") {
        return dictionary;
    } else {
        let results = dictionary.filter(function (field) {
            return (field.field_name === fieldName || fieldName === "all");
        });
    }
};

dSearch.toUpper = function (item) {
    return item.toUpperCase;
};

/**
 * Sets array dSearch.searchFields
 * an empty array value is OK.
 */
dSearch.setSelectedFields = function () {
    dSearch.searchFields = [];
    dSearch.dictionaryFields.forEach(function (item) {
        let element = document.getElementById(item);
        if (typeof (element) !== "undefined" && element !== null) {
            if (element.checked === true) {
                dSearch.searchFields.push(item);
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

    if (!dSearch.searchFields.length) {
        document.getElementById("all_field_types").checked = true;
        dSearch.searchFieldTypes = ["all_field_types"];
    }
};

dSearch.initialize();

dSearch.onlyFieldsMatched("all");