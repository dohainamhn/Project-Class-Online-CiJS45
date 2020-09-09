const agora = {};
agora.uuid = () => {};
agora.sdkToken =
  "NETLESSSDK_YWs9Y1ZfQlRBMEcxekc5S19NbiZub25jZT0xNTk3NjEwMTAxNDE2MDAmcm9sZT0wJnNpZz1lMjU0MTQ4MWQzZDhhOTUyYTEzYTMxOTE2YjI5ZjNlMWMxYmU3NjYxNTZjOWFkNGI1M2U4OGRlOTRmZDQ2MDJm";
agora.url = `https://cloudcapiv4.herewhite.com/room?token=${agora.sdkToken}&uuid=${agora.uuid}`;
agora.requestInit = {
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({
    name: "room name",
    limit: 0, // Limit on the number of rooms
    mode: "persistent", // Normal room, unable to play back
    // mode: "historied"， // Playback room
  }),
};
agora.appID = "a7ee32c757e94ea28738af87dc3d8fb7";
agora.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
agora.RTMclient = AgoraRTM.createInstance(agora.appID);
agora.RtmChannel = null;
agora.RtmIsLogin = false;
agora.client.init(
  agora.appID,
  function () {
    console.log("AgoraRTC client initialized");
  },
  function (err) {
    console.log("[ERROR] : AgoraRTC client init failed", err);
  }
);

agora.remoteStreams = [];
agora.localStreams = {
  camera: {
    id: "",
    stream: {},
  },
  screen: {
    id: "",
    stream: {},
  },
};

agora.joinChannel = (channelName, isTeacher) => {
  let token = agora.generateToken();
  let userID = null;
  isTeacher ? (userID = 12345) : (userID = null);
  agora.client.join(
    token,
    channelName,
    userID,
    (uid) => {
      console.log("User " + uid + " join channel successfully");
      isTeacher
        ? agora.createCameraStream(uid, true)
        : agora.createCameraStream(uid, false);
      model.addUserToRoom(uid, model.currentRoomID);
      agora.localStreams.camera.id = uid;
    },
    (err) => {
      console.log("[ERROR] : join channel failed", err);
      view.setActiveScreen("selectRoomScreen");
      agora.client.unpublish(agora.localStreams.camera.stream);
      agora.client.off("stream-published");
      agora.client.off("stream-added");
      agora.client.off("stream-subscribed");
      agora.client.leave();
      model.removeUserInRoom(agora.localStreams.camera.id, model.currentRoomID);
      view.setActiveScreen("selectRoomScreen");
    }
  );
};
agora.createCameraStream = (uid, isTeacher) => {
  let teacherCamera = document.getElementById("video-teacher");
  let teacherbox = document.getElementById("video-bar");
  let localStream = AgoraRTC.createStream({
    streamID: uid,
    audio: true,
    video: true,
    screen: false,
  });
  localStream.setVideoProfile("480p_4");
  localStream.init(
    () => {
      console.log("getUserMedia successfully");
      if (isTeacher == true) {
        localStream.play("video-teacher");
        teacherCamera.firstElementChild.className = "icon displayNone";
        teacherbox.lastElementChild.innerHTML = `${
          firebase.auth().currentUser.displayName
        }`;
        let teacherMic = document.getElementById("teacher-mic");
        let teacherVideoIcon = document.getElementById("teacher-video-icon");
        teacherMic.addEventListener("click", () => {
          controller.onOfMic(localStream.getId());
        });
        teacherVideoIcon.addEventListener("click", () => {
          controller.onOffVideo(localStream.getId());
        });
        console.log("camera0 mo");
      } else {
        agora.addRemoteStream(localStream, false, true);
      }
      console.log("publish");
      agora.client.publish(localStream, function (err) {
        console.log("[ERROR] : publish local stream error: " + err);
      });
      agora.localStreams.camera.stream = localStream;
      console.log("completed");
      let signOutBnt = document.getElementById("sign-out");
      signOutBnt.style.display = "flex";
    },
    (err) => {
      console.log("[ERROR] : getUserMedia failed", err);
      alert(`[ERROR] : getUserMedia failed ${err}`);
      agora.client.unpublish(agora.localStreams.camera.stream);
      agora.client.off("stream-published");
      agora.client.off("stream-added");
      agora.client.off("stream-subscribed");
      agora.client.leave();
      agora.RtmLeaveChannel();
      agora.remoteStreams = [];
      room.disconnect().then(function () {
        console.log("Leave room success");
        // model.loadRooms()
      });
      model.removeUserInRoom(agora.localStreams.camera.id, model.currentRoomID);
      if (agora.localStreams.screen.id !== "") {
        agora.localStreams.screen.stream.close();
        agora.screenClient.unpublish(agora.localStreams.screen.stream);
        console.log("screen close");
      }
      agora.screenClient.leave();
      view.setActiveScreen("selectRoomScreen");
    }
  );
};
agora.addRemoteStream = async (remoteStream, isTeacher, mic) => {
  let teacherCamera = document.getElementById("video-teacher");
  let streamId = remoteStream.getId();
  let data = await model.getUserIntoRoom(streamId, model.currentRoomID);
  console.log(data);
  if (!isTeacher && mic) {
    if (streamId !== 12345 || streamId == undefined) {
      let video = `
            <div class="student-box " id="${streamId}1">
                <div class="video" id="${streamId}">
                </div>
                <div class="mic">
                    <i class="fas fa-microphone" onclick="controller.onOfMic(${streamId})"></i>
                </div>
                <div class="teacher-video" onclick="controller.onOffVideo(${streamId})">
                    <i class="fas fa-video"></i>
                </div>
                <div class="info">${data.name}</div>
            </div>
            `;
      let videobox = document
        .getElementById("video-student-box")
        .insertAdjacentHTML("beforeend", video);
      remoteStream.play(`${streamId}`);
    } else {
      teacherCamera.firstElementChild.className = "icon displayNone";
      remoteStream.play(`video-teacher`);
      let teacherbox = document.getElementById("video-bar");
      let teacherMic = document.getElementById("teacher-mic");
      let teacherVideo = document.getElementById("teacher-video-icon");
      teacherMic.addEventListener("click", () => {
        controller.onOfMic(streamId);
      });
      teacherVideo.addEventListener("click", () => {
        controller.onOffVideo(streamId);
      });
      teacherbox.lastElementChild.innerHTML = `${data.name}`;
    }
  } else {
    if (streamId !== 12345 || streamId == undefined) {
      let video = `
              <div class="student-box " id="${streamId}1">
                  <div class="video" id="${streamId}">
                  </div>
                  <div class="mic">
                      <i class="fas fa-microphone"></i>
                  </div>
                  <div class="teacher-video">
                      <i class="fas fa-video"></i>
                  </div>
                  <div class="info">${data.name}</div>
              </div>
              `;
      let videobox = document.getElementById("video-student-box");
      videobox.insertAdjacentHTML("beforeend", video);
      remoteStream.play(`${streamId}`);
    } else {
      teacherCamera.firstElementChild.className = "icon displayNone";
      remoteStream.play(`video-teacher`);
      let teacherbox = document.getElementById("video-bar");
      teacherbox.lastElementChild.innerHTML = `${data.name}`;
    }
  }
};

agora.onListenAddStream = () => {
  agora.client.on("stream-added", (evt) => {
    let stream = evt.stream;
    let streamId = stream.getId();
    console.log("new stream added:" + streamId);
    if (streamId !== agora.localStreams.screen.id) {
      console.log("subscribe to remote stream:" + streamId);
      agora.client.subscribe(stream, (err) => {
        err
          ? console.log("[ERROR] : subscribe stream failed", err)
          : console.log("subscribe stream successfull", err);
      });
    } else if (agora.localStreams.camera.id !== streamId) {
      console.log("subscribe Screen stream:" + streamId);
      // Subscribe to the stream.
      agora.screenClient.subscribe(stream);
    }
  });
};
agora.onListenSubcribleRemoteStream = () => {
  agora.client.on("stream-subscribed", async function (evt) {
    let remoteStream = evt.stream;
    let remoteId = remoteStream.getId();
    agora.remoteStreams.push({
      id: remoteId,
      stream: remoteStream,
    });
    console.log("Subscribe remote stream successfully: " + remoteId);
    let roomInfo = await model.getRoomInfo(model.currentRoomID);
    if (roomInfo.screenShareId == remoteId) {
      agora.addRemoteScreenShare(remoteStream);
    } else {
      roomInfo.host == firebase.auth().currentUser.email
        ? agora.addRemoteStream(remoteStream, true, false)
        : agora.addRemoteStream(remoteStream, false, false);
    }
  });
};
agora.onListenLeave = () => {
  agora.client.on("peer-leave", async (evt) => {
    let uid = evt.uid;
    let reason = evt.reason;
    let roomInfo = await model.getRoomInfo(model.currentRoomID);
    console.log(evt);
    console.log("remote user left ", uid, "reason: ", reason);
    if (roomInfo.screenShareId == uid) {
      let screenShare = document.getElementById(`screenShare`);
      let whiteboard = document.getElementById("whiteboard");
      let toolBoard = document.querySelector(".tool-board");
      let offScreenShare = document.getElementById("offScreenShare");
      screenShare.innerHTML = "";
      let onBnt = document.getElementById("onScreenShare");
      let nameUserScreenShare = document.getElementById("nameUserScreenShare");
      offScreenShare.style.display = "none";
      nameUserScreenShare.style.display = "none";
      onBnt.style.display = "flex";
      toolBoard.style.display = "block";
      screenShare.style.display = "none";
      whiteboard.style.display = "block";
      model.addRoomScreenShare("rooms", model.currentRoomID, {
        screenId: null,
        name: null,
      });
      console.log("remove screen");
      return;
    } else if (uid == 12345) {
      document.getElementById(`player_${uid}`).remove();
      document.getElementById("icon").className = "icon";
      console.log("removed icon");
      return;
    } else document.getElementById(`${uid}1`).remove();
  });
};
agora.onListenMuteAudio = () => {
  agora.client.on("mute-audio", (evt) => {
    let uid = evt.uid;
    if (uid == 12345) {
      let micBox = document.getElementById("video-bar");
      micBox.querySelector(".mic i").className = "fas fa-microphone-slash";
    } else {
      let micBox = document.getElementById(`${uid}1`);
      micBox.querySelector(".mic i").className = "fas fa-microphone-slash";
      console.log(micBox);
    }
    console.log("mute audio:" + uid);
  });
};
agora.onListenUnMuteAudio = () => {
  agora.client.on("unmute-audio", (evt) => {
    let uid = evt.uid;
    if (uid == 12345) {
      let micBox = document.getElementById("video-bar");
      micBox.querySelector(".mic i").className = "fas fa-microphone";
    } else {
      let micBox = document.getElementById(`${uid}1`);
      micBox.querySelector(".mic i").className = "fas fa-microphone";
      console.log(micBox);
    }
    console.log("unmute audio:" + uid);
  });
};
agora.onListenMuteVideo = () => {
  agora.client.on("mute-video", (evt) => {
    let uid = evt.uid;
    if (uid == 12345) {
      let videoBox = document.getElementById("video-bar");
      videoBox.querySelector(".teacher-video i").className =
        "fas fa-video-slash";
    } else {
      let videoBox = document.getElementById(`${uid}1`);
      videoBox.querySelector(".teacher-video i").className =
        "fas fa-video-slash";
      console.log(videoBox);
    }
    console.log("mute video:" + uid);
  });
};
agora.onListenUnMuteVideo = () => {
  agora.client.on("unmute-video", (evt) => {
    let uid = evt.uid;
    if (uid == 12345) {
      let videoBox = document.getElementById("video-bar");
      videoBox.querySelector(".teacher-video i").className = "fas fa-video";
    } else {
      let videoBox = document.getElementById(`${uid}1`);
      videoBox.querySelector(".teacher-video i").className = "fas fa-video";
      console.log(videoBox);
    }
    console.log("unmute video:" + uid);
  });
};
agora.generateToken = () => {
  return null;
};
agora.onListenAddStream();
agora.onListenSubcribleRemoteStream();
agora.onListenLeave();
agora.onListenMuteAudio();
agora.onListenUnMuteAudio();
agora.onListenMuteVideo();
agora.onListenUnMuteVideo();
// ----------------------------------agoraRTM-----------------------------
agora.ListenRtmConnect = () => {
  agora.RTMclient.on("ConnectionStateChange", (newState, reason) => {
    console.log(
      "on connection state changed to " + newState + " reason: " + reason
    );
  });
};
agora.RtmLogin = async (user, channel) => {
  if (agora.RtmIsLogin == false) {
    agora.RTMclient.login({ token: null, uid: user })
      .then(() => {
        console.log("AgoraRTM client login success:" + user);
        agora.RtmCreateAndJoinChannel(channel);
      })
      .catch((err) => {
        console.log("AgoraRTM client login failure", err);
      });
    agora.RtmIsLogin = true;
  }
};
agora.RtmLogout = () => {
  agora.RTMclient.logout();
};
agora.RtmCreateAndJoinChannel = (channel) => {
  agora.RtmChannel = agora.RTMclient.createChannel(channel);
  agora.RtmChannel.join()
    .then(() => {
      console.log("join channel successfully");
      agora.RtmReceiveMessage();
    })
    .catch((error) => {
      console.log("error:" + error);
    });
};
agora.RtmSendMessageToChannel = (text) => {
  agora.RtmChannel.sendMessage({ text: text })
    .then(() => {
      console.log("send message to channel successfully");
    })
    .catch((error) => {
      console.log("error:" + error);
    });
};
agora.RtmReceiveMessage = () => {
  agora.RtmChannel.on("ChannelMessage", async ({ text }, senderId) => {
    console.log("sender:" + senderId);
    console.log("text:" + text);
    let user = await model.getInfoUser(senderId);
    if (text.trim() !== "")
      view.addMessage(user.name,text);
    let messageBox = document.getElementById("message-container");
    messageBox.scrollTop = messageBox.scrollHeight;
  });
  console.log("on listen");
};
agora.RtmLeaveChannel = () => {
  agora.RtmChannel.leave();
};
agora.ListenRtmConnect();
// ------------------------------------------screen share--------------------------

agora.screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
agora.screenClient.init(
  agora.appID,
  () => {
    console.log("AgoraRTC screenShare initialized");
  },
  (err) => {
    console.log("[ERROR] : AgoraRTC screenShare init failed", err);
  }
);
agora.ScreenJoinChannel = (channelName) => {
  agora.screenClient.join(null, channelName, null, function (uid) {
    console.log("ScreenShare " + uid + " join channel successfully");
    agora.createScreenShareStream(uid);
    model.addRoomScreenShare("rooms", model.currentRoomID, {
      screenId: uid,
      name: model.currentUser.displayName,
    });
    agora.localStreams.screen.id = uid;
  });
};
const parser = new UAParser();
const userAgentInfo = parser.getResult();
agora.createScreenShareStream = (uid) => {
  let localScreenShare = {
    streamID: uid,
    audio: false,
    video: false,
    screen: true,
  };
  if (isFirefox()) {
    localScreenShare.mediaSource = "window";
  } else if (!isCompatibleChrome()) {
    localScreenShare.extensionId = "minllpmhdgpndnkomcoccfekfegnlikg";
  }
  let screenStream = AgoraRTC.createStream(localScreenShare);
  screenStream.init(
    async () => {
      let toolBoard = document.querySelector(".tool-board");
      let onBnt = document.getElementById("onScreenShare");
      let nameUserScreenShare = document.getElementById("nameUserScreenShare");
      let offScreenShare = document.getElementById("offScreenShare");
      let roomInfo = await model.getRoomInfo(model.currentRoomID);
      nameUserScreenShare.innerHTML = ` Screen Sharing: ${roomInfo.ScreenShareName}`;
      nameUserScreenShare.style.display = "block";
      offScreenShare.style.display = "block";
      onBnt.style.display = "none";
      toolBoard.style.display = "none";
      whiteboard.style.display = "none";
      screenShare.style.display = "block";
      screenStream.play("screenShare");
      agora.localStreams.screen.stream = screenStream;
      agora.screenClient.publish(screenStream);
    },
    function (err) {
      console.log(err);
      agora.screenClient.unpublish(agora.localStreams.screen.stream);
      agora.screenClient.leave();
      model.addRoomScreenShare("rooms", model.currentRoomID, {
        screenId: null,
        name: null,
      });
    }
  );
};
agora.addRemoteScreenShare = async (remoteStream) => {
  let screenShare = document.getElementById("screenShare");
  let streamId = remoteStream.getId();
  let whiteboard = document.getElementById("whiteboard");
  let toolBoard = document.querySelector(".tool-board");
  let onBnt = document.getElementById("onScreenShare");
  let nameUserScreenShare = document.getElementById("nameUserScreenShare");
  let roomInfo = await model.getRoomInfo(model.currentRoomID);
  nameUserScreenShare.innerHTML = `Screen Sharing: ${roomInfo.ScreenShareName}`;
  nameUserScreenShare.style.display = "block";
  onBnt.style.display = "none";
  toolBoard.style.display = "none";
  whiteboard.style.display = "none";
  screenShare.style.display = "block";
  remoteStream.play(`screenShare`);
};
function isCompatibleChrome() {
  if (userAgentInfo.browser.name === "Chrome") {
    const major = +userAgentInfo.browser.major;
    if (major >= 72) return true;
  }
  return false;
}
function isFirefox() {
  return userAgentInfo.browser.name === "Firefox";
}
// agora.listenStopScreenShare();
// ---------------------------------------WhiteBoard---------------------------
let cloudinaryUrl = "https://api.cloudinary.com/v1_1/dbmfd8c7t/upload";
let cloudinaryUploadPreset = "b24i4mlf";
agora.whiteWebSdk = new WhiteWebSdk({
  appIdentifier: "2CJqEN__EeqEb0WIXb5tjg/u4X-SeUKl7flZg",
});

agora.initWhiteBoardAndJoinRoom = async (roomInfo) => {
  let room = await agora.whiteWebSdk.joinRoom({
    uuid: roomInfo.roomUUID,
    roomToken: roomInfo.roomToken,
  });
  window.room = room;
  room.bindHtmlElement(document.getElementById("whiteboard"));
  return room;
};
agora.addEventListenerToolBoard = (room, roomInfo) => {
  let whiteboard = document.getElementById("whiteboard");
  let mousePointerTool = document.getElementById("mouse-pointer");
  let handTool = document.getElementById("hand");
  let pencilTool = document.getElementById("pencil");
  let squareTool = document.getElementById("square");
  let circleTool = document.getElementById("circle");
  let eraserTool = document.getElementById("eraser");
  let textTool = document.getElementById("text");
  let newPageTool = document.getElementById("newPage");
  let uploadImgTool = document.getElementById("fileInput");
  let loadingIcon = document.getElementById("load-icon");
  let colorPicker = document.getElementById("colorPicker");

  mousePointerTool.addEventListener("click", () => {
    room.handToolActive = false;
    room.setMemberState({
      currentApplianceName: "selector",
      strokeColor: [255, 0, 0],
      strokeWidth: 4,
      textSize: 14,
    });
    whiteboard.firstElementChild.style.cursor = "pointer";
  });
  handTool.addEventListener("click", () => {
    room.handToolActive = true;
    whiteboard.firstElementChild.style.cursor = "grab";
  });

  pencilTool.addEventListener("click", () => {
    room.handToolActive = false;
    room.setMemberState({
      currentApplianceName: "pencil",
      strokeColor: [255, 120, 0],
      strokeWidth: 4,
      textSize: 14,
    });
    whiteboard.firstElementChild.style.cursor =
      "-webkit-image-set(url(https://sdk.herewhite.com/resource/mouse-cursor/pencil-cursor.png) 1x, url(https://sdk.herewhite.com/resource/mouse-cursor/pencil-cursor%402x.png) 2x) 2 22, auto";
  });
  squareTool.addEventListener("click", () => {
    room.handToolActive = false;
    room.setMemberState({
      currentApplianceName: "rectangle",
      strokeColor: [255, 0, 0],
      strokeWidth: 4,
      textSize: 14,
    });
    whiteboard.firstElementChild.style.cursor = "crosshair";
  });
  circleTool.addEventListener("click", () => {
    room.handToolActive = false;
    room.setMemberState({
      currentApplianceName: "ellipse",
      strokeColor: [255, 0, 0],
      strokeWidth: 4,
      textSize: 14,
    });
    whiteboard.firstElementChild.style.cursor = "crosshair";
  });
  eraserTool.addEventListener("click", () => {
    room.handToolActive = false;
    room.setMemberState({
      currentApplianceName: "eraser",
      strokeColor: [255, 0, 0],
      strokeWidth: 4,
      textSize: 14,
    });
    whiteboard.firstElementChild.style.cursor =
      "-webkit-image-set(url(https://sdk.herewhite.com/resource/mouse-cursor/easer-cursor.png) 1x,url(https://sdk.herewhite.com/resource/mouse-cursor/easer-cursor%402x.png) 2x) 8 18,auto";
  });
  textTool.addEventListener("click", () => {
    room.handToolActive = false;
    room.setMemberState({
      currentApplianceName: "text",
      strokeColor: [255, 0, 0],
      strokeWidth: 4,
      textSize: 14,
    });
    whiteboard.firstElementChild.style.cursor = "text";
  });
  newPageTool.addEventListener("click", () => {
    room.handToolActive = false;
    room.removeScenes("/");
  });
  colorPicker.addEventListener("change", (e) => {
    room.handToolActive = false;
    console.log(e.target.value);
    let tr1 = parseInt(e.target.value.slice(1, 3), 16);
    let tr2 = parseInt(e.target.value.slice(3, 5), 16);
    let tr3 = parseInt(e.target.value.slice(5, 7), 16);
    room.setMemberState({
      currentApplianceName: `${room.state.memberState.currentApplianceName}`,
      strokeColor: [`${tr1}`, `${tr2}`, `${tr3}`],
      strokeWidth: 4,
      textSize: 14,
    });
  });
  uploadImgTool.addEventListener("change", async (e) => {
    room.handToolActive = false;
    const pptConverter = agora.whiteWebSdk.pptConverter(
      `${roomInfo.roomToken}`
    );
    let file = e.target.files[0];
    let formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);
    loadingIcon.style.display = "block";
    let responseUpload = await axios({
      url: cloudinaryUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: formData,
    });
    let responseConvert = await pptConverter.convert({
      url: `${responseUpload.data.secure_url}`,
      kind: "static" || "dynamic",
      onProgressUpdated: (progress) => {
        console.log(progress);
      },
      checkProgressInterval: 1500,
      checkProgressTimeout: 5 * 60 * 1000,
    });
    loadingIcon.style.display = "none";
    room.putScenes(`/ppt`, responseConvert.scenes);
    room.setScenePath(`/ppt/${responseConvert.scenes[0].name}`);
  });
};
