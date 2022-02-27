import { CommonService } from './../services/common.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Platform } from '@ionic/angular';
import firebase from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private auth: AngularFireAuth,
    private store: AngularFirestore,
    private alert: AlertController,
    private router: Router,
    private loader: LoadingController,
    private service: CommonService,
    private googlePlus: GooglePlus,
    private platform: Platform
  ) {}

  loginGoogle() {
    if (this.platform.is('android')) {
      this.googlePlus.login({
        offline: true,
        webClientId: '336222313650-vtt4cfnsicqefog0mnbokmqlbnb73spo.apps.googleusercontent.com'
      }).then((response) => {
        console.log('Response Google', response);
        const {
          idToken,
          accessToken
        } = response;
        // eslint-disable-next-line max-len
        const credential = accessToken ? firebase.auth.GoogleAuthProvider.credential(idToken, accessToken) : firebase.auth.GoogleAuthProvider.credential(idToken);

        this.auth.signInWithCredential(credential).then((users) => {
          const user = users.user;
          this.loader.create({
            message: 'Sedang diproses...',
            spinner: 'crescent',
            duration: 2 * 60 * 1000,
            backdropDismiss: false
          }).then((loading2) => {
            loading2.present();
            this.store.collection('users').doc(user.uid).get().subscribe((docs) => {
              if (!docs.exists) {
                this.store.collection('users').doc(user.uid).set({
                  uid: user.uid,
                  name: user.email,
                  email: user.email,
                  emailVerified: user.emailVerified,
                  phone: user.phoneNumber,
                  phoneVerified: false,
                  photoURL: (user.photoURL) ? user.photoURL : this.service.randomAvatar(),
                  nearbyLimit: 10,
                  story: 'Saya menggunakan Kandah!',
                  createAt: firebase.firestore.FieldValue.serverTimestamp(),
                  updateAt: firebase.firestore.FieldValue.serverTimestamp(),
                  deleteAt: null
                }).then(() => {
                  this.store.collection('users').doc(user.uid).collection('atribute').doc('friends').set({
                    friendCount: 0
                  });
                });
                this.store.collection('infoUsers').doc(user.uid).set({
                  uid: user.uid,
                  name: user.email,
                  photoURL: (user.photoURL) ? user.photoURL : this.service.randomAvatar(),
                  phone: user.phoneNumber,
                  email: user.email,
                  story: 'Saya menggunakan Kandah!',
                  friendsList: {},
                  isOnline: true,
                  deleteAt: null
                });
                this.router.navigate(['home'], {
                  replaceUrl: true
                });
              } else {
                const currentUser: any = docs.data();
                if (currentUser?.deleteAt !== null) {
                  this.auth.signOut();
                  this.alert.create({
                    message: 'Akun anda sudah diblokir!',
                    header: 'Kendala saat masuk.',
                    buttons: [{
                      text: 'Tutup'
                    }]
                  }).then((a) => a.present());
                } else {
                  this.router.navigate(['home'], {
                    replaceUrl: true
                  });
                }
              }
              loading2.dismiss();
            }, (error) => {
              console.log('Error Get Collection', error);
              loading2.dismiss();
            });
          });
        });
      }, (err) => {
        console.log('Error Google Login', err);
        this.alert.create({
          message: 'Terdapat kendala saat masuk, silahkan coba lagi!',
          header: 'Gagal masuk.',
          buttons: [{
            text: 'Tutup'
          }]
        }).then((a) => a.present());
      });
    }

    if (this.platform.is('mobileweb')) {
      this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((users) => {
        const user = users.user;
        this.loader.create({
          message: 'Sedang diproses...',
          spinner: 'crescent',
          duration: 2 * 60 * 1000,
          backdropDismiss: false
        }).then((loading2) => {
          loading2.present();
          this.store.collection('users').doc(user.uid).get().subscribe((docs) => {
            if (!docs.exists) {
              this.store.collection('users').doc(user.uid).set({
                uid: user.uid,
                name: user.email,
                email: user.email,
                emailVerified: user.emailVerified,
                phone: user.phoneNumber,
                phoneVerified: false,
                photoURL: (user.photoURL) ? user.photoURL : this.service.randomAvatar(),
                nearbyLimit: 10,
                story: 'Saya menggunakan Kandah!',
                createAt: firebase.firestore.FieldValue.serverTimestamp(),
                updateAt: firebase.firestore.FieldValue.serverTimestamp(),
                deleteAt: null
              }).then(() => {
                this.store.collection('users').doc(user.uid).collection('atribute').doc('friends').set({
                  friendCount: 0
                });
              });
              this.store.collection('infoUsers').doc(user.uid).set({
                uid: user.uid,
                name: user.email,
                photoURL: (user.photoURL) ? user.photoURL : this.service.randomAvatar(),
                phone: user.phoneNumber,
                email: user.email,
                story: 'Saya menggunakan Kandah!',
                friendsList: {},
                isOnline: true,
                deleteAt: null
              });
              this.router.navigate(['home'], {
                replaceUrl: true
              });
            } else {
              const currentUser: any = docs.data();
              if (currentUser?.deleteAt !== null) {
                this.auth.signOut();
                this.alert.create({
                  message: 'Akun anda sudah diblokir!',
                  header: 'Kendala saat masuk.',
                  buttons: [{
                    text: 'Tutup'
                  }]
                }).then((a) => a.present());
              } else {
                this.router.navigate(['home'], {
                  replaceUrl: true
                });
              }
            }
            loading2.dismiss();
          }, (error) => {
            console.log('Error Get Collection', error);
            loading2.dismiss();
          });
        });
      }, (err) => {
        console.log('Error Google Login', err);
        this.alert.create({
          message: ('message' in err) ? err.message : 'Terdapat kendala saat masuk, silahkan coba lagi!',
          header: 'Gagal masuk.',
          buttons: [{
            text: 'Tutup'
          }]
        }).then((a) => a.present());
      });
    }
  }

  ngOnInit() {}

}
