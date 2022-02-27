import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, LoadingController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GeoFirestore } from 'geofirestore';
import { Observable } from 'rxjs';
import firebase from 'firebase/app';

@Component({
  selector: 'app-nearby',
  templateUrl: './nearby.page.html',
  styleUrls: ['./nearby.page.scss'],
})
export class NearbyPage implements OnInit {

  allNearbyFriend = [];
  showNearby = [];
  myInfo: Observable<any>;
  userku: any;

  constructor(
    private geolocation: Geolocation,
    private alert: AlertController,
    private loading: LoadingController,
    private store: AngularFirestore,
    private auth: AngularFireAuth,
  ) {
    this.auth.currentUser.then((usr) => {
      this.myInfo = this.store.collection('infoUsers').doc(usr.uid).valueChanges();
      this.userku = usr;
    });
  }

  doRefresh(event) {
    this.initGeolocation();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 4000);
  }

  initGeolocation() {
    this.geolocation.getCurrentPosition().then((response: any) => {
      if (response.coords) {
        this.findNearbyGF(response.coords.latitude, response.coords.longitude);
      }
    }, (err) => {
      console.log('Error Geolocation', err);
      this.alert.create({
        message: 'Terjadi kendala saat mencari lokasi!',
        header: 'Kendala terjadi.',
        buttons: [
          {
            text: 'Tutup'
          }
        ]
      }).then((a) => a.present());
    });
  }

  findNearbyGF(lat: number, lng: number) {
    this.auth.currentUser.then((user) => {
      const geofs = new GeoFirestore(this.store.firestore);
      const querygf = geofs.collection('infoUsers').near({
        center: new firebase.firestore.GeoPoint(lat, lng),
        radius: 10, // dalam km
        limit: 50
      });
      querygf.get().then((documents) => {
        this.allNearbyFriend = [];
        documents.docs.forEach((el) => {
          if (el.exists) {
            const dokumen = el.data();
            if (dokumen.uid !== user.uid) {
              dokumen.distance = el.distance;
              this.allNearbyFriend.push(dokumen);
            }
          }
        });
        this.showNearby = this.allNearbyFriend;
      });
    });
  }

  addToFriend(idFriend: string, index: number) {
    this.loading.create({
      message: 'Menambahkan teman...',
      spinner: 'crescent',
      duration: 60 * 1000,
      animated: true,
    }).then(async (l) => {
      l.present();
      const user = await this.auth.currentUser;
      const info = this.store.collection('infoUsers').doc(user.uid).get();
      info.subscribe((snap) => {
        if (snap.exists) {
          const snapku: any = snap.data();
          const myFriend = (snapku.friendsList) ? snapku.friendsList : {};
          if (myFriend[idFriend] !== true) {
            myFriend[idFriend] = true;
            this.store.collection('infoUsers').doc(user.uid).update({
              friendsList: myFriend
            }).then(() => {
              this.store.collection('users').doc(user.uid).collection('atribute').doc('friends').update({
                friendCount: firebase.firestore.FieldValue.increment(1)
              }).then(() => {
                const friendList = (this.showNearby[index].friendsList) ? this.showNearby[index].friendsList : {};
                if (friendList[user.uid] !== true) {
                  friendList[user.uid] = true;
                  this.store.collection('infoUsers').doc(idFriend).update({
                    friendsList: friendList
                  }).then(() => {
                    this.showNearby[index].friendsList = friendList;
                    this.store.collection('users').doc(idFriend).collection('atribute').doc('friends').update({
                      friendCount: firebase.firestore.FieldValue.increment(1)
                    });
                    l.dismiss();
                  });
                } else {
                  l.dismiss();
                }
              });
            });
          } else {
            l.dismiss();
          }
        } else {
          l.dismiss();
        }
      });
    });
  }

  searchWhen(event) {
    const query = event.target.value.toLowerCase();
    if (query !== '') {
      this.showNearby = this.allNearbyFriend.filter((el) => {
        const name: string = el.name.toLowerCase();
        return name.includes(query);
      });
    } else {
      this.showNearby = this.allNearbyFriend;
    }
  }

  ngOnInit() {
    this.initGeolocation();
  }

}
