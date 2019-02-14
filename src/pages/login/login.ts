import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { User } from '../../models/user';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  myForm: FormGroup;
  user = {} as User;
  constructor(private afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, private toast: ToastController) {
    this.myForm = formBuilder.group({
      email: ['', Validators.compose([Validators.pattern('.+@[a-z0-9]+\\.[a-z]+'), Validators.required])],
      password: ['', Validators.compose([Validators.pattern('[a-zA-Z0-9 ]+'), Validators.required])]
    });
  }

  async login() {
    try {
      const result = await this.afAuth.auth.signInWithEmailAndPassword(this.myForm.value.email, this.myForm.value.password);
      if (result) {
        // if (this.myForm.value.email === "admin@admin.com") {
        //   this.navCtrl.setRoot('AdminPage');
        // } else {
          this.navCtrl.setRoot('HomePage');
        //}
      }
    } catch (e) {
      this.toast.create({
        message: `Could not find authentication`,
        duration: 3000
      }).present();
      console.error(e);
    }
  }

  register() {
    this.navCtrl.push('RegisterPage');
  }
}