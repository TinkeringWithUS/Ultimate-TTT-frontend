import { URL } from "./socket"


export function postLogin(username) {
  const loginUrl = URL + "/login"; 

  let headers = new Headers(); 

  headers.append("Origin", "no-cors");

  fetch(loginUrl, {
    method: "POST", 
    mode: "cors",
    headers: {
      "Content-Type": "text/plain", 
    },
    body: username,
    headers: headers
  })
  .then(response => response.text())
  .then(data => {
    // res.then(data => {
    //   console.log("response in text " + data.text()); 
    // })
    console.log("response from server " + data);
  })
  .catch(error => {
    console.log("error when posting login error msg: " + error.message);
  });

}