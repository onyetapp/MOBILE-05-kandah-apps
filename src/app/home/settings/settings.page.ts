import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { PopoverMenuComponent } from './popover-menu/popover-menu.component';
import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController, LoadingController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  infoUsers: Observable<any>;
  attributeFriend: Observable<any>;

  constructor(
    private popover: PopoverController,
    private alert: AlertController,
    private toast: ToastController,
    private loading: LoadingController,
    private auth: AngularFireAuth,
    private store: AngularFirestore,
    private router: Router,
  ) {
    this.auth.currentUser.then((user) => {
      this.infoUsers = this.store.collection('users').doc(user.uid).valueChanges();
      this.attributeFriend = this.store.collection('users').doc(user.uid).collection('atribute').doc('friends').valueChanges();
    });
  }

  menuMore(evnt: any) {
    this.popover.create({
      component: PopoverMenuComponent,
      translucent: false,
      showBackdrop: false,
      event: evnt,
    }).then((p) => {
      p.present();
      p.onDidDismiss().then((dt) => {
        if (dt.role === 'logout') {
          this.logoutAuth();
        }

        if (dt.role === 'photo') {
          this.takePhoto();
        }

        if (dt.role === 'edit') {
          this.editProfile();
        }
      });
    });
  }

  editProfile() {
    this.alert.create({
      header: 'Ubah Data Profil',
      inputs: [
        {
          type: 'text',
          name: 'name',
          placeholder: 'Nama lengkap...',
          label: 'Nama',
          min: 3
        },
        {
          type: 'textarea',
          name: 'story',
          placeholder: 'Status atau deskripsi...',
          label: 'Deskripsi'
        }
      ],
      buttons: [
        {
          text: 'Tutup'
        },
        {
          text: 'Ubah',
          handler: async (data: any) => {
            const user = await this.auth.currentUser;
            if (data.name !== '' || data.story !== '') {
              const updateField: any = {};
              if (data.name !== '') {
                updateField.name = data.name;
              }
              if (data.story !== '') {
                updateField.story = data.story;
              }
              this.store.collection('users').doc(user.uid).update(updateField);
              this.store.collection('infoUsers').doc(user.uid).update(updateField);
            }
          }
        }
      ]
    }).then((a) => a.present());
  }

  async takePhoto() {
    const user = await this.auth.currentUser;
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.DataUrl,
      allowEditing: true,
      saveToGallery: false,
      height: 500,
      width: 500
    });
    const imageURL = image.dataUrl;
    this.loading.create({
      message: 'Mengunggah foto',
      spinner: 'crescent',
      duration: 60 * 1000
    }).then((l) => {
      l.present();
      this.store.collection('users').doc(user.uid).update({
        photoURL: imageURL
      }).then(() => {
        this.store.collection('infoUsers').doc(user.uid).update({
          photoURL: imageURL
        });
        l.dismiss();
      });
    });
  }

  logoutAuth() {
    this.alert.create({
      header: 'Anda akan keluar.',
      message: 'Anda yakin ingin keluar dari akun berikut ?',
      buttons: [
        {
          text: 'Batal',
        },
        {
          text: 'Keluar',
          handler: async () => {
            const load = await this.loading.create({
              message: 'Anda sedang keluar...',
              spinner: 'crescent',
              duration: 60 * 1000
            });
            const errMsg = await this.toast.create({
              message: 'Gagal Logout!',
              duration: 3000,
              color: 'danger'
            });
            const user = await this.auth.currentUser;
            load.present();
            this.store.collection('infoUsers').doc(user.uid).update({
              isOnline: false
            }).then(() => {
              this.auth.signOut().then(() => {
                this.router.navigate(['login'], {
                  replaceUrl: true
                });
                load.dismiss();
              }, (err) => {
                console.log('Error logout!', err);
                errMsg.dismiss();
                load.dismiss();
              });
            }, (err) => {
              console.log('Error logout!', err);
              errMsg.present();
              load.dismiss();
            });
          },
        },
      ],
    }).then((a) => {
      a.present();
    });
  }

  ngOnInit() {
  }

}
