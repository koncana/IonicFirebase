import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';
import * as firebase from 'firebase';
import { snapshotToArray } from "../../app/app.firebase.config";
import { snapshotChanges } from 'angularfire2/database';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  user = {} as User;
  items = [];
  account = firebase.auth().currentUser;
  ref = firebase.database().ref(`accounts/${this.account.uid}`);
  inputText: string = '';
  // countryList: Array<any>;
  // loadedCountryList: Array<any>;
  // countryRef: firebase.database.Reference;

  constructor(private afAuth: AngularFireAuth, private toast: ToastController,
    public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController) {
    this.ref.on('value', resp => {
      this.items = snapshotToArray(resp);
    });
    // this.countryRef = firebase.database().ref('/items');
    // this.countryRef.on('value', countryList => {
    //   let countries = [];
    //   countryList.forEach(country => {
    //     countries.push(country.val());
    //     return false;
    //   });

    //   this.countryList = countries;
    //   this.loadedCountryList = countries;
    // });
  }



  // initializeItems(): void {
  //   this.countryList = this.loadedCountryList;
  // }

  // getItems(searchbar) {
  //   // Reset items back to all of the items
  //   this.initializeItems();

  //   // set q to the value of the searchbar
  //   var q = searchbar.srcElement.value;


  //   // if the value is an empty string don't filter the items
  //   if (!q) {
  //     return;
  //   }

  //   this.countryList = this.countryList.filter((v) => {
  //     if (v.name && q) {
  //       if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
  //         return true;
  //       }
  //       return false;
  //     }
  //   });

  //   console.log(q, this.countryList.length);

  // }

  addItem(item) {
    if (item != undefined && item !== null) {
      let newItem = this.ref.push();
      newItem.set(item);
      this.inputText = '';
    }
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
              firebase.database().ref(`accounts/${this.account.uid}/` + key).update({ name: data.name });
            }
          }
        },
        {
          text: 'Delete',
          handler: () => {
            firebase.database().ref(`accounts/${this.account.uid}/` + key).remove();
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
    this.afAuth.authState.first().subscribe((authState) => {
      authState.delete();
    });
    firebase.database().ref(`accounts/${this.account.uid}`).remove();
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

  annoucements(){
    this.navCtrl.push('NewsPage');
  }
}
