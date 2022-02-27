import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-popover-menu',
  templateUrl: './popover-menu.component.html',
  styleUrls: ['./popover-menu.component.scss'],
})
export class PopoverMenuComponent implements OnInit {

  infoChats: Observable<any>;

  constructor(
    private auth: AngularFireAuth,
    private store: AngularFirestore,
    private popover: PopoverController,
    private navparam: NavParams
  ) {
    const tamuUID = this.navparam.data?.guestID;
    this.auth.currentUser.then((user) => {
      this.infoChats = this.store.collection('infoUsers').doc(user.uid)
                        .collection('chats').doc(tamuUID).valueChanges();
    });
  }

  closeWithRole(role: string) {
    this.popover.dismiss(null, role);
  }

  ngOnInit() {}

}
