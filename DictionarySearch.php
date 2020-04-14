<?php

namespace DCC\DictionarySearch;

use Exception;
use ExternalModules\AbstractExternalModule;
use \REDCap as REDCap;
use \Security as Security;

/** todo
 * Change required, custom alignment, identifier to appropriate drop downs (if needed)
 * Check to see if someone can go to the Online Designer
 * $allow_edit = ($user_rights['design'] && ($status == '0' || ($status == '1' && $draft_mode == '1')));
 * // include a debug variable in the url
 * // $debug = intval(filter_input(INPUT_GET, 'debug', FILTER_SANITIZE_SPECIAL_CHARS));
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
    private $dataDictionary;

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

        echo $this->renderForm();

        echo $this->renderScripts();

    }


    /**
     * @param null $project_id
     * @return null
     * @throws Exception
     */
    private function setDataDictionaryJSON($project_id = null)
    {
        if (is_null($project_id)) {
            return null;
        }
        $this->dataDictionary = REDCap::getDataDictionary($project_id, 'json');
    }

    /**
     * @return string[]
     */
    private function getDataDictionary()
    {
        return $this->dataDictionary;
    }


    /**
     * The URL to the JavaScript that powers the HTML search form.
     *
     * @return string
     */
    private function getJSUrl()
    {
        return $this->getUrl("js/search.js");
    }

    /**
     * URL to the instrument in the Online Designer.
     *
     * @return string
     */
    private function getOnlineDesignerURL()
    {
        global $redcap_base_url, $redcap_version, $project_id;
        return $redcap_base_url . 'redcap_v' . $redcap_version . '/Design/online_designer.php?pid=' . $project_id;
    }

    /**
     * @return string
     */
    private function renderForm()
    {
        $contents = file_get_contents(__DIR__ . '/html/form.html');
        if ($contents === false) {
            return 'HTML form not found';
        }
        return $contents;
    }

    private function renderScripts()
    {
        $dictionary = '<script>const dictionary = ' . $this->getDataDictionary() . ';</script>';
        $jsUrl = '<script src="' . $this->getJSUrl() . '"></script>';
        $designerUrl = '<script> designerUrl="' . $this->getOnlineDesignerURL() . '"</script>';
        return $dictionary . $jsUrl . $designerUrl;
    }
}
