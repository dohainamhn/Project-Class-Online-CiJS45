let init = () => {
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyBeZW2CzlJOzwC3Szr3kZnmtCprBsCR7MY",
        authDomain: "react-chat-81535.firebaseapp.com",
        databaseURL: "https://react-chat-81535.firebaseio.com",
        projectId: "react-chat-81535",
        storageBucket: "react-chat-81535.appspot.com",
        messagingSenderId: "91507817734",
        appId: "1:91507817734:web:fbe07fdd172e7684357287"
      };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged(async(user) => {
        if (user) {
            console.log(user);
            if (user.emailVerified) {
                let currentUser = await model.getInfoUser(user.email)
                console.log(currentUser);
                model.currentUser = {
                    displayName: user.displayName,
                    email: user.email,
                    isTeacher: currentUser.isTeacher
                };
                view.setActiveScreen("selectRoomScreen");
                // model.loadRooms()
            } else {
                firebase.auth().signOut()
                view.setActiveScreen("loginScreen");
            }
        } else {
            view.setActiveScreen("loginScreen");
        }
    });
}


window.onload = init
getDataFromDoc = (doc) => {
    const data = doc.data()
    data.id = doc.id
    return data
}
getDataFromDocs = (docs) => {
    return docs.map(item => getDataFromDoc(item))
        // for (let index = 0; index < listData.length; index++) {
        //     const element = getDataFromDoc(docs[index])
        //     listData.push(element)
        // }
        // return listData;

}