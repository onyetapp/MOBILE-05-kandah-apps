import { PopoverController, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFireAuth } from '@angular/fire/auth';
import { PopoverMenuComponent } from './popover-menu/popover-menu.component';
import { Camera, CameraResultType } from '@capacitor/camera';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { googleAPI } from './../../environments/environment';
import firebase from 'firebase/app';

@Component({
  selector: 'app-kandah',
  templateUrl: './kandah.page.html',
  styleUrls: ['./kandah.page.scss'],
})
export class KandahPage implements OnInit {

  @ViewChild('attactment') btnAttactment;
  @ViewChild('content') content;

  idGuest = '';
  myUID = '';
  infoGuest: Observable<any>;
  chats: Observable<any>;
  chatUnsubscribe = null;
  scrollDepthTriggered = false;
  unReadScrollCount = 0;
  unReadMessage: any[] = [];
  messages = '';
  enviromentGoogle: any;

  constructor(
    private auth: AngularFireAuth,
    private route: ActivatedRoute,
    private router: Router,
    private store: AngularFirestore,
    private popover: PopoverController,
    private toast: ToastController,
    private alert: AlertController,
    private loading: LoadingController,
    private geoloc: Geolocation,
    private navigator: LaunchNavigator,
  ) {
    this.auth.currentUser.then((user) => {
      this.myUID = user.uid;
    });
    this.enviromentGoogle = googleAPI;
    this.idGuest = this.route.snapshot.params.id;
    this.initUID();
  }

  async initUID() {
    const load = await this.loading.create({
      message: 'Menyiapkan percakapan...',
      spinner: 'crescent',
      duration: 60 * 1000,
      backdropDismiss: false
    });
    load.onWillDismiss().then(() => {
      this.chatUnsubscribe = this.chats.subscribe((snap: any[]) => {
        if (snap.length > 0) {
          const fill = snap.filter((el) => el.isRead === false && el.uid === this.idGuest);
          this.unReadMessage = fill;
          if (fill.length > 0) {
            if (this.scrollDepthTriggered === true) {
              this.unReadScrollCount = fill.length;
            } else {
              this.updateChatToRead();
            }
          } else {
            this.unReadScrollCount = 0;
            setTimeout(() => {
              this.getContent().scrollToBottom(0);
            }, 200);
          }
        }
      });
    });
    load.present();
    this.store.collection('infoUsers').doc(this.idGuest).get().subscribe(async (snap) => {
      const user = await this.auth.currentUser;
      if (snap.exists) {
        this.infoGuest = this.store.collection('infoUsers').doc(this.idGuest).valueChanges();
        const guestChatDoc = this.store.collection('infoUsers').doc(this.idGuest).collection('chats').doc(user.uid);
        const chatDokumen = this.store.collection('infoUsers').doc(user.uid).collection('chats').doc(this.idGuest);
        // eslint-disable-next-line max-len
        const myChats = chatDokumen.collection('percakapan', ref => ref.where('deleteAt', '==', null).orderBy('createAt', 'asc')).valueChanges();
        chatDokumen.get().subscribe((snapDoc) => {
          if (!snapDoc.exists) {
            snapDoc.ref.set({
              uid: this.idGuest,
              isFavorite: false,
              isRead: true,
              isDeleted: false,
              lastMessage: null,
              countUnread: 0,
              isNotif: true
            }).then(() => {
              guestChatDoc.get().subscribe((gSnap) => {
                if (!gSnap.exists) {
                  guestChatDoc.set({
                    uid: user.uid,
                    isFavorite: false,
                    isRead: true,
                    isDeleted: false,
                    lastMessage: null,
                    countUnread: 0,
                    isNotif: true
                  }).then(() => {
                    this.chats = myChats;
                    load.dismiss();
                  }, async (err) => {
                    const t = await this.toast.create({
                      message: 'Terjadi kendala saat menyiapkan!',
                      color: 'danger',
                      duration: 3000
                    });
                    t.present();
                    load.dismiss();
                    console.log('Error set percakapan', err);
                    this.router.navigate(['home', 'friends']);
                  });
                } else {
                  gSnap.ref.update({
                    isDeleted: false,
                    isRead: true,
                    countUnread: 0
                  });
                  this.chats = myChats;
                  load.dismiss();
                }
              }, async (err) => {
                const t = await this.toast.create({
                  message: 'Terjadi kendala saat menyiapkan!',
                  color: 'danger',
                  duration: 3000
                });
                t.present();
                load.dismiss();
                console.log('Error set percakapan', err);
                this.router.navigate(['home', 'friends']);
              });
            }, async (err) => {
              const t = await this.toast.create({
                message: 'Terjadi kendala saat menyiapkan!',
                color: 'danger',
                duration: 3000
              });
              t.present();
              load.dismiss();
              console.log('Error set percakapan', err);
              this.router.navigate(['home', 'friends']);
            });
          } else {
            snapDoc.ref.update({
              isDeleted: false,
              isRead: true,
              countUnread: 0
            });
            this.chats = myChats;
            load.dismiss();
          }
        });
      } else {
        const t = await this.toast.create({
          message: 'Teman kandah tidak ditemukan!',
          color: 'danger',
          duration: 3000
        });
        t.present();
        load.dismiss();
        this.router.navigate(['home', 'friends']);
      }
    }, async (err) => {
      const t = await this.toast.create({
        message: 'Terjadi kendala saat menyiapkan!',
        color: 'danger',
        duration: 3000
      });
      t.present();
      load.dismiss();
      console.log('Get user error!', err);
      this.router.navigate(['home', 'friends']);
    });
  }

  async sendChat(image = null, url = null, jenis = 'text') {
    this.messages = (this.messages !== '') ? this.messages.trim() : null;
    if (this.messages !== null && this.messages !== '') {
      const user = await this.auth.currentUser;
      const guestChatDoc = this.store.collection('infoUsers').doc(this.idGuest).collection('chats').doc(user.uid);
      const chatDokumen = this.store.collection('infoUsers').doc(user.uid).collection('chats').doc(this.idGuest);
      guestChatDoc.collection('percakapan').add({
        uid: user.uid,
        recipient: this.idGuest,
        message: this.messages,
        photoURL: image,
        link: url,
        type: jenis,
        isRead: false,
        createAt: firebase.firestore.FieldValue.serverTimestamp(),
        deleteAt: null
      }).then(() => {
        let messages = (image !== null) ? 'kandah::images' : this.messages;
        if (jenis === 'location') {
          messages = 'kandah::location';
        }
        guestChatDoc.update({
          isRead: false,
          lastMessage: messages,
          countUnread: firebase.firestore.FieldValue.increment(1),
          isNotif: false
        });
        chatDokumen.collection('percakapan').add({
          uid: user.uid,
          recipient: this.idGuest,
          message: this.messages,
          photoURL: image,
          link: url,
          type: jenis,
          isRead: false,
          createAt: firebase.firestore.FieldValue.serverTimestamp(),
          deleteAt: null
        }).then(() => {
          let msg = (image !== null) ? 'kandah::images' : this.messages;
          if (jenis === 'location') {
            msg = 'kandah::location';
          }
          chatDokumen.update({
            isRead: true,
            lastMessage: msg,
            countUnread: 0,
            isNotif: true
          }).then(() => {
            this.messages = '';
            this.getContent().scrollToBottom(0);
            this.updateChatToRead();
          });
        });
      }, (err) => {
        this.toast.create({
          message: 'Terjadi kendala pada jaringan!',
          color: 'warning',
          duration: 4000
        }).then((r) => r.present());
        console.log(err);
      });
    }
  }

  async updateChatToRead() {
    const user = await this.auth.currentUser;
    if (this.unReadMessage.length > 0) {
      const sayaDoc = this.store.collection('infoUsers').doc(user.uid)
                      .collection('chats').doc(this.idGuest)
                      .collection('percakapan', ref => ref.where('uid', '==', this.idGuest).where('isRead', '==', false));
      const sayaSub = sayaDoc.get().subscribe((doc) => {
        if (doc.size > 0) {
          let i = 0;
          doc.docs.forEach((el) => {
            i++;
            if (el.exists) {
              el.ref.update({
                isRead: true
              }).then(() => {
                if (i >= doc.docs.length) {
                  sayaSub.unsubscribe();
                  this.store.collection('infoUsers').doc(user.uid)
                  .collection('chats').doc(this.idGuest).update({
                    isRead: true,
                    countUnread: 0,
                  });
                }
              });
            }
          });
        }
      });

      const tamuDoc = this.store.collection('infoUsers').doc(this.idGuest)
                      .collection('chats').doc(user.uid)
                      .collection('percakapan', ref => ref.where('uid', '==', this.idGuest).where('isRead', '==', false));
      const tamuSub = tamuDoc.get().subscribe((doc) => {
        if (doc.size > 0) {
          let i = 0;
          doc.docs.forEach((el) => {
            i++;
            if (el.exists) {
              el.ref.update({
                isRead: true
              }).then(() => {
                if (i >= doc.docs.length) {
                  tamuSub.unsubscribe();
                }
              });
            }
          });
        }
      });
    }
  }

  menuMore(evnt: any) {
    this.popover.create({
      component: PopoverMenuComponent,
      translucent: false,
      showBackdrop: false,
      event: evnt,
      componentProps: {
        guestID: this.idGuest
      }
    }).then((p) => {
      p.present();
      p.onDidDismiss().then((dt) => {
        if (dt.role === 'favorite') {
          this.setFavorite(true);
        }
        if (dt.role === 'unfavorite') {
          this.setFavorite(true);
        }
        if (dt.role === 'delete') {
          this.deleteChat();
        }
      });
    });
  }

  async setFavorite(status: boolean) {
    const user = await this.auth.currentUser;
    this.store.collection('infoUsers').doc(user.uid)
              .collection('chats').doc(this.idGuest)
              .update({
                isFavorite: status
              });
  }

  async deleteChat() {
    const user = await this.auth.currentUser;
    const chats = this.store.collection('infoUsers').doc(user.uid)
    .collection('chats').doc(this.idGuest)
    .collection('percakapan').get().subscribe((snap) => {
      if (snap.size > 0) {
        let i = 0;
        snap.docs.forEach((doc) => {
          i++;
          if (doc.exists) {
            doc.ref.delete().then(() => {
              if (i >= snap.size) {
                chats.unsubscribe();
              }
            });
          }
        });
      }
      this.store.collection('infoUsers').doc(user.uid).collection('chats').doc(this.idGuest).update({
        lastMessage: null,
        isDeleted: true
      }).then(() => {
        this.router.navigate(['home', 'chats']);
      });
    });
  }

  async attactmentImages() {
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.DataUrl,
      allowEditing: true,
      saveToGallery: false,
      height: 500,
      width: 500
    });
    const imageURL = image.dataUrl;
    this.sendChat(imageURL, null, 'images');
    this.btnAttactment.nativeElement.style.display = 'none';

  }

  async attactmengLocation() {
    const load = await this.loading.create({
      message: 'Menemukan lokasi...',
      spinner: 'crescent',
      duration: 60 * 1000,
      backdropDismiss: true
    });
    load.present();
    this.geoloc.getCurrentPosition({
      enableHighAccuracy: true,
    }).then((gPosition) => {
      // eslint-disable-next-line max-len
      const imageMaps = 'https://maps.googleapis.com/maps/api/staticmap?center='+ gPosition.coords.latitude +','+ gPosition.coords.longitude +'&zoom=15&size=800x800&maptype=roadmap&markers=color:red%7C'+ gPosition.coords.latitude +','+ gPosition.coords.longitude;
      this.sendChat(imageMaps, gPosition.coords.latitude +','+ gPosition.coords.longitude, 'location');
      setTimeout(() => {
        load.dismiss();
        this.btnAttactment.nativeElement.style.display = 'none';
      }, 1000);
    }, async (err) => {
      console.log('Error find location!', err);
      const a = await this.alert.create({
        message: 'Terjadi kendala saat mencari lokasi anda, pastikan lokasi diizinkan untuk aplikasi Kandah!',
        header: 'Gagal Memproses',
        buttons: [
          {
            text: 'OK'
          }
        ]
      });
      a.present();
      load.dismiss();
      this.btnAttactment.nativeElement.style.display = 'none';
    });
  }

  async imageClick(item: any) {
    if (typeof item === 'object') {
      if (item.type === 'location' && item.link !== null) {
        const findLoc = await this.geoloc.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 60 * 1000
        });
        const options: LaunchNavigatorOptions  = {
          start: findLoc.coords.latitude + ', ' + findLoc.coords.longitude,
        };
        this.navigator.navigate(item.link, options).then(() => {
          console.log('Success to launch navigation apps!');
        }, (err) => {
          console.log('Error to run navigation apps : ', err);
        });
      }
    }
  }

  async scrollEvent($event) {
    if($event.target.localName !== 'ion-content') {
      return;
    }
    const scrollElement = await $event.target.getScrollElement();
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = $event.detail.scrollTop;
    const targetPercent = 70;
    const triggerDepth = ((scrollHeight / 100) * targetPercent);
    if (scrollHeight / scrollElement.offsetHeight > 1) {
      if (currentScrollDepth < triggerDepth) {
        if (this.scrollDepthTriggered === false) {
          this.scrollDepthTriggered = true;
        }
      } else {
        if (this.scrollDepthTriggered === true) {
          this.scrollDepthTriggered = false;
        }
      }
    }
  }

  getContent() {
    return this.content;
  }

  replaceLineBreaktoBR(str: string) {
    return str.replace(new RegExp('\n', 'g'), '<br />');
  }

  btnScrollToBottom() {
    setTimeout(() => {
      this.getContent().scrollToBottom(500);
      if (this.unReadScrollCount > 0) {
        this.updateChatToRead();
      }
    }, 300);
  }

  async coomingSoon() {
    const a = await this.alert.create({
      message: 'Akan hadir, bila ada waktu buat lanjutin!',
      header: 'Cooming Soon'
    });
    a.present();
  }

  ionViewWillEnter(){
    this.getContent().scrollToBottom(0);
  }

  ionViewDidLeave(){
    if (this.chatUnsubscribe !== null) {
      this.chatUnsubscribe.unsubscribe();
    }
  }

  ngOnInit() {
  }

}
