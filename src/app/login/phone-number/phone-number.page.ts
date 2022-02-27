import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, LoadingController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { PhoneOtpPage } from './../phone-otp/phone-otp.page';
import firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-phone-number',
  templateUrl: './phone-number.page.html',
  styleUrls: ['./phone-number.page.scss'],
})
export class PhoneNumberPage implements OnInit {

  phoneNumber = '';
  private appVier: any;

  constructor(
    private auth: AngularFireAuth,
    private store: AngularFirestore,
    private alert: AlertController,
    private modal: ModalController,
    private loader: LoadingController,
    private router: Router,
    private service: CommonService
  ) { }

  infoButton() {
    this.alert.create({
      header: 'Informasi',
      message: 'Pastikan nomor telephone aktif dan dapat menerima SMS.',
      buttons: [
        {
          text: 'Tutup'
        }
      ]
    }).then((a) => a.present());
  }

  loginWithPhone() {
    let phone = '';
    const zero = this.phoneNumber.slice(0,1);

    if (zero === '0') {
      phone = '+62' + this.phoneNumber.slice(1, this.phoneNumber.length);
    } else {
      phone = this.phoneNumber;
    }

    this.loader.create({
      message: 'Sedang diproses...',
      spinner: 'crescent',
      duration: 2 * 60 * 1000,
      backdropDismiss: false
    }).then((loading) => {
      loading.present();
      this.auth.signInWithPhoneNumber(phone, this.appVier).then((confirmationResult) => {
        loading.dismiss();
        this.modal.create({
          component: PhoneOtpPage,
          backdropDismiss: true,
          animated: true,
        }).then((m) => {
          m.present();
          m.onDidDismiss().then((h) => {
            if (typeof h.data === 'string') {
              this.loader.create({
                message: 'Sedang diproses...',
                spinner: 'crescent',
                duration: 2 * 60 * 1000,
                backdropDismiss: false
              }).then((loading2) => {
                loading2.present();
                const prov = firebase.auth.PhoneAuthProvider.credential(confirmationResult.verificationId, h.data);
                this.auth.signInWithCredential(prov).then((users) => {
                  this.store.collection('users').doc(users.user.uid).get().subscribe((docs) => {
                    const usr = users.user;
                    if (!docs.exists) {
                      this.store.collection('users').doc(usr.uid).set({
                        uid: usr.uid,
                        name: this.phoneNumber,
                        email: usr.email,
                        emailVerified: usr.emailVerified,
                        phone: this.phoneNumber,
                        phoneVerified: true,
                        photoURL: (usr.photoURL) ? usr.photoURL : this.service.randomAvatar(),
                        nearbyLimit: 10,
                        story: 'Saya teman Kandah!',
                        createAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updateAt: firebase.firestore.FieldValue.serverTimestamp(),
                        deleteAt: null
                      }).then(() => {
                        this.store.collection('users').doc(usr.uid).collection('atribute').doc('friends').set({
                          friendCount: 0
                        });
                      });
                      this.store.collection('infoUsers').doc(usr.uid).set({
                        uid: usr.uid,
                        name: this.phoneNumber,
                        photoURL: (usr.photoURL) ? usr.photoURL : this.service.randomAvatar(),
                        phone: usr.phoneNumber,
                        email: usr.email,
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
                          buttons: [
                            {
                              text: 'Tutup'
                            }
                          ]
                        }).then((a) => a.present());
                      } else {
                        this.router.navigate(['home'], {
                          replaceUrl: true
                        });
                      }
                    }
                    loading2.dismiss();
                  });
                }, (err) => {
                  loading2.dismiss();
                  this.alert.create({
                    message: ('message' in  err) ? err.message : 'Kode verifikasi yang anda masukan tidak valid!',
                    header: 'Verifikasi Gagal.',
                    buttons: [
                      {
                        text: 'Tutup',
                        role: 'cancel'
                      },
                      {
                        text: 'Coba Lagi',
                        handler: () => m.present()
                      }
                    ]
                  }).then((al) => al.present());
                });
              });
            }
          });
        });
      }, (err) => {
        loading.dismiss();
        if ('message' in err) {
          this.alert.create({
            message: err.message,
            header: 'Terjadi kesalahan!',
            buttons: [
              {
                text: 'Tutup',
              }
            ]
          });
        } else {
          this.alert.create({
            message: 'Nomor telephone yang anda masukan tidak valid.',
            header: 'Terjadi kesalahan!',
            buttons: [
              {
                text: 'Tutup',
              }
            ]
          });
        }
      });
    });
  }

  ngOnInit() {
    this.appVier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
      size: 'invisible'
    });
  }

}
