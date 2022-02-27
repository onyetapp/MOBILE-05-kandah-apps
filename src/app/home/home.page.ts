import { Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import firebase from 'firebase/app';
import * as geofire from 'geofire-common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private auth: AngularFireAuth,
    private store: AngularFirestore,
    private realtimedb: AngularFireDatabase,
    private geoloc: Geolocation,
    private platform: Platform,
    private permissions: AndroidPermissions,
  ) {
    if (this.platform.is('android')) {
      this.initAndroid();
    }
    this.cekStatusOnlineManual();
  }

  initAndroid() {
    this.permissions.checkPermission(this.permissions.PERMISSION.ACCESS_NETWORK_STATE).then(() => {
      console.log('Network State has permission.');
    }, (err) => {
      this.permissions.requestPermission(this.permissions.PERMISSION.ACCESS_NETWORK_STATE);
    });
    this.permissions.checkPermission(this.permissions.PERMISSION.CAMERA).then(() => {
      console.log('Camerea has permission.');
    }, (err) => {
      this.permissions.requestPermission(this.permissions.PERMISSION.CAMERA);
    });
    this.permissions.checkPermission(this.permissions.PERMISSION.ACCESS_FINE_LOCATION).then(() => {
      console.log('Location has permission');
    }, (err) => {
      this.permissions.requestPermissions([
        this.permissions.PERMISSION.ACCESS_FINE_LOCATION,
        this.permissions.PERMISSION.ACCESS_MEDIA_LOCATION
      ]);
    });
    this.permissions.checkPermission(this.permissions.PERMISSION.READ_CONTACTS).then(() => {
      console.log('Contacts has permission.');
    }, (err) => {
      this.permissions.requestPermission(this.permissions.PERMISSION.READ_CONTACTS);
    });
  }

  getLocation() {
    this.auth.currentUser.then((user) => {
      this.geoloc.getCurrentPosition().then((response) => {
        if (response.coords) {
          const ghash = geofire.geohashForLocation([response.coords.latitude, response.coords.longitude]);
          const coords = new firebase.firestore.GeoPoint(response.coords.latitude, response.coords.longitude);
          this.store.collection('users').doc(user.uid).update({
            coordinates: coords,
            g: {
              geohash: ghash,
              geopoint: coords
            }
          }).then(() => {
            this.store.collection('infoUsers').doc(user.uid).update({
              coordinates: coords,
              g: {
                geohash: ghash,
                geopoint: coords
              }
            });
          });
        }
      });
    });
  }

  cekStatusOnlineManual() {
    // Deteksi bila aplikasi close atau minimize
    this.platform.pause.subscribe(async () => {
      const user = await this.auth.currentUser;
      this.store.collection('infoUsers').doc(user.uid).update({
        isOnline: false
      });
    });
    // Deteksi bila aplikasi kembali dibuka
    this.platform.resume.subscribe(async () => {
      const user = await this.auth.currentUser;
      this.store.collection('infoUsers').doc(user.uid).update({
        isOnline: true
      });
    });
  }

  // Percobaan menampilkan status realtime pada realtimedb
  async setStatusDB() {
    const user  = await this.auth.currentUser;
    const userStatusDatabaseRef  = this.realtimedb.database.ref('/status/' + user.uid);
    const isOfflineForDatabase = {
      state: 'offline',
      lastChanged: firebase.database.ServerValue.TIMESTAMP,
    };
    const isOnlineForDatabase = {
      state: 'online',
      lastChanged: firebase.database.ServerValue.TIMESTAMP,
    };

    this.realtimedb.database.ref('.info/connected').on('value', (snapshot) => {
      if (snapshot.val() === false) {
        this.store.collection('infoUsers').doc(user.uid).update({
          isOnline: false
        });
        return;
      };
      userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(() => {
        this.store.collection('infoUsers').doc(user.uid).update({
          isOnline: true
        });
        userStatusDatabaseRef.set(isOnlineForDatabase);
      });
    });
  }

  ionViewDidEnter(){
    this.setStatusDB();
    this.getLocation();
  }

}
