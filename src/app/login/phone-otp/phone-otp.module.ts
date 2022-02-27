import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhoneOtpPageRoutingModule } from './phone-otp-routing.module';

import { PhoneOtpPage } from './phone-otp.page';
import { DigitOnlyModule } from '@uiowa/digit-only';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhoneOtpPageRoutingModule,
    DigitOnlyModule,
  ],
  declarations: [PhoneOtpPage]
})
export class PhoneOtpPageModule {}
