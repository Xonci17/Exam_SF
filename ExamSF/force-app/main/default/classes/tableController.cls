public with sharing class tableController {
    
    @AuraEnabled(Cacheable = true)
    public static List<Sensor__c> getSensors(){
      return [ SELECT Name__c, Status__c, Sensor_model__c, Base_Station__r.Name__c FROM Sensor__c];
    }  
    
}