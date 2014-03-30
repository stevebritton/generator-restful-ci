<?php defined('BASEPATH') OR exit('No direct script access allowed');
require APPPATH.'/libraries/REST_Controller.php';

class Registrations extends REST_Controller
{

    
     function registration_post(){
      
        log_message('DEBUG','registration_post');        
        
        $this->load->model('Registrations_model','database');

        $data = $this->post();        

        $result = $this->database->insert_registration($data);

        log_message('DEBUG','Response: '.  $result);       
        

        if($result === FALSE){
            $this->response(array('status' => 'failed'));
        }         
        else{
            $this->response(array('status' => 'success'));
        }
    }    
}