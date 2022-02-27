import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  chats: any[] = [];
  showChats: any[] = [];
  isSearch = false;

  constructor(
    private auth: AngularFireAuth,
    private store: AngularFirestore,
    private notif: LocalNotifications
  ) {
    this.init();
  }

  async init() {
    const user  = await this.auth.currentUser;
    this.store.collection('infoUsers').doc(user.uid)
    .collection('chats', ref => ref.where('isDeleted', '==', false).where('lastMessage', '!=', null)
    .orderBy('lastMessage').orderBy('isFavorite'))
    .valueChanges().subscribe((snapDoc) => {
      this.chats = [];
      if (snapDoc.length > 0) {
        let i = 0;
        const j = [];
        snapDoc.forEach((doc) => {
          i++;
          const a = this.store.collection('infoUsers').doc(doc.uid).get().subscribe((item) => {
            if (item.exists) {
              doc.info = item.data();
              j.push(doc);
            }
            if (i >= snapDoc.length) {
              this.chats = j;
              this.showChats = j;
            }
            a.unsubscribe();
          });
          let msgNotif = doc.lastMessage;
          if (msgNotif === 'kandah::images') {
            msgNotif = 'Mengirim Gambar!';
          }
          if (msgNotif === 'kandah::location') {
            msgNotif = 'Berbagi Lokasi!';
          }
          if (doc?.isNotif === false) {
            this.notif.schedule({
              id: i,
              title: doc.name,
              text: msgNotif,
              attachments: (doc?.photoURL) ? [doc.photoURL] : []
            });
          }
        });
      }
    });
  }

  getInfo(uid: any) {
    if (typeof uid === 'string') {
      if (uid.length > 0) {
        return this.store.collection('infoUsers').doc(uid).valueChanges();
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  searchClick() {
    this.isSearch = true;
  }

  searchCancel() {
    this.isSearch = false;
  }

  searchEvent(event) {
    const query = event.target.value.toLowerCase();
    if (query !== '') {
      this.showChats = this.chats.filter((el) => {
        const name: string = el.info.name.toLowerCase();
        return name.includes(query);
      });
    } else {
      this.showChats = this.chats;
    }
  }

  ngOnInit() {
  }

}
