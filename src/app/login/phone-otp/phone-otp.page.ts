import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-phone-otp',
  templateUrl: './phone-otp.page.html',
  styleUrls: ['./phone-otp.page.scss'],
})
export class PhoneOtpPage implements OnInit {

  verifyNumber = '';

  constructor(
    private modal: ModalController,
  ) { }

  verifyButton() {
    if (this.verifyNumber.length > 5) {
      this.modal.dismiss(this.verifyNumber, 'verify');
    }
  }

  close() {
    this.modal.dismiss();
  }

  ngOnInit() {
  }

}
