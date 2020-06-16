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
    $fuzzyText = '%' . $text . '%';

    echo "<div class='row'><div class='col'><p>User Has submitted the form and is searching for : <b> " .
        htmlspecialchars($text) . "</b></p></div></div>";

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
    $varInRepors = $module->query($sql, $parameters);
    echo "<div class='row'><div class='col'><h4>Reports</h4>";
    while ($row = $varInRepors->fetch_assoc()) {
        echo "The field: <strong>" . $row["field_name"] .
            "</strong> report id: " . $row["report_id"] .
            " title: " . $row["title"] .
            " description: " . htmlspecialchars($row["description"]) . "<br>" .
            " orderby_field1: " . htmlspecialchars($row["orderby_field1"]) . "<br>" .
            " orderby_field2: " . htmlspecialchars($row["orderby_field2"]) . "<br>" .
            " orderby_field3: " . htmlspecialchars($row["orderby_field3"]) . "<br>" .
            " advanced_logic: " . htmlspecialchars($row["advanced_logic"]) . "<br>" .
            " dynamic_filter1: " . htmlspecialchars($row["dynamic_filter1"]) . "<br>" .
            " dynamic_filter2: " . htmlspecialchars($row["dynamic_filter2"]) . "<br>" .
            " dynamic_filter3: " . htmlspecialchars($row["dynamic_filter3"]) . "<hr>";
    }
    echo "</div></div>";
    /* Report Fields */

    $sql = 'SELECT ' .
        'redcap_reports.report_id, redcap_reports.title, redcap_reports_fields.field_name ' .
        'FROM ' .
        'redcap_reports ' .
        'INNER JOIN ' .
        'redcap_reports_fields ON redcap_reports.report_id = redcap_reports_fields.report_id ' .
        'WHERE ' .
        'project_id = ? AND field_name LIKE ?;';
    $parameters = [$project_id, $fuzzyText];
    $varInRepors = $module->query($sql, $parameters);
    echo "<div class='row'><div class='col'><h4>Fields in Reports</h4>";
    while ($row = $varInRepors->fetch_assoc()) {
        echo "The field: <strong>" . $row["field_name"] .
            "</strong> report id: " . $row["report_id"] .
            " title: " . $row["title"] . "<hr>";

    }

    $sql = 'SELECT ' .
        'rule_id, rule_name, rule_logic ' .
        'FROM ' .
        'redcap_data_quality_rules ' .
        'WHERE ' .
        'project_id = ? AND rule_logic like ?;';
    $parameters = [$project_id, $fuzzyText];
    $varInRepors = $module->query($sql, $parameters);
    echo "<h4>Data Quality Rules</h4>";
    while ($row = $varInRepors->fetch_assoc()) {
        echo "Rule Name: <strong>" . $row["rule_name"] . "</strong>" .
            " Rule id: " . $row["rule_id"] . " Title: " . $row["rule_logic"] . "<hr>";
    }
    echo "</div></div>";

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
    $varInRepors = $module->query($sql, $parameters);
    echo "<div class='row'><div class='col'><h4>Alerts</h4>";
    while ($row = $varInRepors->fetch_assoc()) {
        echo "Alert Name: <strong>" . $row["alert_title"] . "</strong>" .
            " Alert id: " . $row["alert_id"] .
            " Title: " . $row["alert_title"] . "<br>" .
            " Form Name: " . $row["form_name"] . "<br>" .
            " Alert condition: " . $row["alert_condition"] . "<br>" .
            " Email Subject: " . $row["email_subject"] . "<br>" .
            " Alert Message: " . htmlspecialchars($row["alert_message"]) . "<br>" .
            "<hr>";
    }
    echo "</div></div>";


    /* Record Status Dashboards */
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
    $varInRepors = $module->query($sql, $parameters);
    echo "<div class='row'><div class='col'><h4>Record Status Dashboards</h4>";
    while ($row = $varInRepors->fetch_assoc()) {
        echo "Title: <strong>" . $row["title"] . "</strong>" .
            " Dashboard id: " . $row["rd_id"] .
            " description: " . $row["description"] . "<br>" .
            " Filter Logic: " . $row["filter_logic"] . "<br>" .
            " Sort field name: " . $row["sort_field_name"] . "<br>" .
            "<hr>";
    }
    echo "</div></div>";

    // todo limit shown results to specific columns instead of all columns
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
    $varInRepors = $module->query($sql, $parameters);
    echo "<div class='row'><div class='col'><h4>Survey Settings</h4>";
    while ($row = $varInRepors->fetch_assoc()) {
        echo "Form Name: <strong>" . $row["form_name"] . "</strong>" .
            " Survey id: " . $row["survey_id"] .
            " Title: " . $row["title"] . "<br>" .
            " Instructions: " . htmlspecialchars($row["instructions"]) . "<br>" .
            " Acknowledgement: " . htmlspecialchars($row["acknowledgement"]) . "<br>" .
            " Confirmation email subject: " . htmlspecialchars($row["confirmation_email_subject"]) . "<br>" .
            " Confirmation email content: " . htmlspecialchars($row["confirmation_email_content"]) . "<br>" .
            "<hr>";
    }
    echo "</div></div>";


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
    $varInRepors = $module->query($sql, $parameters);
    echo "<div class='row'><div class='col'><h4>Survey Scheduler / ASI?</h4>";
    while ($row = $varInRepors->fetch_assoc()) {
        echo "Form Name: <strong>" . $row["form_name"] . "</strong>" .
            " Survey id: " . $row["survey_id"] .
            " title: " . $row["title"] . "<br>" .
            " Email subject: " . $row["email_subject"] . "<br>" .
            " Email content: " . htmlspecialchars($row["email_content"]) . "<br>" .
            " Condition logic: " . htmlspecialchars($row["condition_logic"]) . "<br>" .
            "<hr>";
    }
    echo "</div></div>";


}