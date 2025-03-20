import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_bbC5DAQ32mXOkzus8LoIhlacbtfTqbs",
  authDomain: "resume-evaluator-b626a.firebaseapp.com",
  projectId: "resume-evaluator-b626a",
  storageBucket: "resume-evaluator-b626a.appspot.com", 
  messagingSenderId: "450587942475",
  appId: "1:450587942475:web:81b74e9b57b29ef9ba37ce",
  measurementId: "G-80T0V5B4RK"
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

module.exports ={
    storage
}
