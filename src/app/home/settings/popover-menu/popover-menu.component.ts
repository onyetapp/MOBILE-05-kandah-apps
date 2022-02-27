import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover-menu',
  templateUrl: './popover-menu.component.html',
  styleUrls: ['./popover-menu.component.scss'],
})
export class PopoverMenuComponent implements OnInit {

  constructor(
    private popover: PopoverController,
  ) { }

  editProfile() {
    this.popover.dismiss(null, 'edit');
  }

  takePhoto() {
    this.popover.dismiss(null, 'photo');
  }

  keluarAkun() {
    this.popover.dismiss(null, 'logout');
  }

  ngOnInit() {}

}
