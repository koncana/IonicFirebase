export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDz3JeoN1yzFy4PBVSWepMRiDCV5AWkOu8",
  authDomain: "proyectolnd-15ad8.firebaseapp.com",
  databaseURL: "https://proyectolnd-15ad8.firebaseio.com",
  projectId: "proyectolnd-15ad8",
  storageBucket: "proyectolnd-15ad8.appspot.com",
  messagingSenderId: "377380630862"
};

export const snapshotToArray = snapshot => {
  let returnArray = [];
  snapshot.forEach(element => {
    let item = element.val();
    item.key = element.key;
    returnArray.push(item);
  });
  return returnArray;
}  