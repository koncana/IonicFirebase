import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { snapshotToArray } from "../../app/app.firebase.config";

@IonicPage()
@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
})
export class NewsPage {
  items = [];
  account = firebase.auth().currentUser;
  ref = firebase.database().ref('announcements/');
  inputText: string = '';
  admin: boolean = false;

  constructor(private afAuth: AngularFireAuth, public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController) {
    this.ref.on('value', resp => {
      this.items = snapshotToArray(resp);
    });

    // var btnAdmin = document.getElementById("btnAdmin");
    // this.afAuth.authState.subscribe(data => {
    //   if (data.email === "admin@admin.com") {
    //     btnAdmin.style.display = "block";
    //     this.admin = true;
    //   } else {
    //     btnAdmin.style.display = "none";
    //     this.admin = false;
    //   }
    // })
  }

  addItem(item) {
    if (this.admin && item != undefined && item !== null) {
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
