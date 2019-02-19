import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as firebase from 'firebase';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { snapshotToArray } from "../../app/app.firebase.config";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { storage } from 'firebase';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {
  base64Image: string = null;
  images: any = [];
  myForm: FormGroup;
  account = firebase.auth().currentUser;
  ref = firebase.database().ref(`accounts/${this.account.uid}/details`);
  isToggled: boolean = false;
  imageTaken: boolean = false;
  imageURL: any;
  items = [];
  refList: AngularFireList<any>;
  datas: Observable<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder,
    private toast: ToastController, private camera: Camera, private alertCtrl: AlertController, private afDatabase: AngularFireDatabase) {
    this.myForm = formBuilder.group({
      nickname: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      age: ['', AccountPage.isValid],
      country: ['', Validators.required],
      sex: ['', Validators.required]

    });
    this.refList = this.afDatabase.list(`accounts/${this.account.uid}/details`);
      this.datas = this.refList.snapshotChanges().map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
      });
    this.ref.on('value', resp => {
      this.items = snapshotToArray(resp);
    });
  }

  notify() {
    console.log(this.isToggled);
    this.isToggled = !this.isToggled;
    //firebase.database().ref('items/' + key).update({ isToogled: this.isToggled });
  }

  back() {
    this.navCtrl.pop();
  }

  static isValid(control: FormControl): any {

    if (isNaN(control.value)) {
      return {
        "not a number": true
      };
    }

    if (control.value % 1 !== 0) {
      return {
        "not a whole number": true
      };
    }

    if (control.value < 18) {
      return {
        "too young": true
      };
    }

    if (control.value > 120) {
      return {
        "not realistic": true
      };
    }

    return null;
  }

  editImage(key) {
    let alert = this.alertCtrl.create({
      title: 'Edit Photo',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Take photo',
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

              var uploadTask = firebase.storage().ref(`pictures/${this.account.uid}`).child('myPhoto').putString(image, 'data_url');

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
                  firebase.database().ref(`accounts/${this.account.uid}/details/` + key).update({ image: downloadURL });
                });
              });
            } catch (e) {
              console.error(e);
            }
          }
        },
        {
          text: 'Delete',
          handler: () => {
            firebase.database().ref(`accounts/${this.account.uid}/details/` + key).remove();
          }
        }
      ]
    });
    alert.present();
  }

  editAge(key) {
    let alert = this.alertCtrl.create({
      title: 'Edit Age',
      inputs: [
        {
          name: 'name',
          type: 'number',
          placeholder: 'Age'
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
            if (data.name !== undefined && data.name.length > 0 && data.name >= 18) {
              firebase.database().ref(`accounts/${this.account.uid}/details/` + key).update({ age: data.name });
            }
          }
        }
      ]
    });
    alert.present();
  }

  editSex(key) {
    let alert = this.alertCtrl.create({
      title: 'Edit Sex',
      inputs: [
        {
          name: 'Male',
          type: 'radio',
          label: 'Male',
          value: 'Male'
        },
        {
          name: 'Female',
          type: 'radio',
          label: 'Female',
          value: 'Female'
        },
        {
          name: 'Other',
          type: 'radio',
          label: 'Other',
          value: 'Other'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Edit',
          handler: (data: String) => {
            if (data != "") {
              firebase.database().ref(`accounts/${this.account.uid}/details/` + key).update({ sex: data });
            }
          }
        }
      ]
    });
    alert.present();
  }

  editCountry(key) {
    let alert = this.alertCtrl.create({
      title: 'Edit Country',
      inputs: [
        {
          name: 'Spain',
          type: 'radio',
          label: 'Spain',
          value: 'Spain'
        },
        {
          name: 'France',
          type: 'radio',
          label: 'France',
          value: 'France'
        },
        {
          name: 'Italy',
          type: 'radio',
          label: 'Italy',
          value: 'Italy'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Edit',
          handler: (data: String) => {
            if (data != "") {
              firebase.database().ref(`accounts/${this.account.uid}/details/` + key).update({ country: data });
            }
          }
        }
      ]
    });
    alert.present();
  }

  editName(key) {
    let alert = this.alertCtrl.create({
      title: 'Edit Nickname',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nickname'
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
              firebase.database().ref(`accounts/${this.account.uid}/details/` + key).update({ nickname: data.name });
            }
          }
        }
      ]
    });
    alert.present();
  }

}
