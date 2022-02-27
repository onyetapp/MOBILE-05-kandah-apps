import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  friendsList = [];

  constructor() { }

  randomAvatar(): string {
    const items = [1,2,3,4,5,6,7];
    const randm = items[Math.floor(Math.random()*items.length)];
    return './assets/avatar/avatar-' + randm + '.png';
  }
}
