const controller = {}
controller.Validate = (data, check = false) => {
	for (let i in data) {
		data[i].value !== "" ?
			view.errorMessage(data[i].id, "") :
			view.errorMessage(data[i].id, "Please input " + data[i].name);
	}
	if (check) {
		if ((data.title.value !== "", data.email.value)) {
			model.addNewConversation(data);
		}
		return;
	}

	if (Object.keys(data)[4] === "confirmPassword") {
		if (data.password.value !== data.confirmPassword.value) {
			view.errorMessage(
				data.confirmPassword.id,
				"Password and Confirm Password doesn't macth"
			);
		} else {
			view.errorMessage(data.confirmPassword.id, "");

			if (
				data.firstName.value !== "" &&
				data.lastName.value !== "" &&
				data.email.value !== "" &&
				data.password.value !== ""
			) {
				model.register(
					data.firstName.value,
					data.lastName.value,
					data.email.value,
					data.password.value
				);
			}
		}
	} else {
		if (data.email.value !== "" && data.password.value !== "") {
			model.login(data.email.value, data.password.value);
		}
	}
};
controller.onOfMic = async (id) => {
	let data = await model.getUserIntoRoom(id, model.currentRoomID)
	let ref = firebase.database().ref(`${model.currentRoomID}/` + id)
	if (data.onMic) {
		if (id == agora.localStreams.camera.id) {
			agora.localStreams.camera.stream.muteAudio()
			ref.update({
				onMic: false
			})
			if (id == 12345) {
				let micBox = document.getElementById('video-bar')
				micBox.querySelector('.mic i').className = 'fas fa-microphone-slash'
			} else {
				let micBox = document.getElementById(`${id}1`)
				micBox.querySelector('.mic i').className = 'fas fa-microphone-slash'
			}
			console.log('mute self');
		} else {
			let find = agora.remoteStreams.find((item) => item.id == id)
			find.stream.muteAudio()
			console.log('mute :' + find.id);
			ref.update({
				onMic: false
			})
		}
	} else {
		if (id == agora.localStreams.camera.id) {
			agora.localStreams.camera.stream.unmuteAudio()
			ref.update({
				onMic: true
			})
			if (id == 12345) {
				let micBox = document.getElementById('video-bar')
				micBox.querySelector('.mic i').className = 'fas fa-microphone'
			} else {
				let micBox = document.getElementById(`${id}1`)
				micBox.querySelector('.mic i').className = 'fas fa-microphone'
			}
			console.log('unmute self');
		} else {
			let find = agora.remoteStreams.find((item) => item.id == id)
			find.stream.unmuteAudio()
			console.log('unmute :' + find.id);
			ref.update({
				onMic: true
			})
		}
	}

}
controller.checkChannelName = (data)=>{
	let find = model.rooms.find((item)=>item.channel == data)
	let error = document.getElementById('channelError')
	if(find == undefined) return true
	else {
		error.innerHTML = 'Channel Name has already exist'
		return false
	}
}
controller.checkNull = function (data) {
	let check = true
	for (let x in data) {
		console.log(x)
		let error = document.getElementById(`${x}`)
		if (data[x].value.trim() == "") {
			error.innerHTML = `${data[x].name} is required`
			check=false

		} else if (x == 'confirmPassword') {
			if (data[x].value !== data['password'].value) {
				error.innerHTML = `${data[x].name} does not match with password`
				check = false
			} else {
				error.innerHTML = ''
			}
		} else {
			error.innerHTML = ''
		}
	}
	return check
}
controller.resetPassword = (data) => {
	if (
		data.currentPassword !== "" &&
		data.password !== "" &&
		data.confirmPassword !== ""
	) {
		model.resetPassword(data)
	}
}
controller.logup = function (data) {
	if (data.email !== "" &&
		data.firstName.value !== "" &&
		data.lastName.value !== "" &&
		data.password.value !== "" &&
		data.confirmPassword.value !== "" &&
		data.confirmPassword.value === data.password.value &&
		data.isTeacher.value !== ""
	) {
		model.register(data)
	}
}
controller.authenticate = function (error) {
	console.log('nhay zo day');
	if (error.code == 'auth/weak-password') {
		let password = document.getElementById('password')
		password.innerHTML = 'Password must be more than 6 characters.'

	} else if (error.code == 'auth/email-already-in-use') {
		let email = document.getElementById('email')
		email.innerHTML = 'Email is already exist.'

	} else if (error.code == "auth/wrong-password") {
		let password = document.getElementById('password')
		password.innerHTML = 'Wrong Password'

	} else if (error.code == "auth/user-not-found") {
		let email = document.getElementById('email')
		email.innerHTML = 'Email does not exist.'

	} else if (error.code == "auth/invalid-email") {
		let email = document.getElementById('email')
		email.innerHTML = 'Email must have (.com) in the end'

	}
	console.log('nhay zo day2');
}
controller.login = function (data) {
	if (data.email !== "" &&
		data.password.value !== ""
	) {
		model.login(data)
	}
}
controller.getDate = () => {
	var today = new Date();
	var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	return date + ' ' + time;
}
controller.sortByTimeStamp = (data) => {
	let arrAfterSort = data.sort((a, b) => {
		return b.createdAt - a.createdAt
	})
	return arrAfterSort
}
controller.convertToTimeStamp = (data) => {
	if (data !== undefined) {
		let timeStamp = (new Date(data).getTime() / 1000)
		return timeStamp
	} else return ""
}
controller.checkUndefine = (item) => {
	if (item.data().messages[item.data().messages.length - 1]['content'] !== undefined) {
		return item.data().messages[item.data().messages.length - 1]['content']
	}
}
controller.sortByTimeStamp = (data) => {
	let arrAfterSort = data.sort((a, b) => {
		return b.createdAt - a.createdAt
	})
	return arrAfterSort
}