import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import firebase from 'firebase/app';

import { Contacts, ContactFindOptions } from '@ionic-native/contacts/ngx';
import { CommonService } from 'src/app/services/common.service';
import { HttpClient } from '@angular/common/http';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { QrcodeComponent } from './qrcode/qrcode.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
})
export class FriendsPage implements OnInit {

  infoUsers: Observable<any>;
  showFriends = [];

  constructor(
    private modal: ModalController,
    private loading: LoadingController,
    private alert: AlertController,
    private barcodeScanner: BarcodeScanner,
    private permissions: AndroidPermissions,
    private store: AngularFirestore,
    private auth: AngularFireAuth,
    private contacts: Contacts,
    private http: HttpClient,
    private common: CommonService
  ) {
    this.auth.currentUser.then((user) => {
      this.infoUsers = this.store.collection('infoUsers', ref => ref.where('friendsList.' + user.uid, '==', true)).valueChanges();
    });
  }

  searchFriend(event) {
    const query = event.target.value.toLowerCase();
    if (query !== '') {
      this.showFriends = this.common.friendsList.filter((el) => {
        const name: string = el.name.toLowerCase();
        return name.includes(query);
      });
    } else {
      this.showFriends = this.common.friendsList;
    }
  }

  async addToMyFriend(uid: string) {
    const user = await this.auth.currentUser;
    this.store.collection('infoUsers').doc(user.uid).get().subscribe((resp) => {
      if (resp.exists) {
        const myinfo: any = resp.data();
        const friend = myinfo.friendsList;
        if (friend[uid] !== true) {
          friend[uid] = true;
          resp.ref.update({
            friendsList: friend
          }).then(() => {
            this.store.collection('users').doc(user.uid).collection('atribute').doc('friends').update({
              friendCount: firebase.firestore.FieldValue.increment(1)
            });
          });
        }
      }
    });
  }

  showMyQr() {
    this.modal.create({
      component: QrcodeComponent,
      animated: true,
      backdropDismiss: true,
    }).then((m) => {
      m.present();
    });
  }

  barcodeScan() {
    this.barcodeScanner.scan().then((data) => {
      if (data.text.includes('kandah:')) {
        let textUID = data.text;
        textUID.replace('kandah:', '');
        textUID = atob(textUID);

        this.loading.create({
          message: 'Menambahkan teman...',
          spinner: 'crescent',
          duration: 60 * 1000,
          animated: true,
        }).then(async (l) => {
          l.present();
          const user = await this.auth.currentUser;
          this.store.collection('infoUsers').doc(textUID).get().subscribe((snap) => {
            if (snap.exists) {
              const guest: any = snap.data();
              const myFriend = guest.friendsList;
              if (myFriend[user.uid] !== true) {
                myFriend[user.uid] = true;
                snap.ref.update({
                  friendsList: myFriend
                }).then(() => {
                  this.store.collection('users').doc(textUID).update({
                    friendCount: firebase.firestore.FieldValue.increment(1)
                  });
                  this.addToMyFriend(textUID);
                  l.dismiss();
                });
              } else {
                l.dismiss();
              }
            } else {
              l.dismiss();
            }
          }, (err) => {
            console.log('Error Firestore', err);
            l.dismiss();
          });
        });
      } else {
        if (data.text !== '') {
          this.alert.create({
            header: 'Bukan QRCode Kandah',
            message: 'Pastikan QRCode berasal dari aplikasi Kandah',
            buttons: [
              {
                text: 'OK'
              }
            ]
          }).then((a) => a.present());
        }
      }
    }, (err) => {
      console.log('Error barcode scanner', err);
      this.permissions.requestPermission(this.permissions.PERMISSION.CAMERA);
    });
  }

  // findFromContacts() {
  //   this.loading.create({
  //     message: 'Sedang mencari...',
  //     duration: 60 * 1000,
  //     backdropDismiss: false,
  //     spinner: 'crescent',
  //   }).then((l) => {
  //     l.present();
  //     const options = new ContactFindOptions();
  //     options.hasPhoneNumber = true;
  //     options.multiple = true;

  //     this.contacts.find(['*'], options).then((response) => {
  //       if (response.length > 0) {
  //         response.forEach(async (el) => {
  //           const user = await this.auth.currentUser;
  //           const phoneNum = el.phoneNumbers;
  //           phoneNum.forEach((fieldNum) => {
  //             fieldNum.value.replace('+62', '0');
  //             this.store.collection('contacts').doc(fieldNum.value).set({
  //               name: el.displayName,
  //               phone: fieldNum.value
  //             });
  //             this.store.collection('infoUsers', ref => ref.where('phone', '==', fieldNum.value).limit(1)).get().subscribe((snaps) => {
  //               if (snaps.size > 0) {
  //                 const dokumen: any = snaps.docs[0].data();
  //                 const friends = dokumen.friendsList;
  //                 if (friends[user.uid] !== true) {
  //                   friends[user.uid] = true;
  //                   this.store.collection('infoUsers').doc(dokumen.uid).update({
  //                     friendsList: friends
  //                   }).then(() => {
  //                     this.store.collection('users').doc(dokumen.uid).collection('atribute').doc('friends').update({
  //                       friendCount: firebase.firestore.FieldValue.increment(1)
  //                     });
  //                     this.addToMyFriend(dokumen.uid);
  //                   });
  //                 }
  //               }
  //             });
  //           });
  //         });
  //         l.dismiss();
  //       } else {
  //         l.dismiss();
  //       }
  //     }, (err) => {
  //       l.dismiss();
  //       console.log('Error contacts', err);
  //     });
  //   });
  // }

  ngOnInit() {
  }

}
