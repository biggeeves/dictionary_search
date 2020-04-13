<?php

namespace DCC\DictionarySearch;

use ExternalModules\AbstractExternalModule;
use \REDCap as REDCap;
use \Security as Security;

class DictionarySearch extends AbstractExternalModule
{

    /**
     * @var integer
     */
    private $pid;

    /**
     * @var string[]
     */
    private $dataDictionary;


    private $redcap_field_types;

    public function __construct()
    {
        parent::__construct();
    }

    public function redcap_project_home_page(int $project_id)
    {

    }

    public function initialize()
    {
        global $project_id;
        $this->makeREDCapFieldTypes();
        $this->setProjectId($project_id);
        $this->setDataDictionaryJSON();
    }

    /** todo
     * Change required, custom alignment, identifier to appropriate drop downs (if needed)
     * Check to see if someone can go to the Online Designer
     * $allow_edit = ($user_rights['design'] && ($status == '0' || ($status == '1' && $draft_mode == '1')));
     **/

    public function setDataDictionaryJSON()
    {
        global $project_id;
        $this->dataDictionary = REDCap::getDataDictionary($project_id, 'json');
    }

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
        global $redcap_base_url, $redcap_version, $project_id;
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
     * @return string[]
     */
    public function getDataDictionary()
    {
        return $this->dataDictionary;
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

    public function renderForm()
    {
        return $this->getForm() .
            $this->feedbackDiv() .
            $this->resultsDiv();
    }
}
