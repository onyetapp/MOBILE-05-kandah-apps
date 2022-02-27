import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PhoneOtpPage } from './phone-otp.page';

const routes: Routes = [
  {
    path: '',
    component: PhoneOtpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhoneOtpPageRoutingModule {}
