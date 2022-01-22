import './App.css';
import { initializeApp } from 'firebase/app'
import { getFirestore } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { serverTimestamp, collection, query, limit, orderBy, doc, addDoc } from "firebase/firestore";
import { useState } from 'react'

const firebaseConfig = {
  apiKey: "AIzaSyC75rnXvG7iubt1cdPIAsJruDlzbSpXdYE",
  authDomain: "jeu-de-momo.firebaseapp.com",
  projectId: "jeu-de-momo",
  storageBucket: "jeu-de-momo.appspot.com",
  messagingSenderId: "467827279911",
  appId: "1:467827279911:web:3e6aade2566a20a90ce602",
  measurementId: "G-ZMMG2502VE"
}

const app = initializeApp(firebaseConfig)

const auth = getAuth();

const firestore = getFirestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h1></h1>
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function ChatRoom() {
  const messagesRef = collection(firestore, 'messages')
  const q = query(messagesRef, orderBy('createdAt'), limit(25))

  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState("")

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('')
  }
  return (
    <div>
      <div>
        {messages && messages.map(message => <ChatMessage key={message.id} message={message} />)}
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">SEND</button>
      </form>
    </div>
  )
}

function SignIn() {
  const auth = getAuth();
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt='cestlealt' />
      <p>{text}</p>
    </div>
  )
}

export default App;
