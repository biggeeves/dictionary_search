<?php
/** @var DataDictionarySearch $module */

use DCC\DataDictionarySearch\DataDictionarySearch;

require_once APP_PATH_DOCROOT . 'ProjectGeneral/header.php';
echo $module->getForm();
echo $module->feedbackDiv();
echo $module->resultsDiv();

// Create the data dictionary
$module->setProjectId($project_id);
$module->makeDataDictionary();
$module->setDataDictionaryJSON();
$dictJSON = $module->getDataDictionary();

echo '<script>const dictionary = ' . $dictJSON . ';</script>' . PHP_EOL;
echo '<script src="' . $module->getJSUrl() . '"></script>';
echo '<script> durl="' . $module->getOnlineDesignerURL() . '"</script>';

// Get the project's Record ID field
$recordIdField = REDCap::getRecordIdField();

$mins = $module->getFieldMins();
$maxs = $module->getFieldMaxs();


// Get URL Parameters
$debug = intval(filter_input(INPUT_GET, 'debug', FILTER_SANITIZE_SPECIAL_CHARS));
$raw = intval(filter_input(INPUT_GET, 'raw', FILTER_SANITIZE_SPECIAL_CHARS));

// Sanitize inputs
/*if (!Security::hasInclusionIn($debug, [1, 2])) {
    $debug = 0;
}
if ($raw != 1) {
    $raw = 0;
}*/
