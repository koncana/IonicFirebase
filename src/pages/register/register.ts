import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/user';
import { AngularFireAuth } from 'angularfire2/auth';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  user = {} as User;
  myForm: FormGroup;

  constructor(private afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, private toast: ToastController) {
    this.myForm = formBuilder.group({
      email: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('.+@[a-z]+\\.[a-z]+'), Validators.required])],
      password: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('[a-zA-Z0-9 ]+'), Validators.required])]
    });
  }

  async register() {
    try {
      const result = await this.afAuth.auth.createUserWithEmailAndPassword(this.myForm.value.email, this.myForm.value.password);
      //const resultSignIn = await this.afAuth.auth.signInWithEmailAndPassword(this.myForm.value.email, this.myForm.value.password);
      if (result) {
        this.toast.create({
          message: `Register succesful`,
          duration: 3000
        }).present();
        this.navCtrl.push('RegisterAccountDetailsPage');
      }
    } catch (e) {
      this.toast.create({
        message: `Error`,
        duration: 3000
      }).present();
      console.error(e);
    }
  }
}
