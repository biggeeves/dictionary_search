<?php
/** @var DictionarySearch $module */

use DCC\DictionarySearch\DictionarySearch;

require_once APP_PATH_DOCROOT . 'ProjectGeneral/header.php';
if (is_null($module) || !($module instanceof DCC\DictionarySearch\DictionarySearch)) {
    echo "Module Error";
    exit();
}

echo $module->controller();

if (!isset($project_id)) {
    die ('Project ID is required');
}
if (isset($_POST['broadSubmit'])) {
    $text = $_POST['broadSearchText'];
    // <script>alert('hi')</script>B
    echo "<div class='row'><div class='col'><p>User Has submitted the form and is searching for : <b> " .
        htmlspecialchars($text) . "</b></p></div></div>";
    $sql = 'SELECT ' .
        'redcap_reports.report_id, redcap_reports.title, redcap_reports_fields.field_name ' .
        'FROM ' .
        'redcap_reports ' .
        'INNER JOIN ' .
        'redcap_reports_fields ON redcap_reports.report_id = redcap_reports_fields.report_id ' .
        'WHERE ' .
        'project_id = ? and field_name like ?;';
    $parameters = [$project_id, '%' . $text . '%'];
    $varInRepors = $module->query($sql, $parameters);
    echo "<p>results</p>";
    while ($row = $varInRepors->fetch_assoc()) {
        echo "The field: <strong>" . $row["field_name"] . "</strong> report id: " . $row["report_id"] . " title: " . $row["title"] . "<br>";
    }


}