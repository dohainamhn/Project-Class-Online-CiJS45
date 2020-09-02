var sdkToken = "NETLESSSDK_YWs9Y1ZfQlRBMEcxekc5S19NbiZub25jZT0xNTk3NjEwMTAxNDE2MDAmcm9sZT0wJnNpZz1lMjU0MTQ4MWQzZDhhOTUyYTEzYTMxOTE2YjI5ZjNlMWMxYmU3NjYxNTZjOWFkNGI1M2U4OGRlOTRmZDQ2MDJm";
let uuid = 'namdaica123'
var url = `https://cloudcapiv4.herewhite.com/room?token=${sdkToken}&uuid=${uuid}`;
var requestInit = {
    method: 'POST',
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
let view = {}
view.count = 0;
view.listenChat = null;
view.setActiveScreen = async (screen, id) => {
    switch (screen) {
        case "registerScreen":
            {
                document.getElementById('app').innerHTML = components.registerScreen
                let register = document.getElementById('register-form')
                register.addEventListener('submit', (x) => {
                    x.preventDefault()
                    const data = {
                        firstName: {
                            value: register.firstName.value.trim(),
                            name: 'First name'
                        },
                        lastName: {
                            value: register.lastName.value.trim(),
                            name: 'Last name'
                        },
                        email: {
                            value: register.email.value.trim(),
                            name: 'Email'
                        },
                        password: {
                            value: register.password.value,
                            name: 'Password'
                        },
                        confirmPassword: {
                            value: register.confirmPassword.value,
                            name: 'Confirm password'
                        },
                        checkJob: {
                            value: register.job.value,
                            name: "checking to Teacher or Student",
                        },
                    }
                    controller.checkNull(data)
                    controller.logup(data)
                })
                document
                    .querySelector(".redirect-to-signin")
                    .addEventListener("click", () => {
                        view.setActiveScreen("loginScreen");
                    });
                break;
            }
        case 'loginScreen':
            {
                document.getElementById('app').innerHTML = components.loginScreen
                let loginForm = document.getElementById('login-form')
                let checkRemember = loginForm.remember.checked;
                if (JSON.parse(localStorage.getItem("checkRemember"))) {
                    loginForm.remember.checked = true;
                } else {
                    loginForm.remember.checked = false;
                }
                loginForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const data = {
                        password: {
                            value: loginForm.password.value,
                            name: "password",
                        },
                        email: {
                            value: loginForm.email.value.trim(),
                            name: "email",
                        },
                    };
                    loginForm.remember.checked
                        ? (controller.checkRemember = true)
                        : (controller.checkRemember = false);
                    controller.checkNull(data)
                    controller.login(data)
                    const dataRemember = {
                        email: loginForm.email.value,
                        password: loginForm.password.value,
                    };
                    if (loginForm.remember.checked) {
                        localStorage.setItem("dataRemember", JSON.stringify(dataRemember));
                        localStorage.setItem("checkRemember", JSON.stringify(checkRemember));
                    } else {
                        localStorage.setItem("checkRemember", JSON.stringify(checkRemember));
                    }
                });
                if (JSON.parse(localStorage.getItem("checkRemember"))) {
                    loginForm.email.value = JSON.parse(
                        localStorage.getItem("dataRemember")
                    ).email;
                    loginForm.password.value = JSON.parse(
                        localStorage.getItem("dataRemember")
                    ).password;
                } else {
                    loginForm.email.value = "";
                    loginForm.password.value = "";
                }
                document
                    .querySelector(".redirect-to-resgister")
                    .addEventListener("click", () => {
                        view.setActiveScreen("registerScreen");
                    });
                document
                    .getElementById("forgot-password")
                    .addEventListener("click", () => {
                        view.setActiveScreen("forgetScreen");
                    });
                document.getElementById("facebook").addEventListener("click", (e) => {
                    model.signinFacebook();
                });
                document.getElementById("remember-me").addEventListener("click", (e) => {
                    checkRemember = loginForm.remember.checked;
                });
                break;
            }
        case 'selectRoomScreen':
            {
                // in ra man login
                document.getElementById('app').innerHTML = components.selectRoomScreen
                view.listenChat = model.listenConversation()
                let listenRoomChange = model.listenRoomChange(view.listenChat)
                view.onclickNotification()
                model.rooms = []
                document.querySelector('.new-room-bnt').addEventListener('click', () => {
                    if (model.currentUser.isTeacher) {
                        view.setActiveScreen('createRoomScreen')
                        listenRoomChange()
                        view.listenChat()
                    }
                    else alert(`Only teacher can create room`)
                })
                let userName = document.querySelector('.nav-bar-info-User .user-name')
                userName.addEventListener('click', () => {
                    view.setActiveScreen('updatePageScreen')
                    listenRoomChange()
                    view.listenChat()
                })
                view.setNavbarInfoUser()
                const logOut = document.querySelector('.log-out-bnt')
                logOut.addEventListener('click', (e) => {
                    e.preventDefault()
                    firebase.auth().signOut().then(() => {
                        console.log('user signed out')
                        view.setActiveScreen('loginScreen')
                        listenRoomChange()
                        view.listenChat()
                    })
                })

                //------------------- Search Room --------------------------
                const response = await firebase.firestore().collection(model.collectionName).get()
                roomSearch = getDataFromDocs(response.docs)

                const searchBar = document.getElementById('myInput')
                searchBar.addEventListener('keyup', (e) => {
                    const searchString = e.target.value.toLowerCase();
                    document.querySelector('.room-list').innerText = ''
                    const filteredCharacters = roomSearch.filter((character) => {
                        return (
                            character.name.toLowerCase().includes(searchString)
                        );
                    });
                    for (let index = 0; index < roomSearch.length; index++) {
                        view.getRooms(filteredCharacters[index])
                    }
                });
                // ----------------------- Chat-box -----------------------
                let allconversation = await model.getDataFireStore('conversations', 'users', 'array-contains')
                console.log(allconversation);
                model.allConversation = []
                let conversations = []
                if (allconversation.length !== 0) {
                    for (let x of allconversation) {
                        conversations.push({
                            createdAt: controller.convertToTimeStamp(x.data().messages[x.data().messages.length - 1]['createdAt']),
                            messages: x.data().messages,
                            id: x.id,
                            users: x.data().users
                        })
                    }
                    console.log(conversations);
                    model.allConversation = controller.sortByTimeStamp(conversations)

                }
                let rightContainer = document.querySelector('.right-container')
                let notificationBox = document.querySelector('.new-notification-box')
                rightContainer.addEventListener('click', () => {
                    notificationBox.classList = 'new-notification-box display-none'
                })
                view.chat()
                break;
            }
        case 'createRoomScreen':
            {
                document.getElementById('app').innerHTML = components.createRoomScreen
                document.getElementById('back-to-chat').addEventListener('click', () => {
                    view.setActiveScreen('selectRoomScreen')

                })
                const createRoomForm = document.getElementById('create-conversation-form')
                createRoomForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    let data2 = {
                        roomNameError: {
                            value: createRoomForm.roomName.value,
                            name: 'Room Name'
                        },
                        titleError: {
                            value: createRoomForm.roomTtitle.value,
                            name: 'Title'
                        },
                        channelError: {
                            value: createRoomForm.chanelName.value,
                            name: 'Channel Name'
                        }
                    }
                    let checkNull = controller.checkNull(data2)
                    let checkChannelName = controller.checkChannelName(
                        controller.removeVietnameseTones(createRoomForm.chanelName.value)
                    )
                    if (checkNull && checkChannelName) {
                        fetch(url, requestInit).then(function (response) {
                            return response.json();
                        }).then(function (json) {
                            teacher = true
                            console.log(json)
                            const data = {
                                channel: controller.removeVietnameseTones(createRoomForm.chanelName.value),
                                host: model.currentUser.email,
                                name: createRoomForm.roomName.value,
                                roomToken: json.msg.roomToken,
                                roomUUID: json.msg.room.uuid,
                                title: createRoomForm.roomTtitle.value,
                                createdAt: new Date().toLocaleString(),
                                password: createRoomForm.passwordRoom.value,
                                currentMembers: []
                            }
                            // model.loadRooms()
                            console.log((data));
                            model.createRoom(data)
                            view.setActiveScreen('selectRoomScreen')
                        }).catch(function (err) {
                            console.error(err);
                        });
                    }
                })
                break;
            }
        case 'classRoomScreen':
            {
                document.getElementById("app").innerHTML = components.classRoomScreen;
                let signOutBnt = document.getElementById('sign-out')
                signOutBnt.style.display = 'none'
                let inputChat = document.getElementById('input-chat')
                let roomInfo = await model.getRoomInfo(id)

                let room = await agora.initWhiteBoardAndJoinRoom(roomInfo)

                agora.addEventListenerToolBoard(room, roomInfo)

                roomInfo.host == firebase.auth().currentUser.email ?
                    agora.joinChannel(roomInfo.channel, true) : agora.joinChannel(roomInfo.channel, false)
                agora.RtmLogin(firebase.auth().currentUser.email, roomInfo.channel)
                let buttonScreenShare = document.getElementById('onScreenShare')
                buttonScreenShare.addEventListener('click', () => {
                    agora.ScreenJoinChannel(roomInfo.channel)
                })
                let offBnt = document.getElementById('offScreenShare')
                offBnt.addEventListener('click', () => {
                    agora.localStreams.screen.stream.close()
                    agora.screenClient.unpublish(agora.localStreams.screen.stream)
                    agora.screenClient.leave()
                })
                if (view.count > 0) {
                    agora.RtmCreateAndJoinChannel(roomInfo.channel)
                }
                inputChat.addEventListener('keyup', (e) => {
                    if (e.keyCode == "13") {
                        agora.RtmSendMessageToChannel(inputChat.value)
                        if(inputChat.value.trim() !== "")
                        view.addMessage(firebase.auth().currentUser.displayName, inputChat.value)
                        console.log('send');
                        inputChat.value = ""
                        let messageBox = document.getElementById('message-container')
                        messageBox.scrollTop = messageBox.scrollHeight
                    }
                })
                signOutBnt.addEventListener('click', () => {
                    console.log('leave');
                    agora.client.unpublish(agora.localStreams.camera.stream)
                    agora.client.off("stream-published")
                    agora.client.off("stream-added")
                    agora.client.off('stream-subscribed')
                    agora.client.leave()
                    agora.RtmLeaveChannel()
                    agora.remoteStreams = []
                    room.disconnect().then(function () {
                        console.log("Leave room success");
                        // model.loadRooms()
                    });
                    model.removeUserInRoom(agora.localStreams.camera.id, model.currentRoomID)
                    agora.localStreams.camera.stream.close()
                    if (agora.localStreams.screen.id !== "") {
                        agora.localStreams.screen.stream.close()
                        agora.screenClient.unpublish(agora.localStreams.screen.stream)
                        console.log('screen close');
                    }
                    agora.screenClient.leave()
                    view.setActiveScreen('selectRoomScreen')
                })
                view.count++
                break;
            }
        case 'updatePageScreen':
            {
                document.getElementById("app").innerHTML = components.updateProfileScreen;
                let listenChat = model.listenConversation()
                document.querySelector('.log-out-bnt').addEventListener('click', () => {
                    firebase.auth().signOut()
                    listenChat()
                    view.listenChat()
                })
                document.querySelector('.upload-img img').src = firebase.auth().currentUser.photoURL;
                view.setNavbarInfoUser()
                view.setUpProfilePage()
                view.listenOnUpdateImage()
                const homPage = document.querySelector('.symbol')
                homPage.addEventListener('click', () => {
                    view.setActiveScreen('selectRoomScreen')
                    listenChat()
                    view.listenChat()
                })
                console.log(homPage)
                const response = await firebase.firestore().collection("users").get()
                roomSearch = getDataFromDocs(response.docs)

                const searchBar = document.getElementById('myInput')

                searchBar.addEventListener('keyup', (e) => {
                    const searchString = e.target.value.toLowerCase();
                    document.querySelector('.result-search').innerText = ''
                    const filteredCharacters = roomSearch.filter((character) => {
                        return (
                            character.email.toLowerCase().includes(searchString)
                        );
                    });
                    for (let index = 0; index < roomSearch.length; index++) {
                        if (filteredCharacters[index] !== undefined) view.getUsers(filteredCharacters[index],listenChat)
                    }
                    if (searchBar.value == '') {
                        document.querySelector('.result-search').innerText = ''
                    }
                });
                let maincontainer1 = document.querySelector('.main-container1')
                let notificationBox = document.querySelector('.new-notification-box')
                maincontainer1.addEventListener('click', () => {
                    notificationBox.classList = 'new-notification-box display-none'

                })

                view.onclickNotification()
                view.chat()

                break;
            }
        case 'viewYourFriendProfile':
            {
                document.getElementById("app").innerHTML = components.viewYourFriendProfile;
                view.setNavbarInfoUser()
                let listenChat = model.listenConversation()
                const homPage = document.querySelector('.symbol')
                homPage.addEventListener('click', () => {
                    view.setActiveScreen('selectRoomScreen')
                    // model.loadRooms()
                    listenChat()
                    view.listenChat()
                })
                view.onclickNotification()
                let userName = document.querySelector('.nav-bar-info-User .user-name')
                userName.addEventListener('click', () => {
                    view.setActiveScreen('updatePageScreen')
                    listenRoomChange()
                    view.listenChat()
                })
                const response = await firebase.firestore().collection("users").get()
                roomSearch = getDataFromDocs(response.docs)
                const searchBar = document.getElementById('myInput')
                searchBar.addEventListener('keyup', (e) => {
                    const searchString = e.target.value.toLowerCase();
                    document.querySelector('.result-search').innerText = ''
                    const filteredCharacters = roomSearch.filter((character) => {
                        return (
                            character.email.toLowerCase().includes(searchString)
                        );
                    });
                    for (let index = 0; index < roomSearch.length; index++) {
                        view.getUsers(filteredCharacters[index],listenChat)
                    }
                    if (searchBar.value == '') {
                        document.querySelector('.result-search').innerText = ''
                    }
                });
                
                document.querySelector('.log-out-bnt').addEventListener('click', () => {
                    firebase.auth().signOut()
                    listenChat()
                    view.listenChat()
                })
                let maincontainer1 = document.querySelector('.main-container1')
                let notificationBox = document.querySelector('.new-notification-box')
                maincontainer1.addEventListener('click', () => {
                    notificationBox.classList = 'new-notification-box display-none'
                })
                view.chat()
                break;
            }
        case "forgetScreen":
            {
                document.getElementById("app").innerHTML = components.forgotScreen;
                const forgotForm = document.getElementById("forgot-form");
                forgotForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const data = {
                        email: {
                            value: forgotForm.email.value.trim(),
                            name: "Your email address",
                        },
                    };
                    controller.checkNull(data)
                    controller.forgotPassword(data)
                });
                document.querySelector(".cancel").addEventListener("click", (e) => {
                    view.setActiveScreen("loginScreen");
                });
                break;
            }
    }
}

view.chat = async () => {
    let topChatButton = document.querySelector('.top-message-box')
    let chatContainer = document.querySelector('.chat-one-to-one-container')
    let iconChat = document.getElementById('icon-chat-container')
    topChatButton.addEventListener('click', () => {
        chatContainer.classList.toggle('display-none')
        iconChat.classList.toggle('display-none')
    })
    iconChat.addEventListener('click', () => {
        chatContainer.classList.toggle('display-none')
        iconChat.classList.toggle('display-none')
    })
    let addIconChatbnt = document.querySelector('.input-message .icon')
    addIconChatbnt.innerHTML = components.popupIconChat
    addIconChatbnt.addEventListener('click',()=>{
        console.log('click');
        let popup = document.querySelector('.icon .popupIconChat')
        popup.classList.toggle('show-popup')
    })
    let inputChatEmail = document.getElementById('input-chat-email')
    inputChatEmail.addEventListener('keyup', async (e) => {
        if (e.keyCode == '13') {
            let friend = await model.getInfoUser(inputChatEmail.value)
            if (inputChatEmail.value == firebase.auth().currentUser.email || friend == null) {
                alert('Email is invalid ')
                return
            }
            let data = await model.findConversation('conversations', 'users', inputChatEmail.value)
            let messageBox = document.querySelector('.message-box')
            console.log(friend);
            if (data == undefined) {
                let key = model.addFireStore('conversations', {
                    createAt: new Date().toLocaleString(),
                    messages: [{
                        content: "Hello",
                        createdAt: controller.getDate(),
                        owner: firebase.auth().currentUser.email
                    }],
                    users: [inputChatEmail.value, firebase.auth().currentUser.email]
                })
                let data2 = await model.findConversation('conversations', 'users', inputChatEmail.value)
                let friend = await model.getInfoUser(inputChatEmail.value)
                let html = ''
                if (data2.data().messages !== undefined) {
                    for (let x of data2.data().messages) {
                        if (x.owner == firebase.auth().currentUser.email) {
                            html += view.addYourMessage(x.content)
                        } else {
                            html += view.addFriendMessage(x.content, friend.photoURL)
                        }
                    }
                }
                model.currentConversation = {
                    id: data2.id
                }
                messageBox.innerHTML = html
                messageBox.scrollTop = messageBox.scrollHeight
                let allconversation = await model.getDataFireStore('conversations', 'users', 'array-contains')
                console.log(allconversation);
                model.allConversation = []
                let conversations = []
                if (allconversation.length !== 0) {
                    for (let x of allconversation) {
                        conversations.push({
                            createdAt: controller.convertToTimeStamp(x.data().messages[x.data().messages.length - 1]['createdAt']),
                            messages: x.data().messages,
                            id: x.id,
                            users: x.data().users
                        })
                    }
                    console.log(conversations);
                    model.allConversation = controller.sortByTimeStamp(conversations)
                    // model.currentConversation = model.allConversation[0] 
                }
                // view.loadNotification()
            } else {
                let html = ''
                if (data.data().messages !== undefined) {
                    for (let x of data.data().messages) {
                        if (x.owner == firebase.auth().currentUser.email) {
                            html += view.addYourMessage(x.content)
                        } else {
                            html += view.addFriendMessage(x.content, friend.photoURL)
                        }
                    }
                }
                model.currentConversation = {
                    id: data.id
                }
                messageBox.innerHTML = html
                messageBox.scrollTop = messageBox.scrollHeight
            }
            let chatTitle = document.querySelector('.top-message-box')
            chatTitle.innerHTML = `Chat With ${friend.email}`
            inputChatEmail.value = ''
        }
    })
    let messageInput = document.querySelector('.input-message input')
    messageInput.addEventListener('keyup', (e) => {
        if (e.keyCode == '13') {
            if(messageInput.value.trim() !== "")
            model.firestoreArryUnion('conversations', model.currentConversation.id, messageInput.value)
            messageInput.value = ""
        }
    })
    const searchBar = document.getElementById('search-conversations')
    searchBar.addEventListener('keyup', (e) => {
        const searchString = e.target.value.toLowerCase();
        document.querySelector('.new-notification').innerText = ''
        const filteredConversations = model.allConversation.filter((conversation) => {
            return (
                conversation.users.find((item) => item !== firebase.auth().currentUser.email)
                    .toLowerCase().includes(searchString)
            );
        });
        console.log(filteredConversations);
        for (let index = 0; index < model.allConversation.length; index++) {
            console.log(model.allConversation[index].friendImg)
            if (filteredConversations[index] !== undefined) {
                view.addNotification(filteredConversations[index]
                    , filteredConversations[index].id
                    , filteredConversations[index].friendImg, filteredConversations[index].friendEmail)
            }
        }
    });
}
view.errorMessage = (id, message) => {
    document.getElementById(id).innerText = message;
};
view.showRooms = (r, f) => {
    for (oneRoom of r) {
        f(oneRoom)
    }
}

view.addNewRoom = (roomID, roomData, listenChat) => {
    console.log(roomData);
    const roomWrapper = document.createElement('div')
    roomWrapper.className = 'room-bar-wrap'
    roomWrapper.id = roomID
    roomWrapper.innerHTML = `
    <div class="a" id="delete${roomID}">
            <i class="fas fa-trash-alt"></i>
            <div class="popup-form" id="popup-form${roomID}">
                <div class="title-popup"></div>
                <div class="button-popup">
                   
                </div>
            </div>
    </div>
    <div class="room-bar cursor" id="join-room-${roomID}">
        <div class="room-id sub-room">ID: ${roomID}</div>
        <div class="room-host sub-room">Host: ${roomData.host}</div>
        
        <div class="room-title sub-room">Name: ${roomData.name}</div>
        <div class="room-createAt sub-room">Created At: ${roomData.createdAt}</div>
    </div>
`   
    document.querySelector(".right-container .room-list").appendChild(roomWrapper);
    
    if(roomData.password !== ""){
        let iconHTML = `<div class="lock-icon"><i class="fas fa-lock"></i></div>`
        document.getElementById(`${roomID}`).insertAdjacentHTML('beforeend',iconHTML)
    }
    else{
        let iconHTML = `<div class="lock-icon"></div>`
        document.getElementById(`${roomID}`).insertAdjacentHTML('beforeend',iconHTML)
    }
    let deleteRoomBtn = document.getElementById(`delete${roomID}`)
    let joinRoom = document.getElementById(`join-room-${roomID}`)
    joinRoom.addEventListener('click', async () => {
        if(roomData.password !== ""){
            var person = prompt("Please enter password");
            if (person === roomData.password) {
                model.currentRoomID = roomID
                view.listenChat()
                view.setActiveScreen('classRoomScreen', roomID)
            } else {
                alert('Join failed')
            }
        }
        else{
            model.currentRoomID = roomID
            view.listenChat()
            view.setActiveScreen('classRoomScreen', roomID)
        }
    })
    joinRoom.addEventListener('mouseover', async () => {
        let r = model.rooms.find((item) => item.fireBaseID == roomID)
        // let r = await model.getRoomInfo(roomID)
        view.getInFoRoom(roomID, r)
    })
    deleteRoomBtn.addEventListener('click',()=>{
        let popup = document.querySelector(`#delete${roomID} .popup-form`)
        if(firebase.auth().currentUser.email == roomData.host){
            document.querySelector(`#delete${roomID} .popup-form .title-popup`)
            .innerHTML = "Do you really want to delete this room?"
            document.querySelector(`#delete${roomID} .popup-form .button-popup`)
            .innerHTML =
            `
             <button class="popup-bnt" id="yes${roomID}">Yes</button>
             <button class="popup-bnt" id="no${roomID}">No</button>
            `
            document.getElementById(`yes${roomID}`).addEventListener('click',()=>{
                 model.deleteDataFireStore('rooms',roomID)
                document.getElementById(`${roomID}`).remove()
                console.log(`xoa room ID ${roomID}`);
            })
            document.getElementById(`no${roomID}`).addEventListener('click',()=>{
               
            })
        }
        else{
            document.querySelector(`#delete${roomID} .popup-form .title-popup`)
            .innerHTML = "only owner can delete this room"
            document.querySelector(`#delete${roomID} .popup-form .button-popup`)
            .innerHTML = ""
        }
        let arr = document.querySelectorAll('.popup-form')
        arr.forEach((item)=>{
            if(item.id !== `popup-form${roomID}`)item.classList = "popup-form"
        })
        popup.classList.toggle('show-popup')
    })
}

view.addMessage = (senderId, text) => {
    let messageContainer = document.getElementById('message-container')
    let html = `
        <div class="RTM-message">${senderId}: ${text}</div>
    `
    messageContainer.insertAdjacentHTML('beforeend', html)
}
view.getUsers = (data,listenChat) => {
    if (data !== undefined) {
        let listRooms = document.querySelector('.result-search')
        if (data !== undefined) {
            let html = `
        <li id="${data.id}">${data.email}</li>
        `
            listRooms.insertAdjacentHTML('beforeend', html)
        }
        let getUser = document.getElementById(data.id)
        getUser.addEventListener('click', async () => {
            let userDetail = await model.getInfoUser(data.email)
            console.log('click');
            view.setActiveScreen('viewYourFriendProfile')
            view.getUser(userDetail)
            view.listenChat()
            listenChat()
        })
    }
}

view.getRooms = (data) => {
    let listRooms = document.querySelector('.room-list')
    if (data !== undefined) {
        let html = `
        <div class="room-bar" id="${data.id}">
            <div class="room-id">ID: ${data.id}</div>
            <div class="room-host">Host: ${data.host}</div>
            <div class="room-title">Name: ${data.name}</div>
            <div class="room-createAt">Created At: ${data.createdAt}</div>
        </div>
            `
        listRooms.insertAdjacentHTML('beforeend', html)
        let joinRoom = document.getElementById(data.id)
        joinRoom.addEventListener('click', async () => {
            var person = prompt("Please enter your name", "Harry Potter");
            if (person === data.password) {
                model.currentRoomID = data.id
                view.setActiveScreen('classRoomScreen', data.id)
            } else {
                alert('Join failed')
            }
        })
        joinRoom.addEventListener('mouseover', async () => {
            let r = model.rooms.find((item) => item.fireBaseID == data.id)
            // let r = await model.getRoomInfo(data.id)
            view.getInFoRoom(data.id, r)
        })
    }
}
view.getConversation = (data) => {
    let listRooms = document.querySelector('.room-list')
    if (data !== undefined) {
        let html = `
        <div class="room-bar" id="${data.id}">
            <div class="room-id">ID: ${data.id}</div>
            <div class="room-host">Host: ${data.host}</div>
            <div class="room-title">Name: ${data.name}</div>
            <div class="room-createAt">Created At: ${data.createdAt}</div>
        </div>
            `
        listRooms.insertAdjacentHTML('beforeend', html)
        let joinRoom = document.getElementById(data.id)
        joinRoom.addEventListener('click', async () => {
            var person = prompt("Please enter your name", "Harry Potter");
            if (person === data.password) {
                model.currentRoomID = data.id
                view.setActiveScreen('classRoomScreen', data.id)
            } else {
                alert('Join failed')
            }
        })
        joinRoom.addEventListener('mouseover', async () => {
            let r = model.rooms.find((item) => item.fireBaseID == data.id)
            // let r = await model.getRoomInfo(data.id)
            view.getInFoRoom(data.id, r)
        })
    }
}
view.getYourRooms = (room) => {
    const roomWrapper = document.createElement('div')
    roomWrapper.className = 'room-bar'
    roomWrapper.id = room.id
    roomWrapper.innerHTML = `
    <div class="room-id">ID: ${room.id}</div>
    <div class="room-host">Host: ${room.host}</div>
    
    <div class="room-title">Name: ${room.name}</div>
    <div class="room-createAt">Created At: ${room.createdAt}</div>
`
    document.querySelector(".right-container .room-list").appendChild(roomWrapper)

    let joinRoom = document.getElementById(roomWrapper.id)
    joinRoom.addEventListener('click', async () => {
        var person = prompt("Please enter password");
        if (person === room.password) {
            model.currentRoomID = room.id
            view.setActiveScreen('classRoomScreen', room.id)
        } else {
            alert('Join failed')
        }
    })
}

view.updateNumberUser = (docId, numberUser) => {
    const conversation = document.getElementById(docId)
    const secondChild = conversation.getElementsByTagName('div')[1]
    secondChild.innerText = numberUser + ' members'
}

view.getInFoRoom = async (roomID, room) => {
    let realTimeUserInfo = await model.getUserIntoRoom(null, roomID)
    let infoHost = await model.getInfoUser(room.host)
    let count = 0;
    realTimeUserInfo !== null ? count = Object.keys(realTimeUserInfo).length : count = 0;
    let infoRoom = document.querySelector('.left-container')
    let html = `
    <div class="class-name">${room.name} </div>
    <div class="teacher-info">
        <label>Teacher:</label>
        <div class="info">
            <img src="${infoHost.photoURL}" alt="">
            <div class="email-user cursor">${infoHost.name}</div>
        </div>
    </div>
    <div class="students">
        <label>Current Members: ${count}/6</label>
        <div class="student-info" id="student-info">
            <div class="info">
                
            </div>
        </div>
    </div>

    <div class="title">
        <label for="">Title:</label>
        <p>
            ${room.title}
        </p>
    </div>
    `
    infoRoom.innerHTML = html;
    let members = document.getElementById('student-info')
    let userHtml = ``

    if (realTimeUserInfo !== null) {
        let key = Object.keys(realTimeUserInfo)
        for (x of key) {
            userHtml += `<div class="info">
                            <img src="${realTimeUserInfo[x].photoURL}" alt="">
                            <div class="cursor" id="${x}">${realTimeUserInfo[x].name}</div>
                        </div>`
        }
        members.insertAdjacentHTML('beforeend', userHtml)
        for (let x of key) {
            let userBar = document.getElementById(`${x}`)
            userBar.addEventListener('click', async () => {
                let userDetail = await model.getInfoUser(realTimeUserInfo[x].email)
                console.log('click');
                view.setActiveScreen('viewYourFriendProfile')
                view.getUser(userDetail)
            })
        }
    }
    let getUser = document.querySelector('.email-user')
    getUser.addEventListener('click', async () => {
        let userDetail = await model.getInfoUser(room.host)
        console.log('click');
        view.setActiveScreen('viewYourFriendProfile')
        view.getUser(userDetail)
    })
}
view.setNavbarInfoUser = () => {
    let imgUser = document.querySelector('.nav-bar-info-User img')
    let userName = document.querySelector('.nav-bar-info-User .user-name')
    userName.innerHTML = `${firebase.auth().currentUser.displayName}`
    imgUser.src = `${firebase.auth().currentUser.photoURL}`
}
view.setProfileDefault = async () => {
    document.getElementById('profile-name').innerHTML = `Name: ${firebase.auth().currentUser.displayName}`
    document.getElementById('profile-email').innerHTML = `Email: ${firebase.auth().currentUser.email}`
    let isTeacher = document.getElementById('is-teacher');
    let workAt = document.getElementById('work-at')
    let aboutMe = document.getElementById('about-me')
    let data = await model.getDataFireStore('users', 'email');
    data.isTeacher ? isTeacher.innerHTML = "Job: Teacher" : isTeacher.innerHTML = "Job: Student"
    data.workAt == undefined ? workAt.innerHTML = `Work at: ` : workAt.innerHTML = `Work at:  ${data.workAt}`
    data.aboutMe == undefined ? aboutMe.innerHTML = `` : aboutMe.innerHTML = data.aboutMe
}
view.setUpProfilePage = () => {
    document.querySelector('.profile-box').innerHTML = components.profileBox
    view.setProfileDefault()
    view.listenChangeToEditProfile()
}

view.listenChangeToEditProfile = () => {
    let profileBox = document.querySelector('.profile-box')
    let profileBnt = document.getElementById('profile-bnt')
    let editProfileBnt = document.getElementById('edit-profile-bnt')
    let editPasswordBnt = document.getElementById('edit-password-bnt')
    let viewRoomOfUser = document.getElementById('view-room-of-current-user')
    viewRoomOfUser.addEventListener('click', async () => {
        profileBnt.classList = ''
        editProfileBnt.classList = ''
        editPasswordBnt.classList = ''
        viewRoomOfUser.classList = 'active-bnt'
        let title = document.querySelector('.menu-div .title')
        title.innerHTML = 'View your rooms'
        profileBox.innerHTML = components.viewYourRoom
        let yourRoom = await model.getTest(model.currentUser.email)
    })
    profileBnt.addEventListener('click', () => {
        profileBnt.classList = 'active-bnt'
        editProfileBnt.classList = ''
        editPasswordBnt.classList = ''
        viewRoomOfUser.classList = ''
        profileBox.innerHTML = components.profileBox
        let title = document.querySelector('.menu-div .title')
        title.innerHTML = 'Profile'
        view.setProfileDefault()
    })
    editProfileBnt.addEventListener('click', () => {
        profileBnt.classList = ''
        editProfileBnt.classList = 'active-bnt'
        editPasswordBnt.classList = ''
        viewRoomOfUser.classList = ''
        profileBox.innerHTML = components.editProfileBox
        let emailProfile = document.querySelector('.email-profile')
        emailProfile.innerHTML = `${firebase.auth().currentUser.email}`
        let title = document.querySelector('.menu-div .title')
        let isTeacher = document.getElementById('isTeacher')
        let isStudent = document.getElementById('isStudent')

        title.innerHTML = 'Edit Profile'
        isTeacher.addEventListener('change', (e) => {
            isTeacher.checked == true ? isStudent.disabled = true : isStudent.disabled = false
        })
        isStudent.addEventListener('change', (e) => {
            isStudent.checked == true ? isTeacher.disabled = true : isTeacher.disabled = false
        })
        view.setEventListenEditProfile()
    })
    editPasswordBnt.addEventListener('click', () => {
        profileBnt.classList = ''
        editProfileBnt.classList = ''
        editPasswordBnt.classList = 'active-bnt'
        viewRoomOfUser.classList = ''
        profileBox.innerHTML = components.editPasswordBox
        let title = document.querySelector('.menu-div .title')
        title.innerHTML = 'Edit Password'
        let resetPasswordForm = document.getElementById('reset-password-form')
        let currentPasswordError = document.getElementById('currentPassword')
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            let data = {
                currentPassword: {
                    value: resetPasswordForm.currentPassword.value,
                    name: 'currentPassword'
                },
                password: {
                    value: resetPasswordForm.password.value,
                    name: 'New Password'
                },
                confirmPassword: {
                    value: resetPasswordForm.confirmPassword.value,
                    name: 'confirmPassword'
                }
            }
            controller.checkNull(data)
            let dataUser = await model.getDataFireStore('users', 'email')
            if (resetPasswordForm.currentPassword.value == dataUser.password) {
                controller.resetPassword(data)
            } else {
                currentPasswordError.innerHTML = "Current password is not correct"
            }
        })
    })
}
view.setEventListenEditProfile = () => {
    let updateForm = document.getElementById('edit-profile-form')
    updateForm.addEventListener('submit', (e) => {
        e.preventDefault()
        let isTeacher = false;
        updateForm.isTeacher.checked == updateForm.isStudent.checked ? isTeacher = "" : isTeacher = updateForm.isTeacher.checked;
        const data = {}
        if (updateForm.workAt.value !== "") data.workAt = updateForm.workAt.value;
        if (isTeacher !== "") data.isTeacher = isTeacher;
        if (updateForm.aboutMe.value !== "") data.aboutMe = updateForm.aboutMe.value;
        let name = `${updateForm.firstName.value} ${updateForm.lastName.value}`
        if (name !== " ") {
            data.name = name
            let userName = document.querySelector('.nav-bar-info-User .user-name')
            userName.innerHTML = `${name}`
        }
        if (data.isTeacher !== undefined) {
            model.currentUser.isTeacher = data.isTeacher
        }
        model.updateDataToFireStore('users', data)
        model.updateCurrentUser(data)
        alert('update profile successfully')
        updateForm.reset();
    })
}
view.listenOnUpdateImage = () => {
    let uploadImg = document.getElementById('upload')
    uploadImg.addEventListener('change', async (e) => {
        let img = document.querySelector('.upload-img img')
        let navImg = document.querySelector('.nav-bar-info-User img')
        let storageRef = firebase.storage().ref();
        let imgName = e.target.value.slice(e.target.value.lastIndexOf("th") + 3, e.target.value.length);
        let uploadTask = await storageRef.child(`${imgName}`).put(e.target.files[0])
        let linkImg = await uploadTask.ref.getDownloadURL()
        img.src = linkImg
        navImg.src = linkImg
        firebase.auth().currentUser.updateProfile({
            photoURL: linkImg
        }).then((res) => {
            console.log(res);
            alert('Upload Image successful')
        })
        model.updateDataToFireStore('users', { photoURL: linkImg })
    })
}

view.getUser = (user) => {
    let infoUser = document.querySelector('.profile-box')
    user.workAt == undefined ? user.workAt = " " : user.workAt = user.workAt;
    user.aboutMe == undefined ? user.aboutMe = " " : user.aboutMe = user.aboutMe;
    document.querySelector('.upload-img img').src = user.photoURL
    document.querySelector('.upload-img label').style.display = 'none'
    let html = `    
    <div class="profile-row pd-t-2">
    <div class="info-profile">
        <div id="profile-name">Name: ${user.name}</div>
        <div id="profile-email">Email: ${user.email}</div>
    </div>
    <div class="info-profile">
        <div id="is-teacher"></div>
        <div id="work-at">Work: ${user.workAt}</div>
    </div>
    </div>
    <div class="about-me-profile">
    <label>About Me:</label>
    <p id="about-me">
        ${user.aboutMe}
    </p>
    </div>`
    infoUser.innerHTML = html


    let job = document.getElementById('is-teacher');
    if (user.isTeacher == true) {
        job.innerText = "Job: Teacher"
    } else {
        job.innerText = "Job: Student"
    }
}

view.addFriendMessage = (content, photoURL) => {
    let iconUrl = controller.checkIconChat(content)
    let html = ""
    if(iconUrl !== null){
        let str = content
        for(let x of iconUrl){
            str = str.split(x.syntax).join(`<span><img src=${x.url}></span>`)
        }
        html = `
            <div class="friend-message">
                <img src="${photoURL}">
                <div class="message">
                    ${str}
                </div>
            </div>
        `
    }
      else html = `
        <div class="friend-message">
            <img src="${photoURL}">
            <div class="message">${content}</div>
        </div>
        `
    return html
}
view.addYourMessage = (content) => {
    let iconUrl = controller.checkIconChat(content)
    let html =''
    if(iconUrl !== null){
        let str = content
        for(let x of iconUrl){
            str = str.split(x.syntax).join(`<span><img src=${x.url}></span>`)
        }
        html = `
            <div class="your-message">
                <div class="message">
                    ${str}
                </div>
            </div>
        `
    }
    else{
        html = `
        <div class="your-message">
            <div class="message">${content}</div>
        </div>
        `
    }
    return html
}
view.addListConversation = (data, isActive = false) => {
    let html = ''
    if (isActive) {
        if (data.check == false && data.lassMessageOwner !== firebase.auth().currentUser.email) {
            html += `
                <div class="conversation-box active bold">${data.friendEmail[0].toUpperCase()}
                ${data.friendEmail[data.friendEmail.length - 11].toUpperCase()}</div>
            `
        } else {
            html += `
                <div class="conversation-box active">${data.friendEmail[0].toUpperCase()}
                ${data.friendEmail[data.friendEmail.length - 11].toUpperCase()}</div>
            `
        }
    } else {
        if (data.check == false && data.lassMessageOwner !== firebase.auth().currentUser.email) {
            html += `
                <div class="conversation-box bold">${data.friendEmail[0].toUpperCase()}
                ${data.friendEmail[data.friendEmail.length - 11].toUpperCase()}</div>
            `
        } else {
            html += `
                <div class="conversation-box ">${data.friendEmail[0].toUpperCase()}
                ${data.friendEmail[data.friendEmail.length - 11].toUpperCase()}</div>
            `
        }
    }
    return html
}
view.onclickNotification = () => {
    let notification = document.querySelector('.notification')
    let notificationBox = document.querySelector('.new-notification-box')
    notification.addEventListener('click', () => {
        notificationBox.classList.toggle('display-none')
    })
}


view.addNotification = async (data, id, friendImg, friendEmail) => {
    // console.log(data);
    lassMessageOwner = data.messages[data.messages.length - 1].owner
    let notificationBox = document.querySelector('.new-notification')
    let icon = document.getElementById('icon-chat-container')
    let html = ''
    let sender = null;
    lassMessageOwner == firebase.auth().currentUser.email ?
        sender = 'You:' : sender = ''
    html = `
        <div class="sub-notification" id="${id}">
            <div class="owner-notification">
                <img src="${friendImg}">
            </div>
            <div class="notification-box">
                <div class="text-email">${friendEmail}</div>
                <div class="content-notification text-email">${sender}
                    ${data.messages[data.messages.length - 1].content}
                </div>
            </div>
        </div>
    `
    if (data.check == true) {
        notificationBox.insertAdjacentHTML('beforeend', html)
    }
    else notificationBox.insertAdjacentHTML('afterbegin', html)
    if (lassMessageOwner !== firebase.auth().currentUser.email) {
        if (model.currentConversation !== null) {
            if (id !== model.currentConversation.id && data.check == false) {
                let font = document.getElementById(`${id}`)
                let icon = document.querySelector('.icon-notification')
                font.style.fontWeight = '600'
                icon.style.display = 'block'
            } else if (id == model.currentConversation.id && data.check == false && icon.classList == 'chat-button cursor') {
                let font = document.getElementById(`${id}`)
                let icon = document.querySelector('.icon-notification')
                font.style.fontWeight = '600'
                icon.style.display = 'block'
            }
        } else {
            if (data.check == false) {
                let font = document.getElementById(`${id}`)
                let icon = document.querySelector('.icon-notification')
                font.style.fontWeight = '600'
                icon.style.display = 'block'
            }
        }
    }
    let a = document.getElementById(`${id}`)
    a.addEventListener('click', async () => {
        a.style.fontWeight = '300'
        model.currentConversation = {
            id: id,
            messages: data.messages[data.messages.length - 1].messages,
            users: data.users
        }
        let messageBox = document.querySelector('.message-box')
        let html = ''
        model.updateCheckConversation('conversations', id, true)
        for (let x of data.messages) {
            if (x.owner == firebase.auth().currentUser.email) {
                html += view.addYourMessage(x.content)
            } else {
                html += view.addFriendMessage(x.content, friendImg)
            }
        }

        messageBox.innerHTML = html
        let iconMessage = document.querySelector('.icon-notification')

        iconMessage.style.display = 'none'
        let chatbox = document.querySelector('.chat-one-to-one-container')
        let notification = document.querySelector('.new-notification-box')
        chatbox.classList = 'chat-one-to-one-container'
        notification.classList = 'new-notification-box display-none'
        icon.classList = 'chat-button cursor display-none'
        let chatTitle = document.querySelector('.top-message-box')
        chatTitle.innerHTML = `Chat With ${friendEmail}`
        messageBox.scrollTop = messageBox.scrollHeight
    })
}