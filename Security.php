<?php

namespace DCC\DataDictionarySearch;

/**
 * Helper functions.  Could have gone in global space
 * name spaced for this project avoid future collisions
 *
 * @author Greg Neils gn2003@cumc.columbia.edu
 */
class Security
{

    private $errors = array();

// Make sanitizing easy and you will do it often
// Sanitize for HTML output 
    static function h($string)
    {
        return htmlspecialchars($string);
    }

// Sanitize for JavaScript output
    static function j($string)
    {
        return json_encode($string);
    }

// Sanitize for use in a URL
    static function u($string)
    {
        return urlencode($string);
    }

// Remove HTML entities
    static public function s($string)
    {
        return strip_tags($string);
    }

    static public function allowedGetParams($allowed_params = [])
    {
        $allowed_array = [];
        foreach ($allowed_params as $param) {
            if (isset($_GET[$param])) {
                $allowed_array[$param] = $_GET[$param];
            } else {
                $allowed_array[$param] = NULL;
            }
        }
        return $allowed_array;
    }

    static public function allowedPostParams($allowed_params = [])
    {
        $allowedArray = [];
        foreach ($allowed_params as $param) {
            if (isset($_POST[$param])) {
                $allowedArray[$param] = $_POST[$param];
            } else {
                $allowedArray[$param] = NULL;
            }
        }
        return $allowedArray;
    }

// * validate value has presence
// use trim() so empty spaces don't count
// use === to avoid false positives
// empty() would consider "0" to be empty
    static public function hasPresence($value)
    {
        $trimmedValue = trim($value);
        return isset($trimmedValue) && $trimmedValue !== "";
    }

    static public function validatePresences($requiredFields)
    {
        $errors = [];
        foreach ($requiredFields as $field) {
            $value = trim($_POST[$field]);
            if (!has_presence($value)) {
                $errors[$field] = fieldname_as_text($field) . " can't be blank.";
            }
        }
        return $errors;
    }

// * validate value has string length
// leading and trailing spaces will count
// options: exact, max, min
// has_length($first_name, ['exact' => 20])
// has_length($first_name, ['min' => 5, 'max' => 100])
    static public function hasLength($value, $options = [])
    {
        if (isset($options['max']) && (strlen($value) > (int)$options['max'])) {
            return false;
        }
        if (isset($options['min']) && (strlen($value) < (int)$options['min'])) {
            return false;
        }
        if (isset($options['exact']) && (strlen($value) != (int)$options['exact'])) {
            return false;
        }
        return true;
    }

    static public function validateMaxLengths($fieldsWithMaxLengths = [])
    {
        $errors = [];
        // Expects an assoc. array
        foreach ($fieldsWithMaxLengths as $field => $max) {
            $value = trim($_POST[$field]);
            $options = array("max" => $max);
            if (!has_length($value, $options)) {
                $errors[$field] = fieldname_as_text($field) . " is too long";
            }
        }
        return $errors;
    }

// * validate value has a format matchin a regular expression
// Be sure to use anchor expressions to match start and end of string.
// (Use \A and \Z not ^ and $ which allow line returns.)
// Examples:
// has_format_matching('1234', '/\d{4}/') is true
// has_format_matching('12345', '/\d{4}/') is also true
// has_format_matching('12345', '/\A\d{4}\Z/') is false
    static public function hasFormatMatching($value, $regex = '//')
    {
        return preg_match($regex, $value);
    }

// * validate value is a number
// submitted values are strings, so use is_numeric instead of is_int
// options: max, min
// has_number($items_to_order, ['min' => 1, 'max' => 5])
    static public function hasNumber($value, $options = [])
    {
        if (!is_numeric($value)) {
            return false;
        }
        if (isset($options['max']) && ($value > (int)$options['max'])) {
            return false;
        }
        if (isset($options['max']) && ($value < (int)$options['min'])) {
            return false;
        }
        return true;
    }

// * validate value is included in a set
    static public function hasInclusionIn($value, $set = [])
    {
        return in_array($value, $set);
    }

// * validate value is excluded from a set 
    static public function hasExclusionIn($value, $set = [])
    {
        return !in_array($value, $set);
    }

// * validate uniqueness
// A common validation, but not an easy one to write generically.
// Requires going to the database to check if value is already present.
// Implementation depends on your database set-up.
// Instead, her is a mock-up of the concept.
// Be sure to escape the user-provided value before sending it to the database
// Table and column will be provided by us and escaping them is optional.
// Also consider whether you want to trim whitespace, or make the query case-sensitive or not.
// 
// function has_uniqueness($value, $table, $column) {
//   $escaped_value = mysql_escape($value);
//    sql = "SELECT COUNT(*) as count FROM {$table} WHERE {$column} = '{escaped_value}';"
// if count > 0 then value is already present and not unique
// }
// ---------------------------------------------
// GET requests should not make changes
// Only POST requests should make changes

    static public function requestIsGet()
    {
        return $_SERVER['REQUEST_METHOD'] === 'GET';
    }

    static public function requestIsPost()
    {
        return $_SERVER['REQUEST_METHOD'] === 'POST';
    }

    /* Usage: 
      if(request_is_post()) {
      ... process form, update database, etc.
      } else {
      ... do something safe, redirect, error page, etc
      }
     */

    static function userHasRights($user_rights)
    {
        $rights = array_shift($user_rights);
        if ($rights['design'] == "1") {
            $has_rights = true;
        } else if ($rights['reports']) {
            $has_rights = true;
        } else if ($rights['graphical']) {
            $has_rights = true;
        } else {
            $has_rights = false;
        }
        return $has_rights;
    }

    static function userInProject($this_user, $project_users)
    {
        if (!in_array($this_user, $project_users)) {
            return false;
        }
        return true;
    }

}
