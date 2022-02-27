import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.scss'],
})
export class QrcodeComponent implements OnInit {

  qrcodedata = '';
  userku: Observable<any>;

  constructor(
    private modal: ModalController,
    private auth: AngularFireAuth,
    private store: AngularFirestore
  ) {
    this.auth.currentUser.then((user) => {
      this.qrcodedata = 'kandah:' + btoa(user.uid);
      this.userku = this.store.collection('users').doc(user.uid).valueChanges();
    });
  }

  close() {
    this.modal.dismiss();
  }

  ngOnInit() {}

}
