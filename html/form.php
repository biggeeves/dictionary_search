<div class="row">
    <div class="col-9">
        <p data-dSearchVersion="v9.9.9" class="text-muted-more">Dictionary <span id="dSearchVersion"></span></p>
        <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                <a class="nav-item nav-link active" id="nav-search-tab" data-toggle="tab" href="#nav-search" role="tab"
                   aria-controls="nav-search" aria-selected="true">Search</a>
                <a class="nav-item nav-link" id="nav-lists-tab" data-toggle="tab" href="#nav-lists" role="tab"
                   aria-controls="nav-lists" aria-selected="false">Select</a>
                <a class="nav-item nav-link" id="nav-broad-search-tab" data-toggle="tab" href="#nav-broad-search"
                   role="tab"
                   aria-controls="nav-broad-search" aria-selected="false">Broad Search</a>
                <?php if (REDCap::isLongitudinal()) { ?>
                    <a class="nav-item nav-link" id="nav-events-tab" data-toggle="tab" href="#nav-events" role="tab"
                       aria-controls="nav-events" aria-selected="false">Events</a>
                <?php } ?>
            </div>
        </nav>

        <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show active" id="nav-search" role="tabpanel" aria-labelledby="nav-search-tab">
                <div class="row mt-3">
                    <div class="col">
                        <form name="dataDictionarySearch" class="form">
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <label for="searchString" class="input-group-text col-form-label font-weight-bolder"
                                    >Search for:</label>
                                </div>
                                <input type="text" class="form-control" id="searchString" name="searchString"
                                       onkeydown="return event.key !== 'Enter';">
                                <div class="input-group-append">
                                    <button type="button" onclick="dSearch.submitted();"
                                            class="btn btn-defaultrc">Search
                                    </button>
                                </div>
                            </div>
                            <h5 class="font-weight-bolder">Field Properties</h5>
                            <fieldset>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-check">
                                            <input class="form-check-input" name="all_categories" id="all_categories"
                                                   type="checkbox"
                                                   onchange="dSearch.toggleAllCategories()">
                                            <label class="form-check-label" id="form-check-label" for="all_categories"
                                                   data-toggle="tooltip"
                                                   title="All categories will be searched.  The check marks will remain the same so you can go back to a previous selection.">Check All</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="form_name" id="form_name"
                                                   type="checkbox">
                                            <label class="form-check-label" for="form_name" data-toggle="tooltip"
                                                   title="Instrument Name(s)">Form Name</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="section_header" id="section_header"
                                                   type="checkbox">
                                            <label class="form-check-label" for="section_header">Section Header</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="field_name" id="field_name"
                                                   type="checkbox"
                                                   checked="checked">
                                            <label class="form-check-label" for="field_name" data-toggle="tooltip"
                                                   title="Variable Name(s)">Field Name</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="field_label" id="field_label"
                                                   type="checkbox"
                                                   checked="checked">
                                            <label class="form-check-label" for="field_label">Field Label</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="field_type" id="field_type"
                                                   type="checkbox">
                                            <label class="form-check-label" for="field_type">Field Type</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="field_note" id="field_note"
                                                   type="checkbox">
                                            <label class="form-check-label" for="field_note">Field Note</label>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-check">
                                            <input class="form-check-input" name="select_choices_or_calculations"
                                                   id="select_choices_or_calculations" type="checkbox">
                                            <label class="form-check-label"
                                                   for="select_choices_or_calculations">Select Choices &#47; Calculations</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input"
                                                   name="text_validation_type_or_show_slider_number"
                                                   id="text_validation_type_or_show_slider_number" type="checkbox">
                                            <label class="form-check-label"
                                                   for="text_validation_type_or_show_slider_number">Validation Type</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="text_validation_min"
                                                   id="text_validation_min"
                                                   type="checkbox">
                                            <label class="form-check-label"
                                                   for="text_validation_min">Minimum Value</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="text_validation_max"
                                                   id="text_validation_max"
                                                   type="checkbox">
                                            <label class="form-check-label"
                                                   for="text_validation_max">Maximum Value</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="field_annotation"
                                                   id="field_annotation"
                                                   type="checkbox">
                                            <label class="form-check-label"
                                                   for="field_annotation">Field Annotation</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="branching_logic" id="branching_logic"
                                                   type="checkbox">
                                            <label class="form-check-label"
                                                   for="branching_logic">Branching Logic</label>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-check">
                                            <input class="form-check-input" name="custom_alignment"
                                                   id="custom_alignment"
                                                   type="checkbox">
                                            <label class="form-check-label"
                                                   for="custom_alignment">Custom Alignment</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="question_number" id="question_number"
                                                   type="checkbox">
                                            <label class="form-check-label"
                                                   for="question_number">Question Number</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="matrix_group_name"
                                                   id="matrix_group_name"
                                                   type="checkbox">
                                            <label class="form-check-label" for="matrix_group_name">Matrix Group</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="required_field" id="required_field"
                                                   type="checkbox">
                                            <label class="form-check-label" for="required_field">Required</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="identifier" id="identifier"
                                                   type="checkbox">
                                            <label class="form-check-label" for="identifier">Identifier</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" name="matrix_ranking" id="matrix_ranking"
                                                   type="checkbox">
                                            <label class="form-check-label" for="matrix_ranking">Matrix Ranking</label>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            <hr>
                            <div class="field-type-options">
                                <h5 class="font-weight-bolder">Field Type(s)</h5>
                                <fieldset>
                                    <div class="row">
                                        <div class="col">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" name="all_field_types"
                                                       id="all_field_types"
                                                       onchange="dSearch.toggleFieldTypesVisibility()" checked>
                                                <label class="form-check-label"
                                                       for="all_field_types">All Field Types</label>
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="text" id="text"
                                                       onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="text">Text</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="notes" id="notes"
                                                       onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="notes">Notes</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="calc" id="calc"
                                                       onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="calc">Calculations</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="dropdown"
                                                       id="dropdown" onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="dropdown">Dropdowns</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="radio" id="radio"
                                                       onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="radio">Radios</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="checkbox"
                                                       id="checkbox" onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="checkbox">Checkbox</label>
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="yesno" id="yesno"
                                                       onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="yesno">Yes/No</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="truefalse"
                                                       id="truefalse" onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="truefalse">True False</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="file" id="file"
                                                       onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="file">File</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="slider"
                                                       id="slider" onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="slider">Slider</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="descriptive"
                                                       id="descriptive" onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="descriptive">Descriptive</label>
                                            </div>
                                            <div class="form-check field-type">
                                                <input class="form-check-input" type="checkbox" name="sql" id="sql"
                                                       onchange="dSearch.updateAllFieldTypes();">
                                                <label class="form-check-label" for="sql">SQL</label>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            <!-- <hr> Field Validation Options Coming Soon todo -->
                            <div class="field-validation-options d-none">
                                <h5 class="font-weight-bolder">Validations</h5>
                                <fieldset>
                                    <div class="row">
                                        <div class="col">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox"
                                                       name="all_field_validations"
                                                       id="all_field_validations"
                                                       onchange="dSearch.toggleFieldValidationsVisibility()" checked>
                                                <label class="form-check-label"
                                                       for="all_field_validations">All Validations</label>
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="date_dmy"
                                                       id="date_dmy"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="date_dmy">date_dmy</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="date_mdy"
                                                       id="date_mdy"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="date_mdy">date_mdy</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="date_ymd"
                                                       id="date_ymd"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="date_ymd">date_ymd</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="datetime_dmy"
                                                       id="datetime_dmy"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="datetime_dmy">datetime_dmy</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="datetime_mdy"
                                                       id="datetime_mdy"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="datetime_mdy">datetime_mdy</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="datetime_ymd"
                                                       id="datetime_ymd"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="datetime_ymd">datetime_ymd</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox"
                                                       name="datetime_seconds_dmy" id="datetime_seconds_dmy"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label"
                                                       for="datetime_seconds_dmy">datetime_seconds_dmy</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox"
                                                       name="datetime_seconds_mdy" id="datetime_seconds_mdy"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox"
                                                       name="datetime_seconds_ymd" id="datetime_seconds_ymd"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label"
                                                       for="datetime_seconds_ymd">datetime_seconds_ymd</label>
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="email" id="email"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="email">email</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="integer"
                                                       id="integer"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="integer">integer</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="number"
                                                       id="number"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="number">number</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="phone" id="phone"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="phone">phone</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="time" id="time"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="time">time</label>
                                            </div>
                                            <div class="form-check field-validation">
                                                <input class="form-check-input" type="checkbox" name="zipcode"
                                                       id="zipcode"
                                                       onchange="dSearch.updateAllFieldValidations();">
                                                <label class="form-check-label" for="zipcode">zipcode</label>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col">
                                    <h5 class="font-weight-bolder">Text Specificity</h5>
                                    <fieldset>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="fuzzy" id="partialMatch"
                                                   value="1"
                                                   checked>
                                            <label class="form-check-label" for="partialMatch">
                                                Partial Match
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="fuzzy" id="exactMatch"
                                                   value="0">
                                            <label class="form-check-label" for="exactMatch">
                                                Exact Match
                                            </label>
                                        </div>
                                    </fieldset>
                                </div>
                                <div class="col">
                                    <h5 class="font-weight-bolder">Case Sensitivity</h5>
                                    <fieldset>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="upperCase" id="upperCase"
                                                   value="1"
                                                   checked>
                                            <label class="form-check-label" for="upperCase">
                                                Convert everything to uppercase.
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="upperCase" id="exactCase"
                                                   value="0">
                                            <label class="form-check-label" for="exactCase">
                                                Use Exact Case
                                            </label>
                                        </div>
                                    </fieldset>
                                </div>
                                <div class="col">
                                    <h5 class="font-weight-bolder">Search Results</h5>
                                    <fieldset>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="all_var_info"
                                                   id="limitResults"
                                                   value="1"
                                                   onclick="dSearch.setLimitToSelection();">
                                            <label class="form-check-label" for="limitResults">
                                                Selected Categories Only
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input"
                                                   type="radio" name="all_var_info" id="allResults"
                                                   value="0"
                                                   checked
                                                   onclick="dSearch.setLimitToSelection();">
                                            <label class="form-check-label" for="allResults">
                                                All categories that are not blank (blanks are never displayed)
                                            </label>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div id="feedback" style="padding:25px;"></div>
                <div id="results" style="padding:25px;"></div>
            </div>
            <div class="tab-pane fade" id="nav-lists" role="tabpanel" aria-labelledby="nav-lists-tab">
                <div class="row mt-3">
                    <div class="col-6">
                        <label class="font-weight-bolder" for="instrument">Instrument</label>
                        <select class="custom-select" name="instrument" id="instrument"
                                onchange="dSearch.selectInstrument(this.value);">
                            <option value="dSearchAny">Any</option>
                        </select>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-5">
                        <label class="font-weight-bolder" for="fieldNames">Field</label>
                        <select class="custom-select" name="fieldNames" id="fieldNames"
                                onchange="dSearch.displayField(this.value);">
                            <option value="dSearchAll">All</option>
                        </select>
                    </div>
                    <div class="col-3">
                        <label class="font-weight-bolder" for="selectFieldType">Field Type</label>
                        <select class="custom-select" name="selectFieldType" id="selectFieldType"
                                onchange="dSearch.displayFieldsByProperty('field_type',this.value);">
                            <option value="dSearchAll">All</option>
                            <option value="text">Text</option>
                            <option value="notes">Notes</option>
                            <option value="calc">Calc</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="radio">Radio</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="yesno">YesNo</option>
                            <option value="truefalse">TrueFalse</option>
                            <option value="file">File</option>
                            <option value="slider">Slider</option>
                            <option value="descriptive">Descriptive</option>
                            <option value="sql">SQL</option>
                        </select>
                    </div>
                    <div class="col-4">
                        <label class="font-weight-bolder" for="selectValidation">Validation</label>
                        <select class="custom-select" name="selectValidation" id="selectValidation"
                                onchange="dSearch.displayFieldsByProperty('text_validation_type_or_show_slider_number', this.value);">
                            <option value="dSearchAll">All</option>
                            <option value="date_dmy">date: dmy</option>
                            <option value="date_mdy">date: mdy</option>
                            <option value="date_ymd">date: ymd</option>
                            <option value="datetime_dmy">datetime: dmy</option>
                            <option value="datetime_mdy">datetime: mdy</option>
                            <option value="datetime_ymd">datetime: ymd</option>
                            <option value="datetime_seconds_dmy">datetime seconds: dmy</option>
                            <option value="datetime_seconds_mdy">datetime seconds: mdy</option>
                            <option value="datetime_seconds_ymd">datetime seconds: ymd</option>
                            <option value="email">email</option>
                            <option value="integer">integer</option>
                            <option value="number">number</option>
                            <option value="phone">phone</option>
                            <option value="time">time</option>
                            <option value="zipcode">zipcode</option>
                        </select>
                    </div>
                </div>
                <!--
                <div class="row mt-3">
                    <div class="col-6">
                        <button class="btn btn-primary btn-sm" name="calcFieldInRadio" id="calcFieldInRadio"
                                onclick="dSearch.displayRadiosInCalcFields();">Radios in Calc Fields
                        </button>
                    </div>
                </div>
                -->
                <div class="row mt-3">
                    <div class="col">
                        <div id="eventList" style="padding:25px;"></div>
                        <div id="selectResults" style="padding:25px;"></div>
                    </div>
                </div>
            </div>
            <div class="tab-pane fade" id="nav-broad-search" role="tabpanel"
                 aria-labelledby="nav-broad-search-tab">
                <div class="row mt-3">
                    <div class="col">
                        <form name="broadSearchForm" class="form" method="post"
                              action="<?php echo $this->getUrl("index.php"); ?>">
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <label for="broadSearchText"
                                           class="input-group-text col-form-label font-weight-bolder"
                                    >Search for:</label>
                                </div>
                                <input type="text" class="form-control" id="broadSearch" name="broadSearchText">
                                <div class="input-group-append">
                                    <input type="submit" class="btn btn-defaultrc" value="Search" name="broadSubmit">
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div id="broadResults" style="padding:25px;"><?php echo $this->broadResultsHTML ?></div>
            </div>
            <div class="tab-pane fade" id="nav-events" role="tabpanel" aria-labelledby="nav-events-tab">
                <div id="selections">
                    <div class="row  mt-3">
                        <div class="col-4">
                            <label class="font-weight-bolder" for="instrumentEvent">Select an Instrument</label>
                            <select class="custom-select" name="instrumentEvent" id="instrumentEvent"
                                    onchange="dSearch.renderEventsForForm(this.value);">
                            </select>
                        </div>
                        <div class="col-4">
                            <label class="font-weight-bolder" for="eventSelect">Select an Event</label>
                            <select class="custom-select" name="eventSelect" id="eventSelect"
                                    onchange="dSearch.renderFormsForEvent(this.value);">
                            </select>
                        </div>
                        <div class="col-3">
                            <span id="designate_forms_url">Designate Forms Link</span>
                        </div>
                    </div>
                </div>
                <div class="row  mt-3">
                    <div class="col-12">
                        <div id="formsForEvent"></div>
                    </div>
                </div>
                <div class="row  mt-3">
                    <div class="col-12">
                        <div id="eventTableByEvent"></div>
                    </div>
                </div>
                <div class="row  mt-3">
                    <div class="col-12">
                        <div id="eventTableByInstrument"></div>
                    </div>
                </div>
                <div class="row  mt-3">
                    <div class="col-12">
                        <div id="event"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<button onclick="dSearch.scrollToTop()" id="scrollToTop" class="btn btn-defaultrc" title="Go to top">Top</button>