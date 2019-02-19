import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';
import * as firebase from 'firebase';
import { snapshotToArray } from "../../app/app.firebase.config";
import { snapshotChanges } from 'angularfire2/database';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Camera, CameraOptions } from '@ionic-native/camera';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  user = {} as User;
  items = [];
  account = firebase.auth().currentUser;
  ref = firebase.database().ref(`accounts/${this.account.uid}/messages`);
  inputText: string = '';
  refImage = firebase.database().ref(`accounts/${this.account.uid}/details`);

  constructor(private afAuth: AngularFireAuth, private toast: ToastController,
    public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController, private camera: Camera) {
    this.ref.on('value', resp => {
      this.items = snapshotToArray(resp);
    });
  }

  addItem(item) {
    if (item != undefined && item !== null) {
      let newItem = this.ref.push();
      newItem.set(item);
      this.inputText = '';
    }
  }

  async takePhoto(key) {
    try {
      const options: CameraOptions = {
        quality: 50,
        targetHeight: 50,
        targetWidth: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true
      }

      const result = await this.camera.getPicture(options);

      const image = `data:image/jpeg;base64,${result}`;

      var uploadTask = firebase.storage().ref(`pictures/${this.account.uid}/messages/` + key).child('item').putString(image, 'data_url');

      uploadTask.on('state_changed', function (snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (uploadTask.snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function (error) {
        // Handle unsuccessful uploads
      }, () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at: ', downloadURL);
          let newRef = firebase.database().ref(`accounts/${this.account.uid}/messages/` + key).update({ image: downloadURL });
        });
      });

    } catch (e) {
      console.error(e);
    }
  }

  editPhoto(key) {
    let alert = this.alertCtrl.create({
      title: 'Edit Photo',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Change Photo',
          handler: async () => {
            try {
              const options: CameraOptions = {
                quality: 50,
                targetHeight: 100,
                targetWidth: 100,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                correctOrientation: true
              }

              const result = await this.camera.getPicture(options);

              const image = `data:image/jpeg;base64,${result}`;

              var uploadTask = firebase.storage().ref(`pictures/${this.account.uid}/messages/`+key).child('item').putString(image, 'data_url');

              uploadTask.on('state_changed', function (snapshot) {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (uploadTask.snapshot.state) {
                  case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                  case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
                }
              }, function (error) {
                // Handle unsuccessful uploads
              }, () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                  console.log('File available at: ', downloadURL);
                  firebase.database().ref(`accounts/${this.account.uid}/messages/` + key).update({ image: downloadURL });
                });
              });
            } catch (e) {
              console.error(e);
            }
          }
        },
        {
          text: 'Delete Photo',
          handler: () => {
            firebase.database().ref(`accounts/${this.account.uid}/messages/` + key).update({ image: "" });
            firebase.storage().ref(`pictures/${this.account.uid}/messages/` + key).delete();
          }
        }
      ]
    });
    alert.present();
  }

  editItem(key) {
    let alert = this.alertCtrl.create({
      title: 'Edit item',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Edit',
          handler: data => {
            if (data.name !== undefined && data.name.length > 0) {
              firebase.database().ref(`accounts/${this.account.uid}/messages/` + key).update({ name: data.name });
            }
          }
        },
        {
          text: 'Add Photo',
          handler: data => {
            this.takePhoto(key);
          }
        },
        {
          text: 'Delete',
          handler: () => {
            firebase.database().ref(`accounts/${this.account.uid}/messages/` + key).remove();
          }
        }
      ]
    });
    alert.present();
  }

  ionViewDidLoad() {
    this.afAuth.authState.subscribe(data => {
      if (data && data.email && data.uid) {
        this.toast.create({
          message: `Welcome, ${data.email}`,
          duration: 3000
        }).present();
      } else {
        this.toast.create({
          message: `Could not find authentication`,
          duration: 3000
        }).present();

      }
    })
  }

  deleteAccount() {

    firebase.storage().ref(`pictures/${this.account.uid}/myPhoto`).delete();
    firebase.database().ref(`accounts/${this.account.uid}`).remove();
    this.afAuth.authState.first().subscribe((authState) => {
      authState.delete();
    });
    this.navCtrl.setRoot('LoginPage');
  }

  logout() {
    try {
      this.afAuth.auth.signOut().then(() => {
        this.navCtrl.setRoot('LoginPage');
      });
    } catch (e) {
      console.error(e);
    }
  }

  accountDetails() {
    this.navCtrl.push('AccountPage');
  }

  annoucements() {
    this.navCtrl.push('NewsPage');
  }
}
