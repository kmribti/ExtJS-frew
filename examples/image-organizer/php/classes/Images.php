<?
class Images {
    function listall(){
        return 'lots';
    }

    function upload($data){
        if(!is_numeric($num)){
            throw new Exception('Call to multiply with a value that is not a number');
        }
        return $num*8;
    }
}
?>