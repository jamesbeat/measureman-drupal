<?php
/**
 * @file
 * Pixlr Express editor for Image Editor module.
 */

/**
 * Plugin declaration.
 */
$plugin = array(
  'name' => t('Measure Man'),
  'description' => t('Measuring Tool'),
  'class' => 'measureman',
  'site' => '...',
  'api_key' => FALSE,
  'image_creation' => TRUE,
  'launch_type' => 'overlay',
  'image_url_param' => 'image',
  'options' => array(
    'exit' => url(imageeditor_ajax_close_path() . '/measureman', array('absolute' => TRUE)),
    //'referrer' => 'Drupal: ' . url('', array('absolute' => TRUE)),
    'referrer' => 'Drupal',
    'credentials' => 'false',
    'target' => url(imageeditor_ajax_save_path() . '/measureman', array('absolute' => TRUE)),
  ),
  'initialize_callback' => 'imageeditor_measureman_initialize_callback',
  'save_callback' => 'imageeditor_measureman_save_callback',
  'js' => 'measureman.js',
  'css' => 'measureman.css',
);

function imageeditor_measureman_initialize_callback(&$editor) {

   watchdog('measureman', 'INITIAL AJAX CALLBACK');	
	
  global $user, $language, $is_https;
  $editor['options']['launch_url'] = 'http://localhost/drop/'.drupal_get_path('module', 'imageeditor').'/plugins/editor/measureman/measureman/index.html';
  $editor['options']['loc'] = property_exists($user, 'language') ? $user->language : $language->language;
}

function imageeditor_measureman_save_callback() {
	
  watchdog('measureman', 'Recieved AJAX CALLBACK');	
	
  $image = '';
  if (isset($_GET['image'])) {
    $directory = imageeditor_temporary_directory();
    $data = drupal_http_request(rawurldecode($_GET['image']));
    $destination = $directory . '/' . $_GET['title'] . '.' . $_GET['type'];
    $file = file_unmanaged_save_data($data->data, $destination, FILE_EXISTS_REPLACE);
    $image = file_create_url($file);
    
    //watchdog('measureman',kprint_r($_GET, TRUE, NULL));
    //watchdog('measureman',kprint_r($data, TRUE, NULL));
  }
  $js_code = 'if (parent) {';
  $js_code .= 'parent.Drupal.settings.imageeditor.save.image = "' . $image . '";';
  $js_code .= 'parent.Drupal.imageeditor.save();';
  $js_code .= 'parent.Drupal.imageeditor.overlay.hide();';
  $js_code .= '}';
  drupal_add_js($js_code, 'inline');
}
