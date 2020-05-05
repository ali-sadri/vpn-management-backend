const _ = require("lodash");
const fs = require("fs");
const STRINGS = require("./strings.js");

module.exports = {
  memberExistsInGroup: (memberName, selectedGroup, data) => {
    let membersArray = Object.keys(data.groups[selectedGroup].members);
    return !!membersArray.find(
      (memberId) =>
        memberId.trim().toLowerCase() === memberName.trim().toLowerCase()
    );
  },

  saveDataToJsonFile: (data, selectedGroup) => {
    //need to reset timers in data before saving...
    let dataParam = _.cloneDeep(data);
    dataParam.groups[selectedGroup].columns.High.onVpnInColumn = 0;
    dataParam.groups[selectedGroup].columns.Medium.onVpnInColumn = 0;
    dataParam.groups[selectedGroup].columns.Low.onVpnInColumn = 0;

    let memberIdsArray = Object.keys(data.groups[selectedGroup].members);
    let newMembers = {};
    memberIdsArray.forEach((memberId) => {
      newMembers[memberId] = { id: memberId, checked: false, time: 0 };
    });
    dataParam.groups[selectedGroup].members = newMembers;

    dataParam.groups[selectedGroup].onVpnCount = 0;
    let availableVPNs = 63;
    switch (selectedGroup) {
      case STRINGS.ITSOLUTIONDELIVERY_GROUP:
        availableVPNs = 63;
        break;
      case STRINGS.BISOVEREIGN_GROUP:
        availableVPNs = 7;
        break;
      case STRINGS.CBS_GROUP:
        availableVPNs = 38;
        break;
      case STRINGS.PCDELIVERY_GROUP:
        availableVPNs = 53;
        break;
      case STRINGS.PCCLAIMS_GROUP:
        availableVPNs = 7;
        break;
      case STRINGS.PCDIGITAL_QA_GROUP:
        availableVPNs = 18;
        break;
      case STRINGS.CLIENTDIGITALSOLUTION_GROUP:
        availableVPNs = 18;
        break;
      case STRINGS.DATA_ANALYTICS_GOVERNANCE_GROUP:
        availableVPNs = 5;
        break;
    }
    dataParam.groups[selectedGroup].availableVPNs = availableVPNs;
    let dataJson = JSON.stringify(dataParam);
    fs.writeFileSync(STRINGS.DATA_JSON_FILE_PATH, dataJson);
  },

  saveTimeInervalsToJsonFile: (timerIntervals) => {
    timerIntervalsKeys = Object.keys(timerIntervals);
    let timerIntervalsCopy = {};
    timerIntervalsKeys.forEach((elem) => {
      timerIntervalsCopy[elem] = { id: elem, timerInteval: null };
    });
    let timerIntervalsJson = JSON.stringify(timerIntervalsCopy);
    fs.writeFileSync(STRINGS.TIMEINTERVALS_JSON_FILE_PATH, timerIntervalsJson);
  },
};
