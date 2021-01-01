import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyB_IZvB8dl6sjmKUFcyEsEfgsv0wbCL-Vw",
  authDomain: "wily-821fb.firebaseapp.com",
  projectId: "wily-821fb",
  storageBucket: "wily-821fb.appspot.com",
  messagingSenderId: "580901107282",
  appId: "1:580901107282:web:3f5ff2deb5dffeb134518b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore()
