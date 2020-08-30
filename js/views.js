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
view.setActiveScreen = async(screen, id) => {
    switch (screen) {
        case "registerScreen":
            {
                let screen = document.getElementById('app')
                screen.innerHTML = components.registerScreen
                let register = document.getElementById('register-form')
                let gotoLogin = document.getElementById('go-to-login')
                register.addEventListener('submit', (x) => {
                    x.preventDefault()
                    let check = null;
                    register.isTeacher.checked == register.isStudent.checked ? check = "" : check = register.isTeacher.checked
                    const data = {
                        firstName: {
                            value: register.firstName.value,
                            name: 'First name'
                        },
                        lastName: {
                            value: register.lastName.value,
                            name: 'Last name'
                        },
                        email: {
                            value: register.email.value,
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
                        isTeacher: {
                            value: `${check}`,
                            name: "checking to Teacher or Student",
                        },
                    }
                    controller.checkNull(data)
                    controller.logup(data)
                })
                let isTeacher = document.getElementById('isTeacher-input')
                let isStudent = document.getElementById('isStudent-input')
                isTeacher.addEventListener('change', (e) => {
                    isTeacher.checked == true ? isStudent.disabled = true : isStudent.disabled = false
                })
                isStudent.addEventListener('change', (e) => {
                    isStudent.checked == true ? isTeacher.disabled = true : isTeacher.disabled = false
                })
                gotoLogin.addEventListener('click', () => {
                    view.setActiveScreen('loginScreen')
                })
                break;
            }
        case 'loginScreen':
            {
                let screen = document.getElementById('app')
                screen.innerHTML = components.loginScreen
                let login = document.getElementById('login-form')
                let gotoLogup = document.getElementById('go-to-logup')
                login.addEventListener('submit', (x) => {
                    x.preventDefault()
                    login.email.value = login.email.value.trim();
                    const data = {
                        email: {
                            value: login.email.value,
                            name: 'Email'
                        },
                        password: {
                            value: login.password.value,
                            name: 'Password'
                        }
                    }
                    controller.checkNull(data)
                    controller.login(data)
                })
                gotoLogup.addEventListener('click', () => {
                    view.setActiveScreen('registerScreen')
                })
                break;
            }
        case 'selectRoomScreen':
            {
                // in ra man login
                document.getElementById('app').innerHTML = components.selectRoomScreen
                let listenChat = model.listenConversation()
                let listenRoomChange = model.listenRoomChange(listenChat)
                view.onclickNotification()
                model.rooms = []
                document.querySelector('.new-room-bnt').addEventListener('click', () => {
                    view.setActiveScreen('createRoomScreen')
                    listenRoomChange()
                    listenChat()
                })
                let userName = document.querySelector('.nav-bar-info-User .user-name')
                userName.addEventListener('click', () => {
                    view.setActiveScreen('updatePageScreen')
                    listenRoomChange()
                    listenChat()
                })
                view.setNavbarInfoUser()
                const logOut = document.querySelector('.log-out-bnt')
                logOut.addEventListener('click', (e) => {
                    e.preventDefault()
                    firebase.auth().signOut().then(() => {
                        console.log('user signed out')
                        view.setActiveScreen('loginScreen')
                        listenRoomChange()
                        listenChat()
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
                        // model.currentConversation = model.allConversation[0] 
                }
                // let messageBox = document.querySelector('.message-box')
                // let dataMessage = await model.getFirebaseDocument('conversations',model.currentConversation.id)
                // let MessageHtml = ''
                // let friendImg = await model.getInfoUser(dataMessage.users.find((user)=>user!==firebase.auth().currentUser.email))
                // for(let x of dataMessage.messages){
                //     if(x.owner == firebase.auth().currentUser.email) MessageHtml += view.addYourMessage(x.content)
                //     else MessageHtml += view.addFriendMessage(x.content,friendImg.photoURL)
                // }
                // messageBox.innerHTML = MessageHtml
                // view.loadNotification()
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
                    fetch(url, requestInit).then(function(response) {
                        return response.json();
                    }).then(function(json) {
                        teacher = true
                        console.log(json)
                        const data = {
                                channel: createRoomForm.chanelName.value,
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
                    }).catch(function(err) {
                        console.error(err);
                    });
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
                agora.RtmLogin(firebase.auth().currentUser.displayName, roomInfo.channel)

                if (view.count > 0) {
                    agora.RtmCreateAndJoinChannel(roomInfo.channel)
                }
                inputChat.addEventListener('keyup', (e) => {
                    if (e.keyCode == "13") {
                        agora.RtmSendMessageToChannel(inputChat.value)
                        view.addMessage(firebase.auth().currentUser.displayName, inputChat.value)
                        console.log('send');
                        inputChat.value = ""
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
                    room.disconnect().then(function() {
                        console.log("Leave room success");
                        // model.loadRooms()
                    });
                    model.removeUserInRoom(agora.localStreams.camera.id, model.currentRoomID)
                    agora.localStreams.camera.stream.close()
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
                })
                document.querySelector('.upload-img img').src = firebase.auth().currentUser.photoURL
                console.log('hello ae');
                view.setNavbarInfoUser()
                view.setUpProfilePage()
                view.listenOnUpdateImage()
                const homPage = document.querySelector('.symbol')
                homPage.addEventListener('click', () => {
                    view.setActiveScreen('selectRoomScreen')
                    listenChat()
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
                        view.getUsers(filteredCharacters[index])
                    }
                    if (searchBar.value == '') {
                        document.querySelector('.result-search').innerText = ''
                    }
                });

                view.onclickNotification()
                // view.loadNotification()
                view.chat()

                break;
            }
        case 'viewYourFriendProfile':
            {
                document.getElementById("app").innerHTML = components.viewYourFriendProfile;
                view.setNavbarInfoUser()
                const homPage = document.querySelector('.symbol')
                homPage.addEventListener('click', () => {
                    view.setActiveScreen('selectRoomScreen')
                        // model.loadRooms()
                })
                let userName = document.querySelector('.nav-bar-info-User .user-name')
                userName.addEventListener('click', () => {
                    view.setActiveScreen('updatePageScreen')
                    listenRoomChange()
                    listenChat()
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
                        view.getUsers(filteredCharacters[index])
                    }
                    if (searchBar.value == '') {
                        document.querySelector('.result-search').innerText = ''
                    }
                });
            }
    }
}

view.chat = async() => {
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
    let inputChatEmail = document.getElementById('input-chat-email')
    inputChatEmail.addEventListener('keyup', async(e) => {
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
        }
    })
    let messageInput = document.querySelector('.input-message input')
    messageInput.addEventListener('keyup', (e) => {
        if (e.keyCode == '13') {
            model.firestoreArryUnion('conversations', model.currentConversation.id, messageInput.value)
            messageInput.value = ""
        }
    })
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
    roomWrapper.className = 'room-bar cursor'
    roomWrapper.id = roomID
    roomWrapper.innerHTML = `
    <div class="room-id">ID: ${roomID}</div>
    <div class="room-host">Host: ${roomData.host}</div>
    
    <div class="room-title">Name: ${roomData.name}</div>
    <div class="room-createAt">Created At: ${roomData.createdAt}</div>
`
    document.querySelector(".right-container .room-list").appendChild(roomWrapper)

    let joinRoom = document.getElementById(roomWrapper.id)
    joinRoom.addEventListener('click', async() => {
        var person = prompt("Please enter password");
        if (person === roomData.password) {
            model.currentRoomID = roomID
            listenChat()
            view.setActiveScreen('classRoomScreen', roomID)
        } else {
            alert('Join failed')
        }
    })
    joinRoom.addEventListener('mouseover', async() => {
        let r = model.rooms.find((item) => item.fireBaseID == roomID)
            // let r = await model.getRoomInfo(roomID)
        view.getInFoRoom(roomID, r)
    })

}

view.addMessage = (senderId, text) => {
    let messageContainer = document.getElementById('message-container')
    let html = `
        <div class="RTM-message">${senderId}: ${text}</div>
    `
    messageContainer.insertAdjacentHTML('beforeend', html)
}
view.getUsers = (data) => {
    let listRooms = document.querySelector('.result-search')
    if (data !== undefined) {
        let html = `
        <li id="${data.id}">${data.email}</li>
        `
        listRooms.insertAdjacentHTML('beforeend', html)
    }
    let getUser = document.getElementById(data.id)
    getUser.addEventListener('click', async() => {
        let userDetail = await model.getInfoUser(data.email)
        console.log('click');
        view.setActiveScreen('viewYourFriendProfile')
        view.getUser(userDetail)

    })
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
        joinRoom.addEventListener('click', async() => {
            var person = prompt("Please enter your name", "Harry Potter");
            if (person === data.password) {
                model.currentRoomID = data.id
                view.setActiveScreen('classRoomScreen', data.id)
            } else {
                alert('Join failed')
            }
        })
        joinRoom.addEventListener('mouseover', async() => {
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
    joinRoom.addEventListener('click', async() => {
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

view.getInFoRoom = async(roomID, room) => {
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
            userBar.addEventListener('click', async() => {
                let userDetail = await model.getInfoUser(realTimeUserInfo[x].email)
                console.log('click');
                view.setActiveScreen('viewYourFriendProfile')
                view.getUser(userDetail)
            })
        }
    }
    let getUser = document.querySelector('.email-user')
    getUser.addEventListener('click', async() => {
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
view.setProfileDefault = async() => {
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
    viewRoomOfUser.addEventListener('click', async() => {
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
        resetPasswordForm.addEventListener('submit', async(e) => {
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
        model.updateDataToFireStore('users', data)
        alert('update profile successfully')
    })
}
view.listenOnUpdateImage = () => {
    let uploadImg = document.getElementById('upload')
    uploadImg.addEventListener('change', async(e) => {
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
    let html = `
   <div class="friend-message">
       <img src="${photoURL}">
       <div class="message">${content}</div>
   </div>
   `
    return html
}
view.addYourMessage = (content) => {
    let html = `
    <div class="your-message">
        <div class="message">${content}</div>
    </div>
    `
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
    let notificationBox = document.querySelector('.new-notification')
    notification.addEventListener('click', () => {
        notificationBox.classList.toggle('display-none')
    })
}


view.addNotification = async(data, id) => {
    console.log(data);
    lassMessageOwner = data.messages[data.messages.length - 1].owner
    let notificationBox = document.querySelector('.new-notification')
    let icon = document.getElementById('icon-chat-container')
    let html = ''
    let friendImg = await model.getInfoUser(data.users.find(
        (user) => user !== firebase.auth().currentUser.email))
    html = `
        <div class="sub-notification" id="${id}">
            <div class="owner-notification">
                <img src="${friendImg.photoURL}">
            </div>
            <div class="notification-box">
                <div class="text-email">${friendImg.email}</div>
                <div class="content-notification text-email">
                    ${data.messages[data.messages.length - 1].content}
                </div>
            </div>
        </div>
    `
    notificationBox.insertAdjacentHTML('afterbegin', html)
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
    a.addEventListener('click', async() => {
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
                html += view.addFriendMessage(x.content, friendImg.photoURL)
            }
        }

        messageBox.innerHTML = html
        let iconMessage = document.querySelector('.icon-notification')

        iconMessage.style.display = 'none'
        let chatbox = document.querySelector('.chat-one-to-one-container')
        let notification = document.querySelector('.new-notification')
        chatbox.classList = 'chat-one-to-one-container'
        notification.classList = 'new-notification display-none'
        icon.classList = 'chat-button cursor display-none'
        let chatTitle = document.querySelector('.top-message-box')
        chatTitle.innerHTML = `Chat With ${friendImg.email}`
        messageBox.scrollTop = messageBox.scrollHeight
    })
}