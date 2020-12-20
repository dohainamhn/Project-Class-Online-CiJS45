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
    firebase
        .auth()
        .createUserWithEmailAndPassword(data.email.value, data.password.value)
        .then((res) => {
            firebase
                .auth()
                .currentUser.updateProfile({
                    displayName: data.lastName.value + " " + data.firstName.value,
                    photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/220px-User_icon_2.svg.png",
                })
                .then(() => {
                    model.addFireStore("users", {
                        name: res.user.displayName,
                        email: res.user.email,
                        isTeacher: data.checkJob.value,
                        password: data.password.value,
                        photoURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/220px-User_icon_2.svg.png",
                    });
                });
            firebase.auth().currentUser.sendEmailVerification();
            alert("The email has been registered,please check your email");
            view.setActiveScreen("signInScreen", data);
        })
        .catch(function(error) {
            view.errorMessage("signup-all-error", error.message);
        });
}
model.login = (data) => {
    firebase.auth().signInWithEmailAndPassword(data.email.value, data.password.value)
        .then((res) => {
            if (!res.user.emailVerified) {
                alert('please verify your email')
            }
        })
        .catch(function(error) {
            console.log(error);
            controller.authenticate(error)
        });
}
model.initFirebaseStore = () => {
    return firebase.firestore()
}
model.getRoomInfo = async(id) => {
    let data = await model.initFirebaseStore().collection(model.collectionName).doc(`${id}`).get()
    return data.data()
}
model.getUserIntoRoom = async(idstream = null, currentRoomID) => {
    if (idstream !== null) {
        let data = await firebase.database().ref(`${currentRoomID}/` + idstream).once('value')
        return data.val()
    } else {
        let data = await firebase.database().ref(`${currentRoomID}`).once('value')
        return data.val()
    }
}
model.createRoom = async(room) => {
    await firebase.firestore().collection(model.collectionName).add(room)
}
model.listenRoomChange = (listenChat) => {
    let db = model.initFirebaseStore().collection('rooms').onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
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
                if (model.rooms.length <= 8) {
                    view.addNewRoom(change.doc.id, change.doc.data())
                }
                console.log(listenChat);
                // console.log("New city: ", change.doc.data());
                view.adddDevidePageBtn()
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
        onVideo:true,
        photoURL: firebase.auth().currentUser.photoURL
    });
    ref.onDisconnect().remove();
}

model.removeUserInRoom = (id, currentRoomID) => {
    firebase.database().ref(`${currentRoomID}/` + id).remove();
}
model.getDoc = async() => {
    const snapshot = await firebase.firestore().collection(model.collectionName).get()
    return snapshot.docs.map(doc => doc.data());
}

model.addFireStore = (collection, data) => {
    var db = firebase.firestore();
    db.collection(collection).add(data)
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
            model.key = docRef.id
            return docRef.id
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
}
model.resetPassword = (data) => {
    var user = firebase.auth().currentUser;
    var credentials = firebase.auth.EmailAuthProvider.credential(
        user.email,
        data.currentPassword.value
    );
    user.reauthenticateWithCredential(credentials).then(function() {
        user.updatePassword(data.password.value).then(function() {
            model.updateDataToFireStore('users', { password: data.password.value })
            alert('update successfully');
            firebase.auth().signOut()
        }).catch(function(error) {
            controller.authenticate(error)
            console.log(error);
        });
    }).catch(function(error) {
        console.log(error);
    });

}
model.getDataFireStore = async(collection, find, check = null) => {
    let db = firebase.firestore()
    if (check == null) {
        let data = await db.collection(`${collection}`)
            .where(`${find}`, "==", firebase.auth().currentUser.email)
            .get()
        return data.docs[0].data()
    } else {
        let data = await db.collection(`${collection}`)
            .where(`${find}`, `${check}`, firebase.auth().currentUser.email)
            .get()
        return data.docs
    }
}
model.findConversation = async(collection, find, email) => {
    let db = firebase.firestore()
    let data = await db.collection(`${collection}`)
        .where(`${find}`, "in", [
            [`${email}`, `${firebase.auth().currentUser.email}`],
            [`${firebase.auth().currentUser.email}`, `${email}`]
        ])
        .get()
    if (data.docs[0] == undefined) return undefined
    return data.docs[0]
}

model.getInfoUser = async(email) => {
    let db = firebase.firestore()
    let data = await db.collection('users').where("email", "==", email).get()
    if (data.docs[0] !== undefined)
        return data.docs[0].data()
    else return null
}

model.getTest = async(user,listenChat) => {
    const yourRooms = await firebase.firestore().collection('rooms').where("host", "==", user).get()
    model.yourRoom = getDataFromDocs(yourRooms.docs)
    view.showRooms(model.yourRoom, view.getYourRooms,listenChat)
}

model.updateDataToFireStore = async(collection, data) => {
    let db = firebase.firestore()
    let doc = await db.collection(`${collection}`).where("email", "==", firebase.auth().currentUser.email).get()
    db.collection(`${collection}`).doc(`${doc.docs[0].id}`).update(data)
}
model.deleteDataFireStore = (collection, document) => {
    let db = firebase.firestore()
    db.collection(collection).doc(document).delete();
}
model.getFirebaseDocument = async(collection, document) => {
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
    let db = model.initFirebaseStore().collection('conversations').onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(async function(change) {
            if (change.type === "added") {
                let friendImg = await model.getInfoUser(change.doc.data().users.find(
                    (user) => user !== firebase.auth().currentUser.email))
                console.log(friendImg);
                console.log("added");
                console.log(change.doc.data().users);
                if (change.doc.data().users.find((item) => item == firebase.auth().currentUser.email)) {
                    view.addNotification(change.doc.data(), change.doc.id, friendImg.photoURL, friendImg.email)
                }
                model.updateModelConversation()
            }
            if (change.type === "modified") {
                console.log("Modified city: ", change.doc.data());
                let box = document.querySelector('.message-box')
                let friendImg = await model.getInfoUser(change.doc.data().users.find(
                    (user) => user !== firebase.auth().currentUser.email))
                    let modelConversation = model.allConversation.find((item)=>item.id == change.doc.id)
                let messageData = change.doc.data().messages
                if (model.currentConversation !== null) {
                    if (change.doc.id == model.currentConversation.id && messageData.length !== modelConversation.messages.length) {
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
                model.allConversation.find((item,index) => {
                    if(item.id == change.doc.id){
                        model.allConversation[index].messages = change.doc.data().messages
                        return item
                    }
                })
               if(modelConversation !== undefined){
                let font = document.getElementById(`${change.doc.id}`)
                font.remove()
                view.addNotification(change.doc.data(), change.doc.id, friendImg.photoURL, friendImg.email)
               }
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
model.updateModelConversation = async(imgLink) => {
    let allconversation = await model.getDataFireStore('conversations', 'users', 'array-contains')
    model.allConversation = []
    let conversations = []
    if (allconversation.length !== 0) {
        for (let x of allconversation) {
            let friendImg = await model.getInfoUser(x.data().users.find(
                (user) => user !== firebase.auth().currentUser.email))
            conversations.push({
                createdAt: controller.convertToTimeStamp(x.data().messages[x.data().messages.length - 1]['createdAt']),
                messages: x.data().messages,
                id: x.id,
                users: x.data().users,
                friendImg: friendImg.photoURL,
                friendEmail: x.data().users.find((item) => item !== firebase.auth().currentUser.email)
            })
        }
        model.allConversation = controller.sortByTimeStamp(conversations)
    }
}
model.addRoomScreenShare = async(collection, document, data) => {
    let db = firebase.firestore()
    let doc = await db.collection(collection).doc(document).update({
        screenShareId: data.screenId,
        ScreenShareName: data.name
    })
}
model.forgotPassword = (data) => {
    firebase
        .auth()
        .sendPasswordResetEmail(data.email.value)
        .then(() => {
            alert(
                "sent link reset password to your email address, please check your email"
            );
            view.setActiveScreen("signInScreen");
        })
        .catch((error) => {
            view.errorMessage('email', error.message);
        });
};
model.updateCurrentUser = (data) => {
    firebase.auth().currentUser.updateProfile({
        displayName: data.name
    })
}