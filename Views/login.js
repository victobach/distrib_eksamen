//Redirrects to homepage if active sesssion
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("sessionData")) {
    fetch("http://localhost:8000/checkSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(JSON.parse(localStorage.getItem("sessionData"))),
    }).then((res) => {
      if (res.status == 200) {
        location.href = "/frontpage.html";
      }
    });
  }
});

//loginBtn trigger
document
  .getElementById("loginBtn")
  .addEventListener("click", async function (e) {
    try {
      //generates random token
      function generateToken() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            var r = (Math.random() * 16) | 0,
              v = c == "x" ? r : (r & 0x3) | 0x8;

            return v.toString(16);
          }
        );
      }
      //generates session object
      function generateSession(userName) {
        let session = { userName: userName, token: generateToken() };
        return session;
      }

      let userNameValue = document.getElementById("userName").value;
      let passwordValue = document.getElementById("password").value;
      let userCredentials = {
        userName: userNameValue,
        password: passwordValue,
      };
      let session = generateSession(userCredentials.userName);
      e.preventDefault();

      let loginOK = false;

      //validates user
      await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userCredentials),
      }).then((res) => {
        //If successful redirrects to login.html
        if (res.status == 200) {
          loginOK = true;
          //location.href = "/index.html";
        } else {
          window.alert(
            "Incorrect username or password please try logging in again"
          );
        }
      });

      //creates session
      if (loginOK) {
        await fetch("http://localhost:8000/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(session),
        }).then((res) => {
          if (res.status == 200) {
            //saves session in localstorage
            localStorage.setItem("sessionData", JSON.stringify(session));
            location.href = "/frontpage.html";
          } else {
            window.alert("couldn't create session");
          }
        });
      }
    } catch {
      window.alert("Something went wrong please try signing in again");
    }
  });
