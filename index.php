<?php
/** @var DictionarySearch $module */

use DCC\DictionarySearch\DictionarySearch;

require_once APP_PATH_DOCROOT . 'ProjectGeneral/header.php';
if (is_null($module) || !($module instanceof DCC\DictionarySearch\DictionarySearch)) {
    echo "Module Error";
    exit();
}

echo $module->initialize();
echo $module->renderForm();

$recordIdField = REDCap::getRecordIdField();

echo '<script>const dictionary = ' . $module->getDataDictionary() . ';</script>' . PHP_EOL;
echo '<script src="' . $module->getJSUrl() . '"></script>';
echo '<script> designerUrl="' . $module->getOnlineDesignerURL() . '"</script>';

// Get URL Parameters
$debug = intval(filter_input(INPUT_GET, 'debug', FILTER_SANITIZE_SPECIAL_CHARS));
$raw = intval(filter_input(INPUT_GET, 'raw', FILTER_SANITIZE_SPECIAL_CHARS));