import { URL } from "./socket"


export async function sendName(username) {
  const loginUrl = URL + "/login"; 

  // let headers = new Headers(); 
  // headers.append("Origin", "no-cors");

  fetch(loginUrl, {
    method: "POST", 
    mode: "cors",
    headers: {
      "Content-Type": "text/plain", 
    },
    body: username,
    // headers: headers
  })
  .then(response => response.text())
  .then(data => {
    console.log("response from server " + data);
    console.log("data check: " + data === "bad name");
    console.log("data is:" + data); 
    return data === "good name";
  })
  .catch(error => {
    console.log("error when posting login error msg: " + error.message);
  });
}