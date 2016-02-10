/**
 * Created by Gouri on 1/13/2016.
 */
var CPMLib = {};


CPMLib.createTaskStoreFunction = function (data) {

    var schedulingData = [];

    var schedulingTextArray = data.split("\r\n");
    var headers = schedulingTextArray[0].split(',');

    for (var k = 1; k < schedulingTextArray.length; k++) {
        schedulingData[k - 1] = schedulingTextArray[k].split(',');
    }
    schedulingData.pop();

    for (var k = 0; k < schedulingData.length; k++){
        var predecessorElement = schedulingData[k][2];
        predecessorElement = predecessorElement.split('&');

        var index = predecessorElement.indexOf("NONE")
        if (index > -1) {
            predecessorElement.splice(index, 1);
        }
        schedulingData[k][2] = predecessorElement;
        schedulingData[k][3] = parseInt(schedulingData[k][3]);
    }

    var taskStore = {};

    for (var i = 0; i < schedulingData.length; i++) {
        var tempObj = {};
        for (var j = 0; j < headers.length; j++) {
            tempObj[headers[j]] = schedulingData[i][j];

        }
        taskStore['task' + schedulingData[i][0]] = tempObj;

    }
    for (var i = 0; i < schedulingData.length; i++) {
        taskStore['task' + schedulingData[i][0]]["PREDECESSOR"] = [];
        taskStore['task' + schedulingData[i][0]]["SUCCESSOR"] = [];
    }

    for (var i = 0; i < schedulingData.length; i++){
        for(j = 0; j<schedulingData[i][2].length; j++) {
            taskStore['task' + schedulingData[i][0]][headers[2]][j] = taskStore['task' + schedulingData[i][2][j]];
            taskStore['task' + schedulingData[i][2][j]]["SUCCESSOR"].push(taskStore['task' + schedulingData[i][0]]);
        }
    }
    return taskStore;
}

CPMLib.subset = function(subset,set){

    for(var i = 0; i<subset.length; i++){
        if(set.indexOf(subset[i]) === -1){
            return false;
        }
    }
    return true;
}

CPMLib.topologicalSort = function(taskContainer){
    var topologyArray = [];
    var taskContainerArray = Object.keys(taskContainer);

    while(taskContainerArray.length !== topologyArray.length) {
        for (var i = 0; i < taskContainerArray.length; i++) {
            var isSubset = CPMLib.subset(taskContainer[taskContainerArray[i]]["PREDECESSOR"], topologyArray);
            if((isSubset === true)&&(topologyArray.indexOf(taskContainer[taskContainerArray[i]]) === -1)) {
                topologyArray.push(taskContainer[taskContainerArray[i]]);
            }
        }
    }
    return topologyArray;
}

CPMLib.cpmForwardPassCalc = function(taskSequenceArray){
    for(var i = 0; i<taskSequenceArray.length; i++){

        var precedenceArray = taskSequenceArray[i]["PREDECESSOR"];
        var arrayOfEF = [];

        if(precedenceArray.length === 0){
            taskSequenceArray[i].ES = 0;
            taskSequenceArray[i].EF = taskSequenceArray[i]["DURATION"];
        }
        else {
            for (var j=0; j<precedenceArray.length; j++) {
                arrayOfEF.push(precedenceArray[j]["EF"]);
            }
            taskSequenceArray[i].ES = Math.max.apply(Math, arrayOfEF);
            taskSequenceArray[i].EF = taskSequenceArray[i].ES + taskSequenceArray[i]["DURATION"];
        }
    }
    return taskSequenceArray;
}

CPMLib.cpmBackwardPassCalc = function(forwardPassArray){
    var tempArrayOfEF = [];

    for(var i = forwardPassArray.length - 1; i>=0;  i--) {
        var successorArray = forwardPassArray[i]["SUCCESSOR"];

        if (successorArray.length === 0) {
            tempArrayOfEF.push(forwardPassArray[i].EF);
        }
    }

    for(var i = forwardPassArray.length - 1; i>=0;  i--) {
        successorArray = forwardPassArray[i]["SUCCESSOR"];
        var arrayOfLS = [];

        if (successorArray.length === 0) {
            forwardPassArray[i].LF = Math.max.apply(Math, tempArrayOfEF);
            forwardPassArray[i].LS = forwardPassArray[i].LF - forwardPassArray[i]["DURATION"];
        }
        else{
            for(var j=0; j<successorArray.length; j++){
                arrayOfLS.push(successorArray[j]["LS"]);
            }
            forwardPassArray[i].LF = Math.min.apply(Math, arrayOfLS);
            forwardPassArray[i].LS = forwardPassArray[i].LF - forwardPassArray[i]["DURATION"];
        }
    }
    return forwardPassArray;
}


CPMLib.slackCalc = function(CPMParametersArray){

    for(var i = 0; i<CPMParametersArray.length; i++){
        CPMParametersArray[i].Totalfloat = CPMParametersArray[i].LF - CPMParametersArray[i].EF;

        if(CPMParametersArray[i].Totalfloat === 0){
            document.getElementById("para1").innerHTML = document.getElementById("para1").innerHTML + "Task "+ CPMParametersArray[i]["ACTIVITY"] + " is on Critical Path. <br>"
        }
    }
    return CPMParametersArray;
}
