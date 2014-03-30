<?php
if (! defined('BASEPATH')) exit('No direct script access allowed');

class Registrations_model extends MY_Model{
    
    public $_database      = 'database_name';   
    public $_table         = 'tbl_Registrations';
    public $primary_key    = 'fld_Registration_ID'; 
    public $before_create  = array('timestamps');
    public $after_get      = array('formatData');

    //Match form names with Registration types in the database
    public $RegistrationTypes      = array('frmRequestRepCall'          =>1, 
                                           'frmRequestUpdates'          =>2, 
                                           'frmPatientSavingsProgram'   =>3, 
                                           'frmOptedOut'                =>4);

    //Match form field names with tbl_registrations fields in the database
    public $Registrationfieldlist  = array( 'WebMethod'     =>'fld_Registration_Type_ID',
                                        'FirstName'         =>'fld_First_Name',
                                        'LastName'          =>'fld_Last_Name',
                                        'Address'           =>'fld_Address1',
                                        'Address2'          =>'fld_Address2',
                                        'City'              =>'fld_City',
                                        'State'             =>'fld_State',
                                        'Zip'               =>'fld_Zip',
                                        'Phone'             =>'fld_Phone_Number',
                                        'Email'             =>'fld_Email_Address',
                                        'ContactRep'        =>'fld_PrefContact_Territory_Manager',
                                        'ContactPhone'      =>'fld_PrefContact_Phone',
                                        'ContactEmail'      =>'fld_PrefContact_Email'); 

    //Match form field names with tbl_unsubscribe fields in the database
    public $UnsubscribeFieldList  =  array('Email'              =>'fld_Email_Address',
                                        'HealthRelated'         =>'fld_OptOut_Health_Related',
                                        'ProductInformation'    =>'fld_OptOut_Product_Info',
                                        'MarketResearch'        =>'fld_OptOut_Market_Research');

        
    public function __construct(){  
        parent::__construct();
                    
    }   
    

    public function get_registration($id){

        $condition['fld_Registration_ID'] = $id;
        $query = $this->search($condition); 
      
        return $query->row_array();     
    }

    public function get_registrations(){
                
        $query = $this->as_array()->get_all();      
        
        return $query;      
    }

    
    public function insert_registration($posted){

        log_message('DEBUG','insert_registration',$posted); 

        //Load helper
        $this->load->helper('array');

        //Get Registration Type ID
        $posted['WebMethod'] = element($posted['WebMethod'], $this->RegistrationTypes);

        //Check to see if method is Unsubscribe
        if($posted['WebMethod'] === 4){

            $this->_table = 'tbl_unsubscribe';
            $this->primary_key = 'fld_unsubscribe_id';

            //Merge form fields array with database fields
            $fields = $this->merge_dbfields_array($this->UnsubscribeFieldList, $posted, NULL);
        }
        else{
            
            //Merge form fields array with database fields
            $fields = $this->merge_dbfields_array($this->Registrationfieldlist, $posted, NULL);
        }   
        
        //insert fields into the database
        $query = $this->insert($fields);             
      
        return $query;
    }


    function timestamps($record) {
        $record['fld_Date_Created'] = date('Y-m-d H:i:s');
        return $record;
    }

    function formatData($record) {
        $record['fld_Date_Created'] = date_format($record['fld_Date_Created'], 'm-d-Y g:i A');
        return $record;
    }
    

    function merge_dbfields_array($fieldlist, $formlist, $default = FALSE){
        $return = array();
        
        if (! is_array($fieldlist)){
            $fieldlist = array($fieldlist);
        }
        
        foreach ($fieldlist as $item=>$value){
            if (isset($formlist[$item]))
            {
                $return[$value] = $formlist[$item];
            }
            else
            {
                $return[$value] = $default;
            }
        }       
        return $return;
    }       

}
