import { LightningElement, track, wire } from 'lwc';

import getSensorList from '@salesforce/apex/tableController.getSensors';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Delete', name: 'delete' }
]

const cols = [
    { type: 'action', typeAttributes: { rowActions: actions, menuAlignment: 'left' } },
    { label: 'Name', fieldName: 'Name__c' },
    { label: 'Status', fieldName: 'Status__c' },
    { label: 'Sensor model', fieldName: 'Sensor_model__c' },
    { label: 'Base Station', fieldName: 'Base_Station__r.Name__c' }
];

export default class ExportDataToCSVInLWC extends LightningElement {
    @track error;
    @track data;
    @track columns = cols;
    @track deleteList = [];
    @wire(getSensorList)
    wireddata({ error, data }) {
        if (data) {
            alert(' *** ' + JSON.stringify(data));
            this.data = data.map(
                record => Object.assign(
                    { "Base_Station__r.Name__c": (record.Base_Station__c != null && record.Base_Station__c != '') ? record.Base_Station__r.Name__c : '' },
                    record
                )
            );

        }
        else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }


    constructor() {
        super();
        this.getallsensors();
    }

    getallsensors() {
        getSensorList()
            .then(result => {
                this.data = result;
                this.error = undefined;
            })
            .catch(error => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while getting Sensors',
                        message: error.message,
                        variant: 'error'
                    }),
                );
                this.data = undefined;
            });
    }


    downloadCSVFile() {
        let rowEnd = '\n';
        let csvString = '';
        let rowData = new Set();

        this.data.forEach(function (record) {
            Object.keys(record).forEach(function (key) {
                rowData.add(key);
            });
        });

        rowData = Array.from(rowData);

        csvString += rowData.join(',');
        csvString += rowEnd;

        for (let i = 0; i < this.data.length; i++) {
            let colValue = 0;

            for (let key in rowData) {
                if (rowData.hasOwnProperty(key)) {
                    let rowKey = rowData[key];
                    if (colValue > 0) {
                        csvString += ',';
                    }
                    let value = this.data[i][rowKey] === undefined ? '' : this.data[i][rowKey];
                    csvString += '"' + value + '"';
                    colValue++;
                }
            }
            csvString += rowEnd;
        }

        let downloadElement = document.createElement('a');

        downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
        downloadElement.target = '_self';

        downloadElement.download = 'SensorData.csv';
        document.body.appendChild(downloadElement);
        downloadElement.click();
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        switch (action.name) {
            case 'show_details':
                alert('Showing Details: ' + JSON.stringify(row));
                break;
            case 'delete':
                const rows = this.data;
                const rowIndex = rows.indexOf(row);
                rows.splice(rowIndex, 1);
                this.data = rows;
                break;
        }
    }


}