import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KandahPage } from './kandah.page';

const routes: Routes = [
  {
    path: ':id',
    component: KandahPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KandahPageRoutingModule {}
