const firebase = require('firebase');
require('firebase/firestore');

export class Firebase {
    constructor(){
        this.init._config = {
            apiKey: "AIzaSyDvtTOnCInaiiiY8Giz5j5mtMKo_De0Rv0",
            authDomain: "whatsapp-clone-b585e.firebaseapp.com",
            databaseURL: "https://whatsapp-clone-b585e.firebaseio.com",
            projectId: "whatsapp-clone-b585e",
            storageBucket: "whatsapp-clone-b585e.appspot.com",
            messagingSenderId: "120117486610",
            appId: "1:120117486610:web:eb41a239b31f9caf"
        }
        this.init();
    }

    init(){
        if (!window._initializedFirebase) {
            // Initialize Firebase
            firebase.initializeApp(this.init._config);
            //monitorar
            firebase.firestore().settings({
                timestampsInSnapshots: true
            });
            window._initializedFirebase = true;
        }         
    }

    static db(){
        return firebase.firestore();
    }

    static hd(){
        return firebase.storage();
    }

    initAuth(){
        return new Promise((s,f)=>{
            let provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
            .then(result=>{
                console.log(result);
                let token = result.credential.accessToken;
                let user = result.user;
                s({
                    user,
                    token
                })
            })
            .catch(err=>{
                f(err);
            });
        })
    }
}