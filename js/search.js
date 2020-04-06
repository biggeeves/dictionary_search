/*global
dictionary, durl, $
*/
/*jslint devel: true */

/*jshint esversion: 6 */
'use strict';
console.log("initialized");
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

// todo bug introduced when "field type was broken out" with a specify all.
function matchCriteria(dictionaryRow) {
    let fieldValue;
    let meetsCriteria = false;
    const DictionaryRowValues = Object.values(dictionaryRow);

    const filteredDictionaryRowValues = DictionaryRowValues.filter(function (el) {
        return el !== "";
    });

    for (let property of searchFields) {
        if (!filteredDictionaryRowValues.some(r => searchFieldTypes.indexOf(r) >= 0)) {
            console.log("skipping: " + property);
            continue;
        } else {
            console.log("Has Property:" + property);
        }
        let valueOfField = dictionaryRow[property].valueOf();
        console.log(valueOfField);

// How to check for missingness
        if (valueOfField === "") {
            continue;
        }

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
    console.clear();
    console.log("hello");
    searchText = document.getElementById("searchString").value.trim();
    fuzzy = Number(document.querySelector("input[name=\"fuzzy\"]:checked").value);
    upperCase = Number(document.querySelector("input[name=\"upperCase\"]:checked").value);
    limitToSelection = Number(document.querySelector("input[name=\"all_var_info\"]:checked").value);
    resDiv.innerHTML = "";

    // todo see if PHP and JavaScript can share the same Dictionary Field Meta Data

    searchFields = [];
    searchFieldTypes = [];

    let selectedFields = false;
    dictionaryFields.forEach(function (item, index) {
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

    // todo make sure that all is the overriding and only one if all and multiples are selected.
    let selectedFieldTypes = false;

    if (document.getElementById("all_field_types").checked) {
        searchFieldTypes = redcap_field_types;
        selectedFieldTypes = true;
    } else {
        redcap_field_types.forEach(function (item, index) {
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
    console.log(searchFieldTypes);

    if (upperCase === 1) {
        searchText = searchText.toUpperCase();
    }

    console.log("searchText=" + searchText);
    console.log("upper=" + upperCase);
    console.log("fuzzy=" + fuzzy);
    console.log("limit to selection=" + limitToSelection);

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
    instruments.forEach(function (item, index) {
        let option = document.createElement("option");
        option.text = item;
        option.value = item;
        document.getElementById("instrument").add(option);

    });
}

function addAllFieldNamesToSelect() {
    fieldNames.forEach(function (item, index) {
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
    console.log(instrumentName);
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
                    if (field[property] !== "") {
                        results += "<li>" +
                            "<strong>" + property.replace("_", " ") + "</strong>: " +
                            field[property] + "</li>";
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

/*function displayField(fieldName) {
    results = "<ul style=\"list-style-type:none;\">";
    dictionary.forEach(function (field) {
        if (field.field_name === fieldName || fieldName === "all") {
            field.forEach(function (propertyX) {
                results += "<li>" +
                    "<strong>" + propertyX.replace("_", " ") + "</strong>: " +
                    field[propertyX] + "</li>";

            });
            results += "<hr>";
        }
    });
    results += "</ul>";
    resDiv.innerHTML = results;
}*/


// TODO use the hasOwnProperty to make sure we just show the good stuff.
// todo add style to capitalize the fields in a generic select.
// for (var prop in obj) {
//    if (obj.hasOwnProperty(prop)) {
//        // or if (Object.prototype.hasOwnProperty.call(obj,prop)) for safety...
//        console.log("prop: " + prop + " value: " + obj[prop])
//    }
//}
