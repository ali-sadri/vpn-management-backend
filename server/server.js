const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const _ = require("lodash");
const fs = require("fs");

const STRINGS = require("./strings.js");
const utils = require("./utils.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let dataBuffer = fs.readFileSync(STRINGS.DATA_JSON_FILE_PATH);
let dataJSON = dataBuffer.toString();
let data = JSON.parse(dataJSON);

let timerIntervalsBuffer = fs.readFileSync(
  STRINGS.TIMEINTERVALS_JSON_FILE_PATH
);
let timerIntervalsJSON = timerIntervalsBuffer.toString();
let timerIntervals = JSON.parse(timerIntervalsJSON);

const memberExistsInGroup = utils.memberExistsInGroup;
const saveDataToJsonFile = utils.saveDataToJsonFile;
const saveTimeInervalsToJsonFile = utils.saveTimeInervalsToJsonFile;

io.on("connection", (socket) => {
  socket.on("addNewMember", (memberName, columnId, selectedGroup) => {
    try {
      if (memberExistsInGroup(memberName, selectedGroup, data)) {
        socket.emit("addMemberError", STRINGS.MEMBER_EXISTS);
      } else {
        data.groups[selectedGroup].columns[columnId].members.push(memberName);
        data.groups[selectedGroup].members = {
          ...data.groups[selectedGroup].members,
          [memberName]: { id: memberName, checked: false, time: 0 },
        };
        saveDataToJsonFile(data, selectedGroup);
        timerIntervals = {
          ...timerIntervals,
          [memberName]: { id: memberName, timerInterval: null },
        };
        saveTimeInervalsToJsonFile(timerIntervals);
        io.sockets.emit("updateState", data);
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("dnd", (dndData) => {
    try {
      data = dndData;
      saveDataToJsonFile(data, dndData.selectedGroup);
      io.sockets.emit("updateState", data);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("sortColumn", (columnId, selectedGroup) => {
    try {
      let tempArray = data.groups[selectedGroup].columns[columnId].members;
      let sortedArray = tempArray.sort();
      data.groups[selectedGroup].columns[columnId].members = sortedArray;
      saveDataToJsonFile(data, selectedGroup);
      io.sockets.emit("updateState", data);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("deleteMember", (memberId, columnId, selectedGroup) => {
    try {
      let filteredArray = data.groups[selectedGroup].columns[
        columnId
      ].members.filter((elem) => elem !== memberId);
      data.groups[selectedGroup].columns[columnId].members = filteredArray;
      let newMembers = _.omit(data.groups[selectedGroup].members, memberId);
      data.groups[selectedGroup].members = newMembers;
      saveDataToJsonFile(data, selectedGroup);
      let newTimerIntervals = _.omit(timerIntervals, memberId);
      timerIntervals = newTimerIntervals;
      saveTimeInervalsToJsonFile(timerIntervals);
      io.sockets.emit("updateState", data);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("startTimer", (memberId, selectedGroup, columnId) => {
    try {
      data.groups[selectedGroup].members[memberId].checked = true;
      io.sockets.emit("updateButtonState", {
        selectedGroup: selectedGroup,
        id: memberId,
        buttonState: data.groups[selectedGroup].members[memberId].checked,
      });
      timerIntervals[memberId].timerInterval = setInterval(() => {
        data.groups[selectedGroup].members[memberId].time =
          data.groups[selectedGroup].members[memberId].time + 1;
        io.sockets.emit("updateTimer", {
          selectedGroup: selectedGroup,
          id: memberId,
          timerCount: data.groups[selectedGroup].members[memberId].time,
        });
      }, 1000);
      data.groups[selectedGroup].onVpnCount =
        data.groups[selectedGroup].onVpnCount + 1;
      data.groups[selectedGroup].availableVPNs =
        data.groups[selectedGroup].availableVPNs - 1;
      data.groups[selectedGroup].columns[columnId].onVpnInColumn =
        data.groups[selectedGroup].columns[columnId].onVpnInColumn + 1;
      io.sockets.emit("updateStat", {
        selectedGroup: selectedGroup,
        columnId: columnId,
        groupOnVPNCount: data.groups[selectedGroup].onVpnCount,
        groupAvailableVPNs: data.groups[selectedGroup].availableVPNs,
        columnOnVpns:
          data.groups[selectedGroup].columns[columnId].onVpnInColumn,
      });
      saveDataToJsonFile(data, selectedGroup);
    } catch (err) {
      console.log("Failed to update line 194");
    }
  });

  socket.on("stopTimer", (memberId, selectedGroup, columnId, callback) => {
    try {
      data.groups[selectedGroup].members[memberId].checked = false;
      io.sockets.emit("updateButtonState", {
        selectedGroup: selectedGroup,
        id: memberId,
        buttonState: data.groups[selectedGroup].members[memberId].checked,
      });
      clearInterval(timerIntervals[memberId].timerInterval);
      io.sockets.emit("updateTimer", {
        selectedGroup: selectedGroup,
        id: memberId,
        timerCount: data.groups[selectedGroup].members[memberId].time,
      });
      data.groups[selectedGroup].onVpnCount =
        data.groups[selectedGroup].onVpnCount - 1;
      data.groups[selectedGroup].availableVPNs =
        data.groups[selectedGroup].availableVPNs + 1;
      data.groups[selectedGroup].columns[columnId].onVpnInColumn =
        data.groups[selectedGroup].columns[columnId].onVpnInColumn - 1;
      io.sockets.emit("updateStat", {
        selectedGroup: selectedGroup,
        columnId: columnId,
        groupOnVPNCount: data.groups[selectedGroup].onVpnCount,
        groupAvailableVPNs: data.groups[selectedGroup].availableVPNs,
        columnOnVpns:
          data.groups[selectedGroup].columns[columnId].onVpnInColumn,
      });
      if (callback) {
        callback(true);
      }
      saveDataToJsonFile(data, selectedGroup);
    } catch (err) {
      console.log(err);
    }
  });
  socket.emit("init", data);
});

server.listen(process.env.PORT || 3001, () => {
  console.log(`Server is listening on ${server.address().port}.`);
});
