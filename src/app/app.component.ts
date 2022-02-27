import { Component } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private background: BackgroundMode,
    private platform: Platform
  ) {
  }

  init() {
    this.platform.ready().then(() => {
      this.background.enable();
    });
  }
}
