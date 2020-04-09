/*global
dictionary, durl, $
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

const resDiv = document.getElementById("results");
const feedbackDiv = document.getElementById("feedback");
let fuzzy;
let upperCase;
let searchText;
let limitToSelection;
let fieldValues;
fieldValues = {};
let searchFields = [];
let searchFieldTypes = [];
let results;

let instruments = [];
getFormNames();
addFormNamesToSelect();

let fieldNames = [];
getFieldNames();
addAllFieldNamesToSelect();

const dictionaryFields = [
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

const redcap_field_types = [
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

function matchCriteria(dictionaryRow) {
    let fieldValue;
    let meetsCriteria = false;
    const DictionaryRowValues = Object.values(dictionaryRow);

    const filteredDictionaryRowValues = DictionaryRowValues.filter(function (el) {
        return el !== "";
    });

    for (let property of searchFields) {
        if (!filteredDictionaryRowValues.some(r => searchFieldTypes.indexOf(r) >= 0)) {
            continue;
        } else {
        }
        let valueOfField = dictionaryRow[property].valueOf();

// todo How to check for missingness??
        if (valueOfField === "") {
            continue;
        }

// todo how to uppercase every field value (not key) in object?
        if (upperCase === 1) {
            fieldValue = valueOfField.toUpperCase();
        } else {
            fieldValue = valueOfField;
        }

        if (fuzzy === 0) {
            if (fieldValue === searchText) {
                meetsCriteria = true;
            }
        } else {
            if (fieldValue.includes(searchText)) {
                meetsCriteria = true;
            }
        }
    }

    return meetsCriteria;
}

function findElements() {
    debugDictionarySearch();
    searchText = document.getElementById("searchString").value.trim();
    fuzzy = Number(document.querySelector("input[name=\"fuzzy\"]:checked").value);
    upperCase = Number(document.querySelector("input[name=\"upperCase\"]:checked").value);
    limitToSelection = Number(document.querySelector("input[name=\"all_var_info\"]:checked").value);
    resDiv.innerHTML = "";

    searchFields = [];
    searchFieldTypes = [];

    let selectedFields = false;
    dictionaryFields.forEach(function (item) {
        fieldValues[item] = false;
        let element = document.getElementById(item);
        if (typeof (element) !== "undefined" && element !== null) {
            fieldValues[item] = element.checked;
            if (fieldValues[item] === true) {
                selectedFields = true;
                searchFields.push(item);
            }
        }
    });

    let selectedFieldTypes = false;

    if (document.getElementById("all_field_types").checked) {
        searchFieldTypes = redcap_field_types;
        selectedFieldTypes = true;
    } else {
        redcap_field_types.forEach(function (item) {
            fieldValues[item] = false;
            let element = document.getElementById(item);
            if (typeof (element) !== "undefined" && element !== null) {
                fieldValues[item] = element.checked;
                if (fieldValues[item] === true) {
                    selectedFieldTypes = true;
                    searchFieldTypes.push(item);
                }
            }
        });
    }


    if (selectedFields !== true) {
        feedbackDiv.innerHTML = "Select a category to search";
        return;
    }
    if (searchText.length < 1) {
        feedbackDiv.innerHTML = "What are you searching for?";
        return;
    }

    if (selectedFieldTypes !== true) {
        document.getElementById("all_field_types").checked = true;
        searchFieldTypes = ["all_field_types"];
    }

    if (upperCase === 1) {
        searchText = searchText.toUpperCase();
    }

    let results = dictionary.filter(matchCriteria);
    if (Array.isArray(results) && results.length === 0) {
        resDiv.innerHTML = "That was not found";
    } else {
        showResults(results);
    }
}

function showResults(yy) {
    results = "<div>";
    yy.forEach(displaySingleField);
    results += "</div>";
    feedbackDiv.innerHTML = "Results";
    resDiv.innerHTML = results;
}

function displaySingleField(item) {
    let singleField;
    singleField = "";

    for (let propertyName in item) {
        if (limitToSelection === 1) {
            if (searchFields.includes(propertyName) === false && propertyName !== "field_name" && propertyName !== "form_name") {
                continue;
            }
        }
        let property = "";

        if (item.hasOwnProperty(propertyName)) {
            if (item[propertyName] !== "") {
                property = propertyName + ": " +
                    item[propertyName].replace(new RegExp(searchText, "gi"), "<strong>" + searchText + "</strong>");
                if (propertyName === "field_name") {
                    feedbackDiv.innerHTML = "Searching: " + item[propertyName];
                    property = "<strong>" + property + "</strong>";
                }
                if (propertyName === "form_name") {
                    property = "<a target=\"blank\" href=\"" + durl + "&page=" + item[propertyName] + "\">" +
                        propertyName + ": " + item[propertyName] + "</a>";
                }
                singleField = singleField + property + "<br>";
            }
        }
    }

    results += "<div style='border:1px solid grey;padding:20px;'>" + singleField + "</div>";
}

function toggleFieldTypesVisibility() {
    if (document.getElementById("all_field_types").checked) {
        $(".field-type").hide("slow");
    } else {
        $(".field-type").show("slow");
    }

}

function getFormNames() {
    let tempForms = [];
    dictionary.forEach(function (field) {
        tempForms.push(field.form_name);
    });
    instruments = removeDuplicates(tempForms);
}

function getFieldNames() {
    let tempFields = [];
    dictionary.forEach(function (field) {
        tempFields.push(field.field_name);
    });
    fieldNames = removeDuplicates(tempFields);
}

function addFormNamesToSelect() {
    instruments.forEach(function (item) {
        let option = document.createElement("option");
        option.text = item;
        option.value = item;
        document.getElementById("instrument").add(option);

    });
}

function addAllFieldNamesToSelect() {
    fieldNames.forEach(function (item) {
        let option = document.createElement("option");
        option.text = item;
        option.value = item;
        document.getElementById("fieldNames").add(option);
    });
}

function removeFieldNames() {
    const options = document.querySelectorAll("#fieldNames option");
    options.forEach(o => o.remove());
}

function addFieldNamesToSelectByFormName(instrumentName) {
    removeFieldNames();
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
}


function removeDuplicates(data) {
    return [...new Set(data)];
}

function displayInstrument(instrumentName) {
    results = "";
    dictionary.forEach(function (field) {
        if (field.form_name === instrumentName) {
            results += getFieldMetaForDisplay(field.field_name);
            results += "<hr>";
        }
    });
    resDiv.innerHTML = results;
    addFieldNamesToSelectByFormName(instrumentName);
}

function getFieldMetaForDisplay(fieldName) {
    results = "<ul style=\"list-style-type:none;\">";
    dictionary.forEach(function (field) {
        if (field.field_name === fieldName || fieldName === "all") {
            for (const property in field) {
                if (field.hasOwnProperty(property)) {
                    if (field[property] === "") {
                        continue;
                    }
                    results += "<li>" +
                        "<strong>" + property.replace("_", " ") + "</strong>: ";
                    if (property === "form_name") {
                        results += "<a target=\"blank\" href=\"" + durl + "&page=" + field[property] + "\">";
                    }
                    results += field[property] + "</li>";
                    if (property === "form_name") {
                        results += "</a>";
                    }
                    if (property === "select_choices_or_calculations") {
                        results += "<ul>";
                        let valueLabelMap = getValuesAndLabels(field[property]);
                        for (const [key, value] of valueLabelMap.entries()) {
                            results += "<li>" + key + ": " + value + "</li>";
                        }
                        results += "</ul>";
                    }
                }
            }
        }
    });
    results += "</ul>";
    return results;
}

function displayField(fieldName) {
    resDiv.innerHTML = getFieldMetaForDisplay(fieldName);
}

function debugDictionarySearch() {
    console.clear();
    console.log("searchText=" + searchText);
    console.log("upper=" + upperCase);
    console.log("fuzzy=" + fuzzy);
    console.log("limit to selection=" + limitToSelection);
    setAllFieldTypes();
}

function setAllFieldTypes() {
    let oneIsChecked = redcap_field_types.some(isAnyFieldTypeSpecified);
    document.getElementById("all_field_types").checked = oneIsChecked ? false : true;

}

function isAnyFieldTypeSpecified(element) {
    return document.getElementById(element).checked;
}

function getValuesAndLabels(str) {
    let vallabs = str.split("|");
    let valuesAndLabels = new Map();
    for (let i = 0; i < vallabs.length; i++) {
        let commaLoc = vallabs[i].indexOf(",");
        let val = vallabs[i].substring(0, commaLoc).trim();
        let lab = vallabs[i].substring(commaLoc + 1).trim();
        valuesAndLabels.set(val, lab);
    }
    return valuesAndLabels;
}