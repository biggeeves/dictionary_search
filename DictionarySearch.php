<?php

namespace DCC\DictionarySearch;

use Exception;
use ExternalModules\AbstractExternalModule;
use \REDCap as REDCap;
use \Security as Security;

/** todo
 * Request for developers: Make an external module for looking up the history of fields.
 * When submitting an advanced search remember what the search text was and prefill the search field with it.
 **/

/**
 * Class DictionarySearch
 * @package DCC\DictionarySearch
 */
class DictionarySearch extends AbstractExternalModule
{

    /**
     * @var string[]
     */
    private $dataDictionaryJSON;

    /**
     * @var array|string
     */
    private $instrumentNames;

    /**
     * @var array  Multidimensional Array
     * Array 1 is eventId and contains Array 2 (Key value Array)
     * Array 2 shortName => (true = given at time point.  False=Not at time point)
     *
     * Sample: [166] => Array
     * (
     * [instrument_1] => true
     * [instrument_2] => false
     * [instrument_3] => false
     * [instrument_4] => true
     * )
     */
    private $eventGrid;
    /**
     * @var array|bool|mixed
     */
    private $eventNames;
    /**
     * @var array every instrument has a complete variable.
     */
    private $completedInstrumentVars;
    /**
     * @var array|bool|mixed
     */
    private $eventLabels;

    /**
     * @var bool  true=Project is in Design Mode and User has designer rights.
     */
    private $canAccessDesigner;

    /**
     * @var string the tab set as active on page load
     */
    private $activeTabId;
    /**
     * @var mixed REDCap returned user rights.
     */
    private $userRights;
    /**
     * @var string if the broad search form was submitted; the returned results.  If not submitted zero length string.
     */
    private $broadResultsHTML;

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @param int $project_id Global Variable set by REDCap for Project ID.
     */
    public function redcap_project_home_page(int $project_id)
    {

    }

    /**
     *  Main action for Dictionary Search
     *  1) Ensures a project is selected
     *  2) Gets the JSON data dictionary
     *  3) displays the HTML form
     *  4) includes necessary JavaScripts.
     */
    public function controller()
    {
        global $project_id;
        if (!isset($project_id) || is_null($project_id)) {
            echo '<h2 class="alert alert-info" style="border-color: #bee5eb !important;">Please select a project</h2>';
            return;
        }
        $this->setDataDictionaryJSON($project_id);
        $this->instrumentNames = REDCap::getInstrumentNames();
        $rights = REDCap::getUserRights(USERID);
        $this->userRights = array_shift($rights);
        /*        echo "<pre>";
                print_r($this->userRights);
                echo "x" . $this->userRights['reports'] . "x";
                echo "</pre>";*/

        $this->canAccessDesigner();

        $this->setEventNames();
        $this->setEventNameLabels();

        $this->setInstrumentCompleteVar($this->instrumentNames);

        $this->setEventGrid($project_id, array_keys($this->eventNames));

        /* todo this fails because $searchText has not been defined yet.
        $searchInto  = "<div class='row'><div class='col'><h4>Search Results <b> " .
            htmlspecialchars($searchText) . "</b></h4></div></div>";*/

        $this->broadResultsHTML = $this->renderBroadResultsHTML();
        // todo when the page first loads the results are blank, thus the page shows There are no results for that search.
        // - When the page first loads there should be no message
        // - check to see if it was submitted or not before rendering the message
        if ($this->broadResultsHTML == "") {
            $this->broadResultsHTML = "There are no results for that search.";
        }
        echo $this->getCSS();
        $this->renderForm();

        if (REDCap::isLongitudinal()) {
            $this->setEventTable();
        }
        $this->activeTabId = "nav-search-tab";
        if (isset($_POST['broadSubmit'])) {
            $this->activeTabId = "nav-broad-search-tab";
        }

        echo $this->renderScripts();

    }

    private function canAccessDesigner()
    {
        global $draft_mode;  // 1=Draft Mode
        global $status;  // 0=Design Mode, 1=Production
        $userRights = array_shift(REDCap::getUserRights(USERID));

        // No rights until proven.
        $this->canAccessDesigner = false;

        if ($status == 0 || $draft_mode == 1) {
            if ($userRights['design'] == 1) {
                $this->canAccessDesigner = true;
            }
        }

    }


    /**
     * Sets dataDictionaryJSON
     * @param null $project_id
     * @return null
     * @throws Exception
     * @sets
     */
    private function setDataDictionaryJSON($project_id = null)
    {
        if (is_null($project_id)) {
            return null;
        }
        $this->dataDictionaryJSON = REDCap::getDataDictionary($project_id, 'json');
    }

    /**
     * @return string[] Data Dictionary as JSON
     */
    private function getDataDictionaryJSON()
    {
        return $this->dataDictionaryJSON;
    }


    /**
     * The URL to the JavaScript that powers the HTML search form.
     *
     * @return string URL to search.js
     */
    private function getJSUrl()
    {
        return $this->getUrl("js/search.js");
    }

    private function getCSSUrl()
    {
        return $this->getUrl("css/base.css");
    }

    /**
     * URL to the instrument in the Online Designer.
     *
     * @return string Online Designer URL including REDCap Base, Version and Project ID.
     */
    private function getOnlineDesignerURL()
    {
        global $redcap_base_url, $redcap_version, $project_id;
        return $redcap_base_url . 'redcap_v' . $redcap_version . '/Design/online_designer.php?pid=' . $project_id;
    }

    /**
     * URL to designate instruments for my events
     *
     * @return string Event grid URL including REDCap Base, Version and Project ID.
     */
    private function getDesignateFormsURL()
    {
        global $redcap_base_url, $redcap_version, $project_id;
        return $redcap_base_url . 'redcap_v' . $redcap_version . '/Design/designate_forms.php?pid=' . $project_id;
    }

    /**
     * include form HTML/PHP.
     */
    private function renderForm()
    {
        $htmlPHP = __DIR__ . '/html/form.php';
        if (!file_exists($htmlPHP)) {
            return 'HTML form not found';
        }
        include $htmlPHP;
    }

    /**
     * creates Map of Instrument Short Names => Long Names;
     * @return string Map of Instrument Short Names, Long Names;
     */
    private function getInstrumentsNamesJS()
    {
        $js = '<script>dSearch.instrumentNames = new Map([';
        foreach ($this->instrumentNames as $short => $long) {
            $long = str_replace('"', '\"', $long);
            $js .= '["' . $short . '", "' . $long . '"],';
        }
        $js .= ']);</script>';
        return $js;
    }


    /**
     * Creates Event Name Map using the event ID and the short name of the event.
     * @return string Map.  Event Id, Short Name
     */
    private function getEventNamesJS()
    {
        $js = '<script>dSearch.eventNames = new Map([';
        foreach ($this->eventNames as $eventId => $shortName) {
            $js .= '[' . $eventId . ', "' . $shortName . '"],';
        }
        $js .= ']);</script>';
        return $js;
    }

    /**
     * Creates a Map of Event Labels using the Event ID and the Longer Event Label
     * @return string
     */
    private function getEventLabelsJS()
    {
        $js = '<script>dSearch.eventLabels = new Map([';
        foreach ($this->eventLabels as $eventId => $label) {
            $js .= '[' . $eventId . ', "' . $label . '"],';
        }
        $js .= ']);</script>';
        return $js;
    }

    /**
     * Creates JavaScript that sets var for isLongitudinal.
     * @return string isLongitudinal = true if longitudinal, false otherwise.
     */
    private function getIsLongitudinalJS()
    {
        $isLongitudinal = "false";
        if (REDCap::isLongitudinal()) {
            $isLongitudinal = "true";
        }
        return '<script>dSearch.isLongitudinal = ' . $isLongitudinal . '</script>';
    }

    private function getCSS()
    {
        $cssUrl = '<link  rel="stylesheet" type="text/css" src="' . $this->getCSSUrl() . '"/>';
        return $cssUrl;
    }

    /**
     * Creates all of the scripts are necessary for Dictionary Search
     * @return string  settings, arrays, initializations, etc.  All scripts should be loaded here.
     */
    private function renderScripts()
    {
        $dictionary = '<script>dSearch.dictionary = ' . $this->getDataDictionaryJSON() . ';</script>';
        $jsUrl = '<script src="' . $this->getJSUrl() . '"></script>';
        $designerUrl = '<script>dSearch.designerUrl="' . $this->getOnlineDesignerURL() . '";</script>';
        $designateFormsUrl = '<script>dSearch.designateFormsUrl="' . $this->getDesignateFormsURL() . '";</script>';


        $canAccessDesignerJS = '<script>dSearch.canAccessDesigner=';
        if ($this->canAccessDesigner) {
            $canAccessDesignerJS .= 'true';
        } else {
            $canAccessDesignerJS .= 'false';
        }
        $canAccessDesignerJS .= '</script>';

        $activeTabJS = $this->activeTabOnLoadJS($this->activeTabId);


        $scripts = $this->dSearchJsObject() . PHP_EOL .
            $this->getInstrumentsNamesJS() . PHP_EOL .
            $dictionary . PHP_EOL .
            $jsUrl . PHP_EOL .
            $designerUrl . PHP_EOL .
            $designateFormsUrl . PHP_EOL .
            $canAccessDesignerJS . PHP_EOL .
            $this->getIsLongitudinalJS() . PHP_EOL .
            $activeTabJS . PHP_EOL .
            $this->renderBroadSearchResultsJSON() . PHP_EOL;
        if (REDCap::isLongitudinal()) {
            $scripts .= $this->getEventGridJS($this->eventGrid) . PHP_EOL .
                $this->getEventNamesJS() . PHP_EOL .
                $this->getEventLabelsJS() . PHP_EOL;
        }

        return $scripts;

    }

    /**
     * Creates the global dSearch object
     * @return string creates javascript global dSearch object.
     */
    private function dSearchJsObject()
    {
        return '<script>var dSearch = {};</script>';
    }

    /**
     * Creates a list of autogenerated REDCap variables for each instrument Completed status.
     * set key value array of completed autogenerated REDCap variables.
     * @param $instrumentNames key value array of instrument names.  Short Name => Long Name.
     *
     */
    private function setInstrumentCompleteVar($instrumentNames)
    {
        $this->completedInstrumentVars = [];
        foreach ($instrumentNames as $shortName => $longName) {
            $this->completedInstrumentVars[$shortName] = $shortName . '_complete';
        }
    }

    /**
     * Set eventNames using REDCap method.
     */
    private function setEventNames()
    {
        $this->eventNames = REDCap::getEventNames(true, false);
    }

    /**
     * Set eventLabels using REDCap method.
     */
    private function setEventNameLabels()
    {
        $this->eventLabels = REDCap::getEventNames(false, false);
    }


    /**
     * @param $project_id
     * @param $eventIds array of project numeric event Ids
     * @return |null
     * @throws Exception
     */
    private function setEventGrid($project_id, $eventIds)
    {
        global $project_id;
        // Check if project is longitudinal first
        if (!REDCap::isLongitudinal()) {
            return null;
        }

        $this->eventGrid = [];
        $this->eventGridFlip = [];

        foreach ($eventIds as $eventId) {
            $allFieldsByEvent = REDCap::getValidFieldsByEvents($project_id, $eventId);
            foreach ($this->completedInstrumentVars as $shortName => $complete) {
                $this->eventGrid[$eventId][$shortName] = false;
                $this->eventGridFlip[$shortName][$eventId] = false;
                if (in_array($complete, $allFieldsByEvent)) {
                    $this->eventGrid[$eventId][$shortName] = true;
                    $this->eventGridFlip[$shortName][$eventId] = true;
                }
            }
        }
    }

    private function getEventGrid()
    {
        return $this->eventGrid();
    }

    // TODO the show/hide button is problematic if included here.  What happens if you don't want it.
    //  Do you also include the js to hide/show?
    // However it does the show hide works out well if it the project is not longitudinal.
    /**
     * Creates the eventTable that is visible on the page.
     */
    public function setEventTable()
    {
        $containerOpen = "<div id='eventContainer'>";
        $containerClose = "</div>";
        $eventTableColumnsForms = "<div id='eventsByEvent' class='col-12'>" .
            "<h3>Event Table <em>(Events are rows)</em></h3>" .
            "<table class='table table-bordered table-striped table-hover table-sm table-responsive' id='eventTable'>" .
            "<tr><th></th>";
        foreach ($this->instrumentNames as $shortName => $longName) {
            $eventTableColumnsForms .= "<th data-form-name='" . $shortName . "'>" . $longName . '</th>';
        }
        $eventTableColumnsForms .= "</tr>";

        foreach ($this->eventGrid as $eventId => $formEvents) {

            $eventTableColumnsForms .= "<tr><td data-event='" . $eventId . "'>" .
                $this->eventNames[$eventId] .
                "</td>";
            foreach ($formEvents as $form => $hasEvent) {
                if ($hasEvent) {
                    $eventTableColumnsForms .= "<td>&#10003;</td>";
                } else {
                    $eventTableColumnsForms .= "<td></td>";
                }
            }
            $eventTableColumnsForms .= "</tr>";
        }
        $eventTableColumnsForms .= "</table></div>";

        $eventTableColumnsEvents = "<div id='eventsByInstrument' class='col-12'>" .
            "<h3>Event Table <em>(Instruments are rows)</em></h3>" .
            "<table class='table table-bordered table-striped table-hover table-sm table-responsive' id = 'eventTable2' > " .
            "<thead><tr class='table-warning' ><th></th>";
        foreach ($this->eventLabels as $key => $label) {
            $eventTableColumnsEvents .= "<th>" . $label . "</th>";
        }
        $eventTableColumnsEvents .= "</tr></thead><tbody> ";
        foreach ($this->eventGridFlip as $instrumentShortName => $timePoints) {
            $eventTableColumnsEvents .= "<tr><td>" . $this->instrumentNames[$instrumentShortName] . "</td>";
            foreach ($timePoints as $eventId => $hasEvent) {
                $eventTableColumnsEvents .= "<td>";
                if ($hasEvent) {
                    $eventTableColumnsEvents .= " &#10003;";
                }
                $eventTableColumnsEvents .= "</td>";
            }

            $eventTableColumnsEvents .= "</tr>";
        }

        $eventTableColumnsEvents .= "</tbody></table></div>";
        $this->eventTable = $containerOpen .
            $eventTableColumnsEvents .
            $eventTableColumnsForms .
            $containerClose;
    }

    private function getEventTable()
    {
        return $this->eventTable;
    }

    /**
     * @param $eventGrid php array to be encoded as JSON.
     * @return string creates javascript eventGrid JSON.
     */
    private function getEventGridJS($eventGrid)
    {
        $eventGridJSON = json_encode($eventGrid);
        $eventGrid = '<script>dSearch.eventGrid=' . $eventGridJSON . ';</script>';
        return $eventGrid;
    }

    private function getSearchReportsResult($searchText)
    {
        global $project_id;
        $fuzzyText = "%" . $searchText . "%";
        $html = "<div class='row'><div class='col'><h4 class='text-center'>Reports</h4>";
        $sql = 'SELECT ' .
            'report_id, ' .
            'title, ' .
            'description, ' .
            'orderby_field1, ' .
            'orderby_field2, ' .
            'orderby_field3, ' .
            'advanced_logic, ' .
            'dynamic_filter1, ' .
            'dynamic_filter2, ' .
            'dynamic_filter3  ' .
            'FROM ' .
            'redcap_reports ' .
            'WHERE ' .
            'project_id = ? ' .
            'AND ( title LIKE ? ' .
            'OR description LIKE ? ' .
            'OR orderby_field1 LIKE ? ' .
            'OR orderby_field2 LIKE ? ' .
            'OR orderby_field3 LIKE ? ' .
            'OR advanced_logic LIKE ? ' .
            'OR dynamic_filter1 LIKE ? ' .
            'OR dynamic_filter2 LIKE ? ' .
            'OR dynamic_filter3 LIKE ? )' .
            ';';
        $parameters = [$project_id, $fuzzyText, $fuzzyText, $fuzzyText, $fuzzyText, $fuzzyText, $fuzzyText, $fuzzyText, $fuzzyText, $fuzzyText];
        $result = $this->query($sql, $parameters);
        $html .= $this->renderQueryResults($result);
        return $html;
    }

    private function getSearchReportFieldsResults($searchText)
    {
        global $project_id;
        $fuzzyText = "%" . $searchText . "%";
        $html = "<div class='row'><div class='col'><h4 class='text-center'>Fields in Reports</h4>";
        $sql = 'SELECT ' .
            'redcap_reports.report_id, redcap_reports.title, redcap_reports_fields.field_name ' .
            'FROM ' .
            'redcap_reports ' .
            'INNER JOIN ' .
            'redcap_reports_fields ON redcap_reports.report_id = redcap_reports_fields.report_id ' .
            'WHERE ' .
            'project_id = ? AND field_name LIKE ?;';
        $parameters = [$project_id, $fuzzyText];
        $result = $this->query($sql, $parameters);
        $html .= $this->renderQueryResults($result);
        return $html;
    }

    private function getSearchDQRules($searchText)
    {
        global $project_id;
        $fuzzyText = "%" . $searchText . "%";
        $html = "<div class='row'><div class='col'><h4 class='text-center'>Data Quality Rules</h4>";

        $sql = 'SELECT ' .
            'rule_id, rule_name, rule_logic ' .
            'FROM ' .
            'redcap_data_quality_rules ' .
            'WHERE ' .
            'project_id = ? AND rule_logic like ?;';
        $parameters = [$project_id, $fuzzyText];
        $result = $this->query($sql, $parameters);
        $html .= $this->renderQueryResults($result);
        return $html;

    }

    private function getSearchAlertsResults($searchText)
    {
        global $project_id;
        $fuzzyText = "%" . $searchText . "%";
        $html = "<div class='row'><div class='col'><h4 class='text-center'>Alerts</h4>";

        $sql = 'SELECT ' .
            'alert_id, alert_title, alert_condition, email_subject, alert_message ' .
            'FROM ' .
            'redcap_alerts ' .
            'WHERE ' .
            'project_id = ? AND ' .
            '( alert_condition LIKE ? ' .
            'OR ' .
            'alert_title LIKE ? ' .
            'OR ' .
            'form_name LIKE ? ' .
            'OR ' .
            'email_subject  LIKE ? ' .
            'OR ' .
            'alert_message  LIKE ?);';
        $parameters = [$project_id, $fuzzyText, $fuzzyText, $fuzzyText, $fuzzyText, $fuzzyText];

        $result = $this->query($sql, $parameters);
        $html .= $this->renderQueryResults($result);
        return $html;

    }

    private function getSearchDashboardResults($searchText)
    {
        global $project_id;
        $fuzzyText = "%" . $searchText . "%";
        $html = "<div class='row'><div class='col'><h4 class='text-center'>Dashboards</h4>";

        $sql = 'SELECT ' .
            'rd_id, title, description, filter_logic, sort_field_name ' .
            'FROM ' .
            'redcap_record_dashboards ' .
            'WHERE ' .
            'project_id = ? AND ' .
            '( title LIKE ? ' .
            'OR ' .
            'description LIKE ? ' .
            'OR ' .
            'filter_logic LIKE ? ' .
            'OR ' .
            'sort_field_name LIKE ?);';
        $parameters = [$project_id, $fuzzyText, $fuzzyText, $fuzzyText, $fuzzyText];

        $result = $this->query($sql, $parameters);
        $html .= $this->renderQueryResults($result);
        return $html;

    }

    private function getSearchSurveySettingsResults($searchText)
    {
        global $project_id;
        $fuzzyText = "%" . $searchText . "%";
        $html = "<div class='row'><div class='col'><h4 class='text-center'>Survey Settings</h4>";

        $sql = 'SELECT ' .
            '`survey_id`, ' .
            '`form_name`, ' .
            '`title`,  ' .
            '`instructions`, ' .
            '`acknowledgement`,  ' .
            '`confirmation_email_subject`, ' .
            '`confirmation_email_content` ' .
            'FROM ' .
            'redcap_surveys ' .
            'WHERE ' .
            'project_id = ? AND ' .
            '( form_name LIKE ? ' .
            'OR ' .
            'title  LIKE ? ' .
            'OR ' .
            'instructions  LIKE ? ' .
            'OR ' .
            'acknowledgement  LIKE ? ' .
            'OR ' .
            'confirmation_email_subject  LIKE ? ' .
            'OR ' .
            'confirmation_email_content  LIKE ?);';
        $parameters = [$project_id,
            $fuzzyText,
            $fuzzyText,
            $fuzzyText,
            $fuzzyText,
            $fuzzyText,
            $fuzzyText];


        $result = $this->query($sql, $parameters);
        $html .= $this->renderQueryResults($result);
        return $html;

    }

    private function getSearchASIResults($searchText)
    {
        global $project_id;
        $fuzzyText = "%" . $searchText . "%";
        $html = "<div class='row'><div class='col'><h4 class='text-center'>ASI</h4>";

        $sql = 'SELECT ' .
            'redcap_surveys_scheduler.survey_id, ' .
            'redcap_surveys_scheduler.email_subject, ' .
            'redcap_surveys_scheduler.email_content,  ' .
            'redcap_surveys_scheduler.condition_logic, ' .
            'redcap_surveys.title ' .
            'FROM ' .
            'redcap_surveys_scheduler ' .
            'INNER JOIN ' .
            'redcap_surveys ON redcap_surveys.survey_id = redcap_surveys_scheduler.survey_id ' .
            'WHERE ' .
            'project_id = ? AND ' .
            '(email_subject LIKE ? ' .
            'OR ' .
            'email_content  LIKE ? ' .
            'OR ' .
            'condition_logic  LIKE ? ' .
            ');';
        $parameters = [$project_id,
            $fuzzyText,
            $fuzzyText,
            $fuzzyText];

        $result = $this->query($sql, $parameters);
        $html .= $this->renderQueryResults($result);
        return $html;

    }

    private function renderQueryResults($result)
    {
        $html = "";
        if ($result->num_rows === 0) {
            $html .= "<p>Nothing was found.</p>";
        } else {
            if ($result->num_rows === 1) {
                $html .= "<p>One result.</p>";
            } else {
                $html .= "<p>" . $result->num_rows . " results.</p>";
            }
            while ($row = $result->fetch_assoc()) {
                foreach ($row as $key => $value) {
                    if (!is_null($value)) {
                        $html .= "<strong>" .
                            ucfirst(str_replace("_", " ", $key)) .
                            "</strong>: " .
                            htmlspecialchars($value) .
                            "<br>";
                    }
                }
                $html .= "<hr>";
            }
        }
        $html .= "</div></div>";
        return $html;
    }

    /**
     * @param null $activeTabId Tab Id to open on page load.
     * @return string
     */
    private function activeTabOnLoadJS($activeTabId = "nav-search-tab")
    {
        $js = '<script>dSearch.activeTabId = "' . $activeTabId . '";</script>';
        return $js;
    }

    private function renderBroadResultsHTML()
    {
        $html = "";
        if (isset($_POST['broadSubmit'])) {
            $searchText = $_POST['broadSearchText'];
            if ($searchText !== "") {

                if ($this->userRights['reports'] === "1") {
                    $html .= $this->getSearchReportsResult($searchText);
                    $html .= $this->getSearchReportFieldsResults($searchText);
                }
                if ($this->userRights["data_quality_design"]) {
                    $html .= $this->getSearchDQRules($searchText);
                }
                if ($this->userRights["participants"]) {
                    $html .= $this->getSearchAlertsResults($searchText);
                    $html .= $this->getSearchDashboardResults($searchText);
                    $html .= $this->getSearchSurveySettingsResults($searchText);
                    $html .= $this->getSearchASIResults($searchText);
                }
            }
        }
        return $html;
    }

    private function renderBroadSearchResultsJSON()
    {
        return "<script>broadResultsJSON = " . json_encode($this->broadResultsHTML) . "</script>";
    }
}