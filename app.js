// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAJwFJqUFkrl9gSrwpNALXFv9VuQKuunys",
  authDomain: "developer-divas.firebaseapp.com",
  projectId: "developer-divas",
  storageBucket: "developer-divas.firebasestorage.app",
  messagingSenderId: "468902482726",
  appId: "1:468902482726:web:bedbd34b528557bbf727e7",
  measurementId: "G-W96RWLW9MF"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ✅ Allowed Gmail users
const allowedUsers = [
  "hemantkumarsonare@gmail.com",
  "shivangimhaski@gmail.com",
  "ajitsonare@gmail.com"
];

// Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const messagesDiv = document.getElementById("messages");
const fileInput = document.getElementById("file-input");

// Login
loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

// Logout
logoutBtn.onclick = () => auth.signOut();

// Auth state
auth.onAuthStateChanged(user => {
  if (user && allowedUsers.includes(user.email)) {
    loginScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");
    loadMessages();
  } else {
    loginScreen.classList.remove("hidden");
    chatScreen.classList.add("hidden");
    if(user) alert("Access restricted!");
  }
});

// Load messages
function loadMessages() {
  db.collection("messages").orderBy("timestamp")
    .onSnapshot(snapshot => {
      messagesDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        const div = document.createElement("div");
        div.textContent = msg.text || msg.fileName;
        messagesDiv.appendChild(div);
      });
    });
}

// Send message
sendBtn.onclick = () => {
  const text = messageInput.value;
  const file = fileInput.files[0];
  if (file) {
    const ref = storage.ref("files/" + file.name);
    ref.put(file).then(() => {
      ref.getDownloadURL().then(url => {
        db.collection("messages").add({
          fileName: file.name,
          fileURL: url,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    });
  }
  if (text.trim() !== "") {
    db.collection("messages").add({
      text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  messageInput.value = "";
  fileInput.value = "";
}
