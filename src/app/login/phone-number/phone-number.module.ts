import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PhoneNumberPageRoutingModule } from './phone-number-routing.module';

import { PhoneNumberPage } from './phone-number.page';
import { DigitOnlyModule } from '@uiowa/digit-only';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PhoneNumberPageRoutingModule,
    DigitOnlyModule,
  ],
  declarations: [PhoneNumberPage]
})
export class PhoneNumberPageModule {}
