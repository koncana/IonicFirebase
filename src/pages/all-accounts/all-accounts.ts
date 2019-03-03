import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormBuilder, FormControl } from '@angular/forms';
import * as firebase from 'firebase';
import { AngularFireList } from 'angularfire2/database';
import { snapshotToArray } from "../../app/app.firebase.config";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@IonicPage()
@Component({
  selector: 'page-all-accounts',
  templateUrl: 'all-accounts.html',
})
export class AllAccountsPage {

  base64Image: string = null;
  images: any = [];
  account = firebase.auth().currentUser;
  ref = firebase.database().ref(`accounts/${this.account.uid}/details`);
  imageTaken: boolean = false;
  imageURL: any;
  items: Array<{ route: string, itemKey: string, age: number, nickname: string, sex: string, country: string, image: string }> = [];
  refList: AngularFireList<any>;
  datas: Observable<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder,
    private camera: Camera, private alertCtrl: AlertController) {

    var refAccounts = firebase.database().ref(`accounts`);
    refAccounts.on('value', resp => {
      let accounts = snapshotToArray(resp);

      for (var key in accounts) {
        for (var detailsKey in accounts[key].details) {
          this.items[key] = { route: "", itemKey: "", age: 0, nickname: "", sex: "", country: "", image: "" };
          this.items[key].route = accounts[key].key;
          this.items[key].age = accounts[key].details[detailsKey].age;
          console.log(accounts);
          console.log(accounts[key]);
          console.log("3: " + accounts[key].details);
          console.log("4: " + accounts[key].details[detailsKey]);
          console.log("5: " + accounts[key].details[detailsKey].key);
          console.log("6: " + accounts[key].details.name);
          this.items[key].itemKey = accounts[key].details[detailsKey].key;
          this.items[key].nickname = accounts[key].details[detailsKey].nickname;
          this.items[key].sex = accounts[key].details[detailsKey].sex;
          this.items[key].country = accounts[key].details[detailsKey].country;
          this.items[key].image = accounts[key].details[detailsKey].image;
        }
      }
    });
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

  editImage(route, key) {
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

              var uploadTask = firebase.storage().ref('pictures/' + route).child('myPhoto').putString(image, 'data_url');

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
                  firebase.database().ref('pictures/' + route + '/details/' + key).update({ image: downloadURL });
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
            firebase.database().ref('pictures/' + route).remove();
          }
        }
      ]
    });
    alert.present();
  }

  editAge(route, key) {
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
              firebase.database().ref('accounts/' + route + '/details' + key).update({ age: data.name });
            }
          }
        }
      ]
    });
    alert.present();
  }

  editSex(route, key) {
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
              firebase.database().ref('accounts/' + route + '/details' + key).update({ sex: data });
            }
          }
        }
      ]
    });
    alert.present();
  }

  editCountry(route, key) {
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
              firebase.database().ref('accounts/' + route + '/details' + key).update({ country: data });
            }
          }
        }
      ]
    });
    alert.present();
  }

  editName(route, key) {
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
              firebase.database().ref('accounts/' + route + '/details' + key).update({ nickname: data.name });
            }
          }
        }
      ]
    });
    alert.present();
  }




}
