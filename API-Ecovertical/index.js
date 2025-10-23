// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDM-g4GV6h5zU7zQNgCTmAxq44KS5rKJfE",
    authDomain: "ecovertical-f78d0.firebaseapp.com",
    projectId: "ecovertical-f78d0",
    storageBucket: "ecovertical-f78d0.firebasestorage.app",
    messagingSenderId: "743796682893",
    appId: "1:743796682893:web:c4f28e6b0a7eff2ce1f2c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getDatabase(app)

const writeData = () => {
    set(ref(db, 'users/usuario'), {
        username: "name",
        email: "email",
        profile_picture: "imageUrl"
    });

    console.log("guardado");
    
}

writeData()