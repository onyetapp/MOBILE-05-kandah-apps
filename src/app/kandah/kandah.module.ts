import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KandahPageRoutingModule } from './kandah-routing.module';

import { KandahPage } from './kandah.page';
import { PopoverMenuComponent } from './popover-menu/popover-menu.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KandahPageRoutingModule
  ],
  declarations: [KandahPage, PopoverMenuComponent]
})
export class KandahPageModule {}
