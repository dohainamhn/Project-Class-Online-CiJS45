let model = {}
model.userMic = []
model.classRoomID = []
model.collectionName = 'rooms'
model.rooms = []
model.currentConversation = null
model.allConversationID = []
model.allConversation = []
model.currentUser = undefined
model.room = undefined
model.yourRoom = undefined
model.register = (data) => {
    firebase.auth().createUserWithEmailAndPassword(data.email.value, data.password.value)
        .then((res) => {
            firebase.auth().currentUser.updateProfile({
                displayName: data.lastName.value + " " + data.firstName.value,
                photoURL: "https://firebasestorage.googleapis.com/v0/b/chat-app-bc2a8.appspot.com/o/user.png?alt=media&token=28e24cc2-86bd-43f8-aa54-2a62ef76650a"
            }).then(() => {
                let check = false
                data.isTeacher.value == 'true' ? check = true : check = false
                model.addFireStore("users", {
                    name: res.user.displayName,
                    email: res.user.email,
                    isTeacher: check,
                    password: data.password.value,
                    photoURL: "https://firebasestorage.googleapis.com/v0/b/chat-app-bc2a8.appspot.com/o/user.png?alt=media&token=28e24cc2-86bd-43f8-aa54-2a62ef76650a"
                });
            })
            firebase.auth().currentUser.sendEmailVerification()
            alert("Congratulation! you have successfully registed\n please check your email to verify your account. ")
            view.setActiveScreen("login", data)
        })
        .catch(function (error) {
            console.log(error);
            controller.authenticate(error)
        });
}
model.login = (data) => {
    firebase.auth().signInWithEmailAndPassword(data.email.value, data.password.value)
        .then((res) => {
            if (!res.user.emailVerified) {

                alert('please verify your email')
            }

        })
        .catch(function (error) {
            console.log(error);
            controller.authenticate(error)
        });
}
model.initFirebaseStore = () => {
    return firebase.firestore()
}
model.getRoomInfo = async (id) => {
    let data = await model.initFirebaseStore().collection(model.collectionName).doc(`${id}`).get()
    return data.data()
}
model.getUserIntoRoom = async (idstream = null, currentRoomID) => {
    if (idstream !== null) {
        let data = await firebase.database().ref(`${currentRoomID}/` + idstream).once('value')
        return data.val()
    }
    else {
        let data = await firebase.database().ref(`${currentRoomID}`).once('value')
        return data.val()
    }
}
model.createRoom = async (room) => {
    await firebase.firestore().collection(model.collectionName).add(room)
}
// model.loadRooms = async() => {
//     const response = await firebase.firestore().collection(model.collectionName).get()
//     model.rooms = getDataFromDocs(response.docs)

//     view.showRooms(model.rooms, view.addNewRoom)
// }

model.listenRoomChange = (listenChat) => {
    let db = model.initFirebaseStore().collection('rooms').onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(function (change) {
            if (change.type === "added") {
                model.rooms.push({
                    fireBaseID: change.doc.id,
                    channel: change.doc.data().channel,
                    host: change.doc.data().host,
                    name: change.doc.data().name,
                    roomToken: change.doc.data().roomToken,
                    roomUUID: change.doc.data().roomUUID,
                    title: change.doc.data().title,
                    createdAt: change.doc.data().createdAt,
                    password: change.doc.data().password
                })
                console.log("room Add:", change.doc.data());
                view.addNewRoom(change.doc.id, change.doc.data(), listenChat)
                // console.log("New city: ", change.doc.data());
            }
            if (change.type === "modified") {
                console.log("Modified city: ", change.doc.data());

            }
            if (change.type === "removed") {
                console.log("Removed city: ", change.doc.data());
            }
        });
    });
    return db
}

model.addUserToRoom = (id, currentRoomID) => {
    let ref = firebase.database().ref(`${currentRoomID}/` + id);
    ref.set({
        name: firebase.auth().currentUser.displayName,
        email: model.currentUser.email,
        onMic: true,
        photoURL: firebase.auth().currentUser.photoURL
    });
    ref.onDisconnect().remove();
}

model.removeUserInRoom = (id, currentRoomID) => {
    firebase.database().ref(`${currentRoomID}/` + id).remove();
}
model.getDoc = async () => {
    const snapshot = await firebase.firestore().collection(model.collectionName).get()
    return snapshot.docs.map(doc => doc.data());
}

model.addFireStore = (collection, data) => {
    var db = firebase.firestore();
    db.collection(collection).add(data)
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
            model.key = docRef.id
            return docRef.id
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}
model.resetPassword = (data) => {
    var user = firebase.auth().currentUser;
    var credentials = firebase.auth.EmailAuthProvider.credential(
        user.email,
        data.currentPassword.value
    );
    user.reauthenticateWithCredential(credentials).then(function () {
        user.updatePassword(data.password.value).then(function () {
            model.updateDataToFireStore('users', { password: data.password.value })
            alert('update successfully');
            firebase.auth().signOut()
        }).catch(function (error) {
            controller.authenticate(error)
            console.log(error);
        });
    }).catch(function (error) {
        console.log(error);
    });

}
model.getDataFireStore = async (collection, find, check = null) => {
    let db = firebase.firestore()
    if (check == null) {
        let data = await db.collection(`${collection}`)
            .where(`${find}`, "==", firebase.auth().currentUser.email)
            .get()
        return data.docs[0].data()
    }
    else {
        let data = await db.collection(`${collection}`)
            .where(`${find}`, `${check}`, firebase.auth().currentUser.email)
            .get()
        return data.docs
    }
}
model.findConversation = async (collection, find, email) => {
    let db = firebase.firestore()
    let data = await db.collection(`${collection}`)
        .where(`${find}`, "in", [[`${email}`, `${firebase.auth().currentUser.email}`], [`${firebase.auth().currentUser.email}`, `${email}`]])
        .get()
    if (data.docs[0] == undefined) return undefined
    return data.docs[0]
}

model.getInfoUser = async (email) => {
    let db = firebase.firestore()
    let data = await db.collection('users').where("email", "==", email).get()
    if(data.docs[0] !== undefined)
    return data.docs[0].data()
    else return null
}

model.getTest = async (user) => {
    const yourRooms = await firebase.firestore().collection('rooms').where("host", "==", user).get()
    model.yourRoom = getDataFromDocs(yourRooms.docs)
    view.showRooms(model.yourRoom, view.getYourRooms)
}

model.updateDataToFireStore = async (collection, data) => {
    ;
    let db = firebase.firestore()
    let doc = await db.collection(`${collection}`).where("email", "==", firebase.auth().currentUser.email).get()
    db.collection(`${collection}`).doc(`${doc.docs[0].id}`).update(data)
}
model.getFirebaseDocument = async (collection, document) => {
    let data = await model.initFirebaseStore().collection(collection).doc(`${document}`).get()
    return data.data()
}
model.firestoreArryUnion = (collection, document, data) => {
    let db = firebase.firestore()
    db.collection(collection).doc(document).update({
        check: false,
        messages: firebase.firestore.FieldValue.arrayUnion({
            content: data,
            createdAt: controller.getDate(),
            owner: firebase.auth().currentUser.email
        })
    })
}
model.listenConversation = () => {
    let db = model.initFirebaseStore().collection('conversations').onSnapshot(function (snapshot) {
        snapshot.docChanges().forEach(async function (change) {
            if (change.type === "added") {
                console.log("added");
                console.log(change.doc.data().users);
                if(change.doc.data().users.find((item)=>item == firebase.auth().currentUser.email)){
                    view.addNotification(change.doc.data(), change.doc.id)
                }
                model.updateModelConversation()
            }
            if (change.type === "modified") {
                console.log("Modified city: ", change.doc.data());
                model.updateModelConversation()
                let messageData = change.doc.data().messages
                let modelConversation = model.allConversation.find((item)=>item.id == change.doc.id)
                if (model.currentConversation !== null) {
                    if (change.doc.id == model.currentConversation.id && messageData.length !== modelConversation.messages.length) {
                        let box = document.querySelector('.message-box')
                        let friendImg = await model.getInfoUser(change.doc.data().users.find(
                            (user) => user !== firebase.auth().currentUser.email))
                        let messages = change.doc.data().messages
                        let html = ''
                        let messageBox = document.querySelector('.message-box')
                        if (messages[messages.length - 1].owner == firebase.auth().currentUser.email)
                            html += view.addYourMessage(messages[messages.length - 1].content)
                        else html += view.addFriendMessage(messages[messages.length - 1].content, friendImg.photoURL)
                        messageBox.innerHTML += html
                        box.scrollTop = box.scrollHeight
                    }
                  
                }
                let font = document.getElementById(`${change.doc.id}`)
                font.remove()
                view.addNotification(change.doc.data(), change.doc.id)
                // let notification = document.querySelector('.new-notification')
                // let friendImg = await model.getInfoUser(change.doc.data().users.find(
                //     (user)=>user!==firebase.auth().currentUser.email))
                //     let htmlx = `
                //     <div class="sub-notification" id="${change.doc.id}">
                //         <div class="owner-notification">
                //             <img src="${friendImg.photoURL}">
                //         </div>
                //         <div class="notification-box">
                //             <div>${friendImg.email}</div>
                //             <div class="content-notification">
                //                 ${change.doc.data().messages[change.doc.data().messages.length-1].content}
                //             </div>
                //         </div>
                //     </div>
                // `
                // notification.insertAdjacentHTML('afterbegin',htmlx)
                // let notificationBox = document.querySelector(`#${change.doc.id} .content-notification`)
                // notificationBox.innerHTML = `${change.doc.data().messages[change.doc.data().messages.length-1].content}`


            }
        })
    })
    return db
}
model.updateCheckConversation = (collection, document, data) => {
    let db = firebase.firestore()
    db.collection(collection).doc(document).update({
        check: data
    })
}
model.updateModelConversation = async()=>{
    let allconversation = await model.getDataFireStore('conversations', 'users', 'array-contains')
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
        model.allConversation = controller.sortByTimeStamp(conversations)
    }
}