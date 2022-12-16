//Redirrects to homepage if active sesssion
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("sessionData")) {
    fetch("http://localhost:8000/checkSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(JSON.parse(localStorage.getItem("sessionData"))),
    }).then((res) => {
      if (res.status != 200) {
        location.href = "/login.html";
      }
    });
  } else {
    location.href = "/login.html";
  }
});

// Ends current session and signs user out
document.getElementById("logOut").addEventListener("click", (e) => {
  let session = localStorage.getItem("sessionData");
  let sessionParsed = JSON.parse(session);
  e.preventDefault();
  // Delete request to end session in database
  fetch("http://localhost:8000/endSession", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sessionParsed),
  }).then((res) => {
    // if request successful removes session data from client and redirrects to login page
    if (res.status == 200) {
      localStorage.removeItem("sessionData");
      location.href = "/login.html";
    } else {
      window.alert("An error occurred while logging out, please try again");
    }
  });
});

//socket.io app inspiration from Web Dev Simplified: https://www.youtube.com/watch?v=rxzOqP9YwmM

//connection
const socket = io("localhost:9000");

//receives messages
socket.on("chatMessage", (data) => {
  addMessage(data.userName + ": " + data.message);
});
socket.on("chatterJoined", (userName) => {
  addMessage(userName + " joined the chat");
});
socket.on("chatterDisconnected", (userName) => {
  addMessage(userName + " left the chat");
});

//chat variables
const userName = JSON.parse(localStorage.getItem("sessionData")).userName;
let sendContainer = document.getElementById("sendContainer");
let messageInput = document.getElementById("message");
let messagesContainer = document.getElementById("messagesContainer");

//sends message to server
socket.emit("newChatter", userName);
sendContainer.addEventListener("submit", (e) => {
  const message = messageInput.value;
  e.preventDefault();
  //shows you own messages to you
  addMessage(`You: ${message}`);

  socket.emit("sendMessage", message);
  messageInput.value = "";
});

//adds messages to html
function addMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.innerText = message;
  messagesContainer.prepend(messageDiv);
}

//welcome
addMessage(`Welcome ${userName}`);
