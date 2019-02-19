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
import { HomePage } from '../home/home';
import { ImagePicker } from '@ionic-native/image-picker';


@IonicPage()
@Component({
  selector: 'page-register-account-details',
  templateUrl: 'register-account-details.html',
})
export class RegisterAccountDetailsPage {
  base64Image: string = null;
  images: any = [];
  myForm: FormGroup;
  account = firebase.auth().currentUser;;
  ref = firebase.database().ref(`accounts/${this.account.uid}/details`);
  isToggled: boolean = false;
  imageTaken: boolean = false;
  imageURL: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder,
    private toast: ToastController, private camera: Camera, private imagePicker: ImagePicker) {
    this.myForm = formBuilder.group({
      nickname: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      age: ['', RegisterAccountDetailsPage.isValid],
      country: ['', Validators.required],
      sex: ['', Validators.required]

    });
  }

  choosePicture() {
    const options = {
      maximumImagesCount: 1,
      width: 500,
      outputType: 1
    };
    this.imagePicker.getPictures(options).then((results) => {
      this.base64Image = `data:image/jpeg;base64,${results[0]}`;
    }, (err) => { });

    var uploadTask = firebase.storage().ref(`pictures/${this.account.uid}`).child('myPhoto').putString(this.base64Image, 'data_url');

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
        this.imageURL = downloadURL;
        this.imageTaken = true;
      });
    });
  }

  async takePhoto() {
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
          this.imageURL = downloadURL;
          this.imageTaken = true;
        });
      });

    } catch (e) {
      console.error(e);
    }
  }

  saveData() {
    var newRef = this.ref.push();

    newRef.set({
      nickname: this.myForm.value.nickname,
      age: this.myForm.value.age,
      country: this.myForm.value.country,
      sex: this.myForm.value.sex,
      image: this.imageURL
    });

    this.toast.create({
      message: `Account details added`,
      duration: 3000
    }).present();

    this.navCtrl.setRoot('HomePage');
  }

  notify() {
    console.log(this.isToggled);
    this.isToggled = !this.isToggled;
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
