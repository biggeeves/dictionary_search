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

// var dictionaryUC = dictionary.map(dSearch.toUpper);
};


dSearch.matchCriteria = function (dictionaryRow) {
    let fieldValue;
    let meetsCriteria = false;
    const DictionaryRowValues = Object.values(dictionaryRow);

    const filteredDictionaryRowValues = DictionaryRowValues.filter(function (el) {
        return el !== "";
    });

    for (let property of dSearch.searchFields) {
        if (!filteredDictionaryRowValues.some(r => dSearch.searchFieldTypes.indexOf(r) >= 0)) {
            continue;
        } else {
        }
        let valueOfField = dictionaryRow[property].valueOf();

// todo How to check for missingness??
        if (valueOfField === "") {
            continue;
        }

// todo how to uppercase every field value (not key) in object?
        if (dSearch.upperCase === 1) {
            fieldValue = valueOfField.toUpperCase();
        } else {
            fieldValue = valueOfField;
        }

        if (dSearch.fuzzy === 0) {
            if (fieldValue === dSearch.searchText) {
                meetsCriteria = true;
            }
        } else {
            if (fieldValue.includes(dSearch.searchText)) {
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

    dSearch.fuzzy = Number(document.querySelector("input[name=\"fuzzy\"]:checked").value);
    dSearch.upperCase = Number(document.querySelector("input[name=\"upperCase\"]:checked").value);
    dSearch.searchText = document.getElementById("searchString").value.trim();
    dSearch.limitToSelection = Number(document.querySelector("input[name=\"all_var_info\"]:checked").value);

    dSearch.searchFields = [];
    dSearch.searchFieldTypes = [];

    let selectedFields = false;
    dSearch.dictionaryFields.forEach(function (item) {
        dSearch.fieldValues[item] = false;
        let element = document.getElementById(item);
        if (typeof (element) !== "undefined" && element !== null) {
            dSearch.fieldValues[item] = element.checked;
            if (dSearch.fieldValues[item] === true) {
                selectedFields = true;
                dSearch.searchFields.push(item);
            }
        }
    });

    let selectedFieldTypes = false;

    if (document.getElementById("all_field_types").checked) {
        dSearch.searchFieldTypes = dSearch.redcap_field_types;
        selectedFieldTypes = true;
    } else {
        dSearch.redcap_field_types.forEach(function (item) {
            dSearch.fieldValues[item] = false;
            let element = document.getElementById(item);
            if (typeof (element) !== "undefined" && element !== null) {
                dSearch.fieldValues[item] = element.checked;
                if (dSearch.fieldValues[item] === true) {
                    selectedFieldTypes = true;
                    dSearch.searchFieldTypes.push(item);
                }
            }
        });
    }


    if (selectedFields !== true) {
        dSearch.feedbackDiv.innerHTML = "Select a category to search";
        return;
    }
    if (dSearch.searchText.length < 1) {
        dSearch.feedbackDiv.innerHTML = "What are you searching for?";
        return;
    }

    if (selectedFieldTypes !== true) {
        document.getElementById("all_field_types").checked = true;
        dSearch.searchFieldTypes = ["all_field_types"];
    }

    if (dSearch.upperCase === 1) {
        dSearch.searchText = dSearch.searchText.toUpperCase();
    }

    dSearch.results = dictionary.filter(dSearch.matchCriteria);
    if (Array.isArray(dSearch.results) && dSearch.results.length === 0) {
        dSearch.resultsDiv.innerHTML = "That was not found";
    } else {
        dSearch.showResults(dSearch.results);
    }
};

dSearch.showResults = function (yy) {
    dSearch.results = "<div>";
    yy.forEach(dSearch.displaySingleField);
    dSearch.results += "</div>";
    dSearch.feedbackDiv.innerHTML = "Results";
    dSearch.resultsDiv.innerHTML = dSearch.results;
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

    dSearch.results += "<div style='border:1px solid grey;padding:20px;'>" + singleField + "</div>";
};

dSearch.toggleFieldTypesVisibility = function () {
    if (document.getElementById("all_field_types").checked) {
        $(".field-type").hide("slow");
    } else {
        $(".field-type").show("slow");
    }

};

dSearch.getFormNames = function () {
    let tempForms = [];
    dictionary.forEach(function (field) {
        tempForms.push(field.form_name);
    });
    return dSearch.removeDuplicates(tempForms);
};

dSearch.getFieldNames = function () {
    let tempFields = [];
    dictionary.forEach(function (field) {
        tempFields.push(field.field_name);
    });
    return dSearch.removeDuplicates(tempFields);
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
    options.forEach(o => o.remove());
};

dSearch.addFieldNamesToSelectByFormName = function (instrumentName) {
    dSearch.removeFieldNames();
    let all = document.createElement("option");
    all.text = "All";
    all.value = "all";
    document.getElementById("fieldNames").add(all);
    dictionary.forEach(function (field) {
        if (field.form_name === instrumentName || instrumentName === "any") {
            let option = document.createElement("option");
            option.text = field.field_name;
            option.value = field.field_name;
            document.getElementById("fieldNames").add(option);
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
    dSearch.results = "";
    dictionary.forEach(function (field) {
        if (field.form_name === instrumentName) {
            dSearch.results += dSearch.getFieldMetaForDisplay(field, field.field_name);
            dSearch.results += "<hr>";
        }
    });
    dSearch.resultsDiv.innerHTML = dSearch.results;
    dSearch.addFieldNamesToSelectByFormName(instrumentName);
};

// todo
//  this should not be checking to see if the fieldName matches anything.  It should be done before this step.

dSearch.getFieldMetaForDisplay = function (field, fieldName) {
    let results = "<ul style=\"list-style-type:none;\">";
    if (field.field_name === fieldName || fieldName === "all") {
        for (const property in field) {
            if (field.hasOwnProperty(property)) {
                if (field[property] === "") {
                    continue;
                }
                results += "<li>" +
                    "<strong>" + property.replace("_", " ") + "</strong>: ";
                if (property === "form_name") {
                    results += "<a target=\"blank\" href=\"" + designerUrl + "&page=" + field[property] + "\">";
                }
                results += field[property] + "</li>";
                if (property === "form_name") {
                    results += "</a>";
                }
                if (property === "select_choices_or_calculations") {
                    results += "<ul>";
                    let valueLabelMap = dSearch.getValuesAndLabels(field[property]);
                    for (const [key, value] of valueLabelMap.entries()) {
                        results += "<li>" + key + ": " + value + "</li>";
                    }
                    results += "</ul>";
                }
            }
        }
    }
    results += "</ul>";
    return results;
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
    let oneIsChecked = dSearch.redcap_field_types.some(dSearch.isAnyFieldTypeSpecified);
    document.getElementById("all_field_types").checked = oneIsChecked ? false : true;
};

dSearch.isAnyFieldTypeSpecified = function (element) {
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
    if (fieldName === "all") {
        return dictionary;
    } else {
        let results = dictionary.filter(function (field) {
            return (field.field_name === fieldName || fieldName === "all");
        });
        console.log(results);
    }
};

dSearch.toUpper = function (item) {
    return item.toUpperCase();
};

dSearch.initialize();

dSearch.onlyFieldsMatched("all");