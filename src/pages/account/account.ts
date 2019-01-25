import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import * as firebase from 'firebase';


@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {
  myForm: FormGroup;
  ref = firebase.database().ref('accounts/');
  public isToggled: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, private toast: ToastController) {
    this.myForm = formBuilder.group({
      nickname: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      age: ['', AccountPage.isValid],
      country: ['', Validators.required],
      sex: ['', Validators.required]

    });
  }

  saveData() {
    var newRef = this.ref.push();
    newRef.set({
      nickname: this.myForm.value.nickname,
      age: this.myForm.value.age,
      country: this.myForm.value.country,
      sex: this.myForm.value.sex
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
