import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';
import * as firebase from 'firebase';
import { snapshotToArray } from "../../app/app.firebase.config";
import { snapshotChanges } from 'angularfire2/database';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';

/**
 * Generated class for the NewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
})
export class NewsPage {
  items = [];
  account = firebase.auth().currentUser;
  ref = firebase.database().ref('annoucements/');
  inputText: string = '';
  admin: boolean = false;

  constructor(private afAuth: AngularFireAuth, private toast: ToastController,
    public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController) {
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

  ionViewDidLoad() {
    var btnAdmin = document.getElementById("btnAdmin");
    this.afAuth.authState.subscribe(data => {
      if (data.email === "admin@admin.com") {
        btnAdmin.style.display = "block";
        this.admin = true;
      } else {
        btnAdmin.style.display = "none";
        this.admin = false;
      }
    })
  }

  editItem(key) {
    if (this.admin) {
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
                firebase.database().ref(`annoucements/` + key).update({ name: data.name });
              }
            }
          },
          {
            text: 'Delete',
            handler: () => {
              firebase.database().ref(`annoucements/` + key).remove();
            }
          }
        ]
      });
      alert.present();
    }
  }

}
