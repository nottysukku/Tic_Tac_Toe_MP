import "./App.css";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import Cookies from "universal-cookie";
import { useState, useEffect } from "react";
import JoinGame from "./components/JoinGame";

function App() {
  const api_key = "2qymy2mvb3xd";
  const cookies = new Cookies();
  const token = cookies.get("token");
  const client = StreamChat.getInstance(api_key);
  const [isAuth, setIsAuth] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const logOut = () => {
    cookies.remove("token");
    cookies.remove("userId");
    cookies.remove("firstName");
    cookies.remove("lastName");
    cookies.remove("hashedPassword");
    cookies.remove("channelName");
    cookies.remove("username");
    client.disconnectUser();
    setIsAuth(false);
  };

  useEffect(() => {
    if (token) {
      client
        .connectUser(
          {
            id: cookies.get("userId"),
            name: cookies.get("username"),
            firstName: cookies.get("firstName"),
            lastName: cookies.get("lastName"),
            hashedPassword: cookies.get("hashedPassword"),
          },
          token
        )
        .then(() => {
          setIsAuth(true);
        });
    }
  }, [token, client, cookies]);

  const handleSignUpClick = () => {
    setShowSignUp(true);
  };

  const handleLoginClick = () => {
    setShowSignUp(false);
  };

  const handleBackhome=()=>{
    window.location.href="https://game-site-orpin.vercel.app/";
  }

  return (
    <div className="App">
      {isAuth ? (
        <Chat client={client}>
          <JoinGame />
          <button id="logout" onClick={logOut}>Log Out</button>
        </Chat>
      ) : (
        <div>
          {showSignUp ? (
            <>
              <SignUp setIsAuth={setIsAuth} />
              <button id="asd" onClick={handleLoginClick}>
                Already signed up? Log in
              </button>
            </>
          ) : (
            <>
              <Login setIsAuth={setIsAuth} />
              <button id="asd" onClick={handleSignUpClick}>
                Haven't signed up yet? Sign up
              </button>
            </>
          )}
        </div>
      )}
      <button onClick={handleBackhome} id="backhome">Back Home?</button>
    </div>
  );
}

export default App;
