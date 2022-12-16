//redirrect

//create user
document.getElementById("createUser").addEventListener("click", (e) => {
  let userNameValue = document.getElementById("userName").value;
  let passwordValue = document.getElementById("password").value;
  let user = {
    userName: userNameValue,
    password: passwordValue,
  };
  e.preventDefault();
  fetch("http://localhost:8000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then((res) => {
    //If successful redirrects to login.html
    if (res.status == 200) {
      location.href = "/login.html";
    } else {
      window.alert("a user with that username already exists");
    }
  });
});
