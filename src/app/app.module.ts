import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Contacts } from '@ionic-native/contacts/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Badge } from '@ionic-native/badge/ngx';
import { Device } from '@ionic-native/device/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { ActionSheet } from '@ionic-native/action-sheet/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';
import { fireConfig } from 'src/environments/environment';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(fireConfig),
    AngularFireAnalyticsModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule.enablePersistence(),
    DigitOnlyModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ScreenTrackingService,
    UserTrackingService,
    AndroidPermissions,
    GooglePlus,
    Geolocation,
    BarcodeScanner,
    Contacts,
    BackgroundMode,
    LocalNotifications,
    ActionSheet,
    Dialogs,
    LaunchNavigator,
    Badge,
    Device
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
