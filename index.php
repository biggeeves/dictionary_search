<?php
/** @var DictionarySearch $module */

use DCC\DictionarySearch\DictionarySearch;

require_once APP_PATH_DOCROOT . 'ProjectGeneral/header.php';
if (is_null($module) || !($module instanceof DCC\DictionarySearch\DictionarySearch)) {
    echo "Module Error";
    exit();
}

echo $module->controller();

/*echo "<hr>";
echo "Project ID: " . $module->getProjectId() . "<br>";
echo "Record ID: " . $module->getRecordId() . "<br>";

$user = $module->framework->getRepeatingForms(166, 30);
$value = $module->getSafePath([166, 30]);
$value = $module->getEventId();
$value = $module->isPage("Yuck");
$value = $module->importDataDictionary(30,"ha");
$value = $module->createQuery("Yuck");
$value = $module->framework->createQuery("ha", "hav", []);
$value = $module->query("Yuck");

echo "User: <br>";
echo "<pre>";
echo $user;
echo "</pre>";

$value = $module->getProjectId();
print_r($value);

echo "<br>The time is " . date("h:i:sa");

echo "<hr>";

$t = $module->getRepeatingForms( 'baseline_arm_1', 30);

print_r($t);
*/

