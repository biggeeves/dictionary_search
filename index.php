<?php
/** @var DictionarySearch $module */

use DCC\DictionarySearch\DictionarySearch;

require_once APP_PATH_DOCROOT . 'ProjectGeneral/header.php';
if (is_null($module) || !($module instanceof DCC\DictionarySearch\DictionarySearch)) {
    echo "Module Error";
    exit();
}

echo $module->controller();