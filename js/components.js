const components = {}
components.registerScreen = `
<div class="log-container">
    <div class="symbol absolute">Online Class</div>
    <div class="introduce-text">
        <p>
            Everyone is welcome.
        </p>
        <p>
            Online class Where helps you save time and  always opens for free
        </p>
    </div>
    <div class="main-log-container">
        <div class="img-left">
            <img src="../img/Healthy-Positive-Classroom.jpg" alt="">
        </div>
        <div class="form-log-up">
            <form id="register-form" action="">
                <div class="input-wrap">
                    <input placeholder="First Name" type="text" name="firstName">
                    <div class="error" id="firstName"></div>
                </div>
                <div class="input-wrap">
                    <input placeholder="Last Name" type="text" name="lastName">
                    <div class="error" id="lastName"></div>
                </div>
                <div class="input-wrap">
                    <input placeholder="Email" type="email" name="email">
                    <div class="error" id="email"></div>
                </div>
                <div class="input-wrap">
                    <input placeholder="Password" type="password" name="password">
                    <div class="error" id="password"></div>
                </div>
                <div class="input-wrap">
                    <input placeholder="Confirm Password" type="password" name="confirmPassword">
                    <div class="error" id="confirmPassword"></div>
                </div>
                <div class="check-is-teacher-box">
                    <div class="input-wrap">
                        <div class="check-box">
                            <input type="checkbox" id="isTeacher-input" name='isTeacher'>
                            <label for="isTeacher-input">Teacher</label>
                        </div>
                        <div class="check-box">
                            <input type="checkbox" id="isStudent-input" name='isStudent'>
                            <label for="isStudent-input">Student</label>
                        </div>
                    </div>
                    <div class="error" id="isTeacher"></div>
                </div>
                <div class="row">
                    <span>Do you already have an account? <div id="go-to-login">Login</div> </span>
                    <button class="bnt" type="submit">Logup</button>
                </div>
            </form>
        </div>
    </div>
</div>
`
components.loginScreen = `
<div class="log-container">
    <div class="symbol absolute">Online Class</div>
    <div class="introduce-text">
        <p>
            Everyone is welcome.
        </p>
        <p>
            Online class Where helps you save time and  always opens for free
        </p>
    </div>
    <div class="main-log-container">
        <div class="img-left">
            <img src="../img/Healthy-Positive-Classroom.jpg" alt="">
        </div>
        <div class="form-log-up">
            <form id="login-form" action="">
                <div class="input-wrap">
                    <input placeholder="Email" type="text" name="email">
                    <div class="error" id="email"></div>
                </div>
                <div class="input-wrap">
                    <input placeholder="Password" type="password" name="password">
                    <div class="error" id="password"></div>
                </div>
                <div class="row">
                    <span>You don't have an account? <div id="go-to-logup">Logup</div> </span>
                    <button class="bnt" type="submit">Logup</button>
                </div>
            </form>
        </div>
    </div>
</div>`

components.selectRoomScreen = `
<div class="container">
<div class="nav-bar">
    <div class="symbol">Online Class</div>
    <div class="search-bar">
        <div>
            <input placeholder="Search..." type="text" name="" id="myInput">
            <i class="fas fa-search"></i>
        </div>
    </div>
    <div class="nav-bar-info-User ">
        <div><img src="" alt=""></div>
        <div class="user-name cursor"></div>
        <div class="notification">
            <i class="far fa-envelope"></i>
            <div class="icon-notification"></div>
        </div>
        <div class="new-notification display-none">
               
        </div>
        <div class="log-out-bnt">
            <i class="fas fa-sign-out-alt"></i>
        </div>
    </div>
</div>
<div class="main-container">
    <div class="left-container">

    </div>
    <div class="right-container">
        <button class="new-room-bnt">Create New Room</button>
        <div class="room-list">

        </div>
    </div>
    <div class="chat-button cursor" id="icon-chat-container"></div>
    <div class="chat-one-to-one-container display-none">
        <button class="top-message-box">Please Enter your friend email to chat</button>
        <div class="top-input">
            <input type="tex" id="input-chat-email" placeholder="Enter your friend email">
        </div>
        <div class="wrap">
            <div class="box-chat">
                <div class="message-box">
                    
                </div>
                <div class="input-message">
                    <input placeholder="Enter your message">
                    <div class="icon"></div>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
`
components.classRoomScreen = `
<div class="class-room">
  <div class="video-bar">
      <div class="teacher-box " id="video-bar">
          <div class="video" id ="video-teacher">
              <div class="icon" id="icon"></div>
          </div>
          <div class="mic" id="teacher-mic">
              <i class="fas fa-microphone"></i>
          </div>
          <div class="info" id="infoTeacher"> Teacher</div>
      </div>
      <div class="video-student-box" id="video-student-box">

      </div>
  </div>
  <div class="sign-out" id="sign-out">
          <i class="fas fa-sign-out-alt"></i>
  </div>
  <div class="bottom-app ">
    <div class="tool-board ">
        <div class="tool" id="mouse-pointer"><i class="fas fa-mouse-pointer"></i></div>
        <div class="tool" id="hand"><i class="far fa-hand-rock"></i></div>
        <div class="tool" id="pencil"><i class="fas fa-pencil-alt"></i></div>
        <div class="tool" id="square"><i class="far fa-square"></i></div>
        <div class="tool" id="circle"><i class="far fa-circle"></i></div>
        <div class="tool" id="eraser"><i class="fas fa-eraser"></i></div>
        <div class="tool" id="text"><i class="fas fa-text-height"></i></div>
        <div class="tool" id="colorPicker" >
            <label for="pickColor"> 
                <i class="fas fa-palette"></i>
            </label>
            <input type="color" id="pickColor">
        </div>
        <div class="tool" id="newPage"><i class="far fa-file"></i></div>
        <div class="tool" id="uploadTool" >
            <label for="fileInput"> 
              <i class="fas fa-file-upload"></i>
            </label>
            <input type="file" accept="image/png, image/jpeg" id="fileInput"></div>
        </div>
    <div class="load-icon" id="load-icon"><i class="fas fa-spinner fa-spin"></i></div>
    <div class="" id="whiteboard">
    </div>
    <div class="chat-box ">
      <div class="message-container" id="message-container">

      </div>
      <input id="input-chat" placeholder="Enter your message" type="text">
    </div>
  </div>
</div>
`

components.createRoomScreen = `
<div class="create-room-container">
<div class="main" style="padding: 50px 20%;">
    <form id="create-conversation-form">
        <div>
            Create a new room
        </div>
        <div class="input-wrapper">
            <input type="text" placeholder="Room name" name="roomName">
            <div class="error" id="room-name-error"></div>
        </div>
        <div class="input-wrapper">
            <input type="text" placeholder="Title class" name="roomTtitle">
            <div class="error" id="room-title-error"></div>
        </div>
        <div class="input-wrapper">
            <input type="text" placeholder="chanel name" name="chanelName">
            <div class="error" id="room-chanel-error"></div>
        </div>
        <div class="input-wrapper">
        <input type="text" placeholder="password room" name="passwordRoom">
        <div class="error" id="room-password-error"></div>
    </div>
        <button class='btn' type="submit">Save</button>
        <button class='btn btn-light' type="button" id="back-to-chat">Cancel</button>
    </form>
</div>
</div>`
components.updateProfileScreen = `
<div class="container1">
<div class="nav-bar">
    <div class="symbol">Online Class</div>
    <div class="search-bar">
        <div>
            <input placeholder="Search user" type="text" name="" id="myInput">
            <i class="fas fa-search"></i>
            <ul class="result-search">
            </ul>
        </div>
    </div>
    <div class="nav-bar-info-User ">
        <div><img src="" alt=""></div>
        <div class="user-name cursor"></div>
        <div class="notification">
            <i class="far fa-envelope"></i>
            <div class="icon-notification"></div>
        </div>
        <div class="new-notification display-none">
               
        </div>
        <div class="log-out-bnt">
            <i class="fas fa-sign-out-alt"></i>
        </div>
    </div>
</div>
<div class="main-container1">
    <div class="upload-img">
        <div>
            <img src="https://static.thenounproject.com/png/558475-200.png" alt="">
            <label for="upload">
                <i class="fas fa-camera"></i>
            </label>
            <input type="file" accept="image/png ,image/jpeg,image/gif" id="upload" class="display-none">
        </div>
    </div>
    <div class="menu-div">
        <h1 class="title"> Profile</h1>
        <div class="menu-bnt">
            <div>
                <button id="profile-bnt" class="active-bnt">Profile</button>
                <button id="edit-profile-bnt" >Edit profile</button>
                <button id="edit-password-bnt">Edit password</button>
                <button id="view-room-of-current-user">View your room</button>
            </div>
        </div>
    </div>
    <div class="profile-box">
        
    </div>
    <div class="chat-button cursor" id="icon-chat-container"></div>
    <div class="chat-one-to-one-container display-none">
        <button class="top-message-box">chat with dohainamhn3@gmail.com</button>
        <div class="top-input">
            <input type="tex" id="input-chat-email" placeholder="Enter your friend email">
        </div>
        <div class="wrap">
            <div class="box-chat">
                <div class="message-box">
                    
                </div>
                <div class="input-message">
                    <input placeholder="Enter your message">
                    <div class="icon"></div>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
`
components.profileBox = `
<div class="profile-row pd-t-2">
<div class="info-profile">
    <div id="profile-name"></div>
    <div id="profile-email"></div>
</div>
<div class="info-profile">
    <div id="is-teacher"></div>
    <div id="work-at"></div>
</div>
</div>
<div class="about-me-profile">
<label>About Me:</label>
<p id="about-me">
    
</p>
</div>`
components.editProfileBox = `  
<form id="edit-profile-form" >
<div class="update-profile-bnt">
    <button type="submit" class="bnt" id="update-profile-bnt">Update</button>
</div>
<div class="profile-row">
    <div class="input-bar">
       <span class="label">First name</span>
       <input type="text" name="firstName">
    </div>
    <div class="check-is-teacher">
       <div class="inner-check">
           <input type="checkbox" name="isTeacher" id="isTeacher">
           <span class="label">Teacher</span">
       </div>
       <div class="inner-check">
        <input type="checkbox" name="isStudent" id="isStudent">
           <span class="label">Student</span>
       </div>
    </div>
</div>
<div class="profile-row">
<div class="input-bar">
    <span class="label">Last name</span>
    <input type="text" name="lastName">
</div>
<div class="work-at input-bar">
    <span class="label">Work/Study At</span>
    <input type="text" name="workAt">
</div>
</div>
<div class="profile-row">
<div class="profile-column">
    <div class="input-bar">
        <span class="label">Email</span>
        <div class="email-profile"></div>
    </div>
    <div class="input-bar mrt-2">
        <span class="label">Password</span>
        <div class="password-profile">************</div>
    </div>
</div>
    <div class="input-bar about-me">
        <span class="label">About me</span>
        <textarea name="aboutMe"  cols="30" rows="10"></textarea>
    </div>
</div>
</form>`
components.editPasswordBox = `
<form id="reset-password-form">
    <div class="input-bar mr-t-2">
        <span class="label">Current Password</span>
        <input type="password" name="currentPassword">
        <span class="error" id="currentPassword" ></span>
    </div>
    
    <div class="input-bar mr-t-2">
        <span class="label">New Password</span>
        <input type="password" name="password">
        <span class="error" id="password"></span>
    </div>
    <div class="input-bar mr-t-2">
        <span class="label">Confirm Password</span>
        <input type="password" name="confirmPassword">
        <span class="error" id="confirmPassword"></span>
    </div>
    <button type=submit" class="bnt">Confirm</button>
</form>
`
components.viewYourRoom = `

<div class="right-container">
    <button class="new-room-bnt">Create New Room</button>
    <div class="room-list">

    </div>
</div>

`
components.viewYourFriendProfile = `
<div class="container1">
<div class="nav-bar">
    <div class="symbol">Online Class</div>
    <div class="search-bar">
        <div>
            <input placeholder="Search user" type="text" name="" id="myInput">
            <i class="fas fa-search"></i>
            <ul class="result-search">
            </ul>
        </div>
    </div>
    <div class="nav-bar-info-User">
        <div><img src="" alt=""></div>
        <div class="user-name cursor"></div>
        <div class="notification">
            <i class="far fa-envelope"></i>
        </div>
        <div class="log-out-bnt">
            <i class="fas fa-sign-out-alt"></i>
        </div>
    </div>
</div>
<div class="main-container1">
    <div class="upload-img">
        <div>
            <img src="https://static.thenounproject.com/png/558475-200.png" alt="">
            <label for="upload">
                <i class="fas fa-camera"></i>
            </label>
            <input type="file" accept="image/png ,image/jpeg,image/gif" id="upload" class="display-none">
        </div>
    </div>
    <div class="profile-box">
    <div class="profile-row pd-t-2">
    <div class="info-profile">
        <div id="profile-name"></div>
        <div id="profile-email"></div>
    </div>
    <div class="info-profile">
        <div id="is-teacher"></div>
        <div id="work-at"></div>
    </div>
    </div>
    <div class="about-me-profile">
    <label>About Me:</label>
    <p id="about-me">
        
    </p>
    </div>
    </div>
</div>
</div>
`
components.friendChatMessage = `
<div class="friend-message">
    <img src="../img/teacher.png">
    <div class="message">hellosssssssssssssssssssssssssssssssssss</div>
</div>

`
components.yourChatMessage = `
<div class="your-message">
    <div class="message">aloooooooooooooooooooooooooooooooooooooo</div>
</div>
`