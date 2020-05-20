<?php

namespace DCC\DictionarySearch;

use Exception;
use ExternalModules\AbstractExternalModule;
use \REDCap as REDCap;
use \Security as Security;

/** todo
 * Change custom alignment to appropriate drop downs (if needed)
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
        $userRights = REDCap::getUserRights(USERID);

        $this->canAccessDesigner();

        $this->setEventNames();
        $this->setEventNameLabels();

        $this->setInstrumentCompleteVar($this->instrumentNames);

        $this->setEventGrid($project_id, array_keys($this->eventNames));

        $this->renderForm();

        if (REDCap::isLongitudinal()) {
            $this->setEventTable();
            echo $this->getEventTable();
        }

        echo $this->renderScripts();

    }

    private function canAccessDesigner()
    {
        global $draft_mode;  // 1=Draft Mode
        global $status;  // 0=Design Mode, 1=Production
        $userRights = REDCap::getUserRights(USERID);
        $user = array_shift($userRights);

        // No rights until proven.
        $this->canAccessDesigner = false;

        if ($status == 0 || $draft_mode == 1) {
            if ($user['design'] == 1) {
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
     * echo contents of form.html.
     * @return string
     */
    private function renderForm()
    {
        $contents = file_get_contents(__DIR__ . '/html/form.html');
        if ($contents === false) {
            return 'HTML form not found';
        }
        echo $contents;
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

    /**
     * Creates all of the scripts are necessary for Dictionary Search
     * @return string  settings, arrays, initializations, etc.  All scripts should be loaded here.
     */
    private function renderScripts()
    {
        $dictionary = '<script>dSearch.dictionary = ' . $this->getDataDictionaryJSON() . ';</script>';
        $jsUrl = '<script src="' . $this->getJSUrl() . '"></script>';
        $designerUrl = '<script>dSearch.designerUrl="' . $this->getOnlineDesignerURL() . '";</script>';
        $canAccessDesignerJS = '<script>dSearch.canAccessDesigner=';
        if ($this->canAccessDesigner) {
            $canAccessDesignerJS .= 'true';
        } else {
            $canAccessDesignerJS .= 'false';
        }
        $canAccessDesignerJS .= '</script>';

        $scripts = $this->dSearchJsObject() . PHP_EOL .
            $this->getInstrumentsNamesJS() . PHP_EOL .
            $dictionary . PHP_EOL .
            $jsUrl . PHP_EOL .
            $designerUrl . PHP_EOL .
            $canAccessDesignerJS . PHP_EOL .
            $this->getIsLongitudinalJS() . PHP_EOL;
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
        /*        $eventTableColumnsForms = "<button onclick='dSearch.toggleEventTable()' id='toggleEventTable' class='btn btn-defaultrc'".
                    " title='Show/Hide Event Table'>Hide Event Table</button>";

                $eventTableColumnsForms .= "<table class='table table-bordered' id='eventTable'><tr><td>Event</td>";
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
                $eventTableColumnsForms .= "</table>";*/

        $eventTableColumnsEvents = "<div class='table-responsive col-12'>" .
            "<button onclick='dSearch.toggleEventTable()' id='toggleEventTableBtn2' class='btn btn-defaultrc' title='Show/Hide Event Table'>Toggle Event Table Visibility</button><br>" .
            "<table class='table table-bordered table-striped table-hover table-sm' id = 'eventTable2' > " .
            "<thead><tr class='table-warning' ><th>Instruments \ Events</th>";
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
        $this->eventTable = $eventTableColumnsEvents;
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
}