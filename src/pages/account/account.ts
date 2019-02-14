import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as firebase from 'firebase';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { snapshotToArray } from "../../app/app.firebase.config";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { storage } from 'firebase';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {
  base64Image: string = null;
  images: any = [];
  myForm: FormGroup;
  account = firebase.auth().currentUser;;
  ref = firebase.database().ref(`accounts/${this.account.uid}`);
  isToggled: boolean = false;
  imageTaken: boolean = false;
  imageURL: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder,
    private toast: ToastController, private camera: Camera) {
    this.myForm = formBuilder.group({
      nickname: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      age: ['', AccountPage.isValid],
      country: ['', Validators.required],
      sex: ['', Validators.required]

    });
  }

 // onViewDidLoad(){
    //this.account = firebase.auth().currentUser;
   // this.ref = firebase.database().ref(`accounts/${this.account.uid}`);
 // }

  takePicture() {
    let options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000,
      quality: 100
    };

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.base64Image = `data:image/jpeg;base64,${imageData}`;
    }, (err) => {
      // Handle error
    });
  }

  async takePhoto() {
    try {
      const options: CameraOptions = {
        quality: 50,
        targetHeight: 600,
        targetWidth: 600,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true
      }

      const result = await this.camera.getPicture(options);

      const image = `data:image/jpeg;base64,${result}`;

      var uploadTask = firebase.storage().ref('pictures').child('myPhoto').putString(image, 'data_url');

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
      }, function () {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        uploadTask.snapshot.ref.getDownloadURL().then( (downloadURL) =>{

          console.log('File available at: ', downloadURL);
          this.imageURL = downloadURL;
        });
      });
      this.toast.create({
        message: this.imageURL,
        duration: 3000
      }).present();
      this.imageTaken = true;
    } catch (e) {
      console.error(e);
    }
  }

  // choosePicture() {
  //   const options = {
  //     maximumImagesCount: 1,
  //     width: 500,
  //     outputType: 1
  //   };
  //   this.imagePicker.getPictures(options).then((results) => {
  //     // for (let i = 0; i < results.length; i++) {
  //     //   this.images.push(`data:image/jpeg;base64,${results[i]}`);
  //     // };
  //     this.base64Image = `data:image/jpeg;base64,${results[0]}`;
  //   }, (err) => { });
  // }

  saveData() {
    var newRef = this.ref.push();
    newRef.set({
      nickname: this.myForm.value.nickname,
      age: this.myForm.value.age,
      country: this.myForm.value.country,
      sex: this.myForm.value.sex
      //image: this.imageURL
    });
    this.toast.create({
      message: `Account details added`,
      duration: 3000
    }).present();
    this.navCtrl.pop();
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
}
