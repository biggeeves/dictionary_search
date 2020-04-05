<?php

namespace DCC\DataDictionarySearch;

use ExternalModules\AbstractExternalModule;
use \REDCap as REDCap;
use \Security as Security;

class DataDictionarySearch extends AbstractExternalModule
{

    /**
     * @var integer
     * @value 14
     */
    private $pid;

    /**
     * @var string[]
     */
    private $dataDictionary;

    /**
     * @var string[]
     */
    private $fieldNames;

    /**
     * @var string[]
     */
    private $formNames;

    /**
     * @var string[]
     */
    private $sectionHeaders;

    /**
     * @var string[]  Careful there is a similar one that is REDCap Field Types
     */
    private $fieldTypes;

    /**
     * @var string[]
     */
    private $fieldLabels;

    /**
     * @var string[]
     */
    private $selectChoicesCalculations;

    /**
     * @var string[]
     */
    private $fieldOptions;

    /**
     * @var string[]
     */
    private $fieldNotes;

    /**
     * @var string[]
     */
    private $fieldValidations;

    /**
     * @var string[]
     */
    private $fieldMins;

    /**
     * @var string[]
     */
    private $fieldMaxs;

    /**
     * @var string[]
     */
    private $identifier;

    /**
     * @var string[]
     */
    private $branching_logic;

    /**
     * @var string[]
     */
    private $required_field;

    /**
     * @var string[]
     */
    private $custom_alignment;

    /**
     * @var string[]
     */
    private $question_number;

    /**
     * @var string[]
     */
    private $matrix_group_name;

    /**
     * @var string[]
     */
    private $matrix_ranking;

    /**
     * @var string[]
     */
    private $field_annotation;

    private $redcap_field_types;

    public function __construct()
    {
        $this->makeREDCapFieldTypes();
        parent::__construct();
    }

    public function redcap_project_home_page(int $project_id)
    {

    }

    /** todo change field type to a drop down where the choices have values dropdown, text, etc c
     * Change required, custom alignment, identifier to appropriate drop downs.
     * perhaps each field type should be it's checkbox.
     **/

    public function getForm()
    {
        return file_get_contents(__DIR__ . '/html/form.html');
    }

    public function getJSUrl()
    {
        return $this->getUrl("js/search.js");
    }

    public function getOnlineDesignerURL()
    {
        global $redcap_base_url;
        global $redcap_version;
        global $project_id;
        return $redcap_base_url . 'redcap_v' . $redcap_version . '/Design/online_designer.php?pid=' . $project_id;
    }

    public function resultsDiv()
    {
        $resultArea = '<div id="results" style="padding:25px;"></div>';
        return $resultArea;
    }

    public function feedbackDiv()
    {
        $resultArea = '<div id="feedback" style="padding:25px;"></div>';
        return $resultArea;
    }

    /**
     * @param $pid
     */
    public function setProjectId($pid)
    {
        $this->pid = $pid;
    }

    /**
     *
     */
    public function makeDataDictionary()
    {
        $this->setDataDictionary();
        $this->convertDataDictionary();
    }

    /**
     *
     */
    private function setDataDictionary()
    {
        $this->dataDictionary = REDCap::getDataDictionary($this->pid, 'array');
    }

    public function setDataDictionaryJSON()
    {
        $this->dataDictionary = REDCap::getDataDictionary($this->pid, 'json');

    }

    /**
     * @return string[]
     */
    public function getDataDictionary()
    {
        return $this->dataDictionary;
    }


    /**
     *
     */
    private function convertDataDictionary()
    {
        $this->fieldNames = [];
        $formNames = [];
        foreach ($this->dataDictionary as $fieldName => $properties) {
            $this->fieldNames[] = $fieldName;
            foreach ($properties as $property => $value) {
                if ($property == 'form_name') {
                    $formNames[] = $value;
                } elseif ($property == 'section_header') {
                    $this->sectionHeaders[$fieldName] = $value;
                } elseif ($property == 'field_type') {
                    $this->fieldTypes[$fieldName] = $value;
                } elseif ($property == 'field_label') {
                    $this->fieldLabels[$fieldName] = $value;
                } elseif ($property == 'select_choices_or_calculations') {
                    $this->selectChoicesCalculations[$fieldName] = $value;
                    $this->fieldOptions[$fieldName] = $this->makeValueLabels($value);
                } elseif ($property == 'field_note') {
                    $this->fieldNotes[$fieldName] = $value;
                } elseif ($property == 'text_validation_type_or_show_slider_number') {
                    $this->fieldValidations[$fieldName] = $value;
                } elseif ($property == 'text_validation_max') {
                    $this->fieldMaxs[$fieldName] = $value;
                } elseif ($property == 'text_validation_min') {
                    $this->fieldMins[$fieldName] = $value;
                }
                if ($property == 'field_type') {
                    if ($value == 'yesno') {
                        $this->fieldOptions[$fieldName] = $this->makeValueLabels('0, No|1, Yes');
                    } elseif ($value == 'checkbox') {
                        $this->fieldOptions['checkbox'] = 1;

                    }
                }
            }
        }
        $this->forms = array_values(array_unique($formNames));
    }

    /**
     * @return null|string[]
     */
    public function getFieldNames()
    {
        if (isset($this->fieldNames) && !is_null($this->fieldNames)) {
            return $this->fieldNames;
        } else {
            return NULL;
        }
    }

    /**
     * @return null|string[]
     */
    public function getSectionHeaders()
    {
        if (isset($this->sectionHeaders) && !is_null($this->sectionHeaders)) {
            return $this->sectionHeaders;
        } else {
            return NULL;
        }
    }

    /**
     * @return null|string[]
     */
    public function getFieldTypes()
    {
        if (isset($this->fieldTypes) && !is_null($this->fieldTypes)) {
            return $this->fieldTypes;
        } else {
            return NULL;
        }
    }

    /**
     * @return null|string[]
     */
    public function getFieldLabels()
    {
        if (isset($this->fieldLabels) && !is_null($this->fieldLabels)) {
            return $this->fieldLabels;
        } else {
            return NULL;
        }
    }

    /**
     * @return null|string[]
     */
    public function getSelectChoicesCalculations()
    {
        if (isset($this->selectChoicesCalculations) && !is_null($this->selectChoicesCalculations)) {
            return $this->selectChoicesCalculations;
        } else {
            return NULL;
        }
    }

    /**
     * @return null|string[]
     */
    public function getFieldNotes()
    {
        if (isset($this->fieldNotes) && !is_null($this->fieldNotes)) {
            return $this->fieldNotes;
        } else {
            return NULL;
        }
    }

    /**
     * @return null|string[]
     */
    public function getFieldValidations()
    {
        if (isset($this->fieldValidations) && !is_null($this->fieldValidations)) {
            return $this->fieldValidations;
        } else {
            return NULL;
        }
    }

    /**
     * @return null|string[]
     */
    public function getFieldMaxs()
    {
        if (isset($this->fieldMaxs) && !is_null($this->fieldMaxs)) {
            return $this->fieldMaxs;
        } else {
            return NULL;
        }
    }

    /**
     * @return null|string[]
     */
    public function getFieldMins()
    {
        if (isset($this->fieldMins) && !is_null($this->fieldMins)) {
            return $this->fieldMins;
        } else {
            return NULL;
        }
    }

    /**
     * @param $optionText
     * @return array
     */
    private function makeValueLabels($optionText)
    {

        $optionTempArray = explode('|', $optionText);
        $options = [];
        foreach ($optionTempArray as $key => $value) {
            $val = trim(explode(',', $value)[0]);
            $lab = trim(explode(',', $value)[1]);
            $options[$val] = $lab;
        }
        return $options;
    }

    /**
     * @param $fieldName  The Name of the field
     * @param $value      The value of the field
     * @return string | false, The value of the value label
     */
    public function getValueLabel($fieldName, $value)
    {
        // todo
        // If a field is check box how are value labels passed back?
        if (isset($this->fieldOptions[$fieldName]) && isset($this->fieldOptions[$fieldName][$value])) {
            return $this->fieldOptions[$fieldName][$value];
        } else {
            return false;
        }
    }

    /**
     * @param string $searchName
     * @return bool
     */
    public function isField($searchName = '')
    {
        return in_array(strtolower($searchName), $this->fieldNames);
    }

    /**
     * @return string[]
     */
    public function getFormNames()
    {
        return $this->formNames;
    }

    /**
     * @return string[]
     */
    public function getFieldOptions()
    {
        return $this->fieldOptions;
    }

    public function makeREDCapFieldTypes()
    {
        $this->redcap_field_types = [
            "notes",
            "text",
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
    }

}