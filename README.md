# Kandah Apps

- Language: Typescript
- Path: src/index.html
- Android Path: android
- Framework: Ionic 4.X + CapacitorJS
- Author: Farda F. & R. Agatha
- Version: 2.0.0
- Description:
- License: MIT
- Repository: https://github.com/onyetapp/MOBILE-05-kandah-apps

Please Read Ionicframework 6.X Documentation for more information.
## Table of Contents
- [Getting Started](#getting-started)
- [App Preview](#app-preview)
- [Deploying](#deploying)
  - [Progressive Web App](#progressive-web-app)
  - [Android](#android)
  - [iOS](#ios)


## Getting Started

* [Download the installer](https://nodejs.org/) for Node LTS.
* Install the ionic CLI globally: `npm install -g ionic`
* Clone this repository: `git clone https://github.com/onyetapp/MOBILE-05-kandah-apps.git`.
* Run `npm install` from the project root.
* Run `ionic serve` in a terminal from the project root.
* Profit. :tada:

_Note: See [How to Prevent Permissions Errors](https://docs.npmjs.com/getting-started/fixing-npm-permissions) if you are running into issues when trying to install packages globally._

# App Preview

<table>
    <tr>
        <td><img src="resources/1.png"></td>
        <td><img src="resources/2.png"></td>
        <td><img src="resources/3.png"></td>
    </tr>
    <tr>
        <td><img src="resources/4.png"></td>
        <td><img src="resources/5.png"></td>
        <td><img src="resources/6.png"></td>
    </tr>
    <tr>
        <td><img src="resources/7.png"></td>
        <td><img src="resources/8.png"></td>
        <td><img src="resources/9.png"></td>
    </tr>
    <tr>
        <td><img src="resources/10.png"></td>
        <td><img src="resources/11.png"></td>
        <td><img src="resources/12.png"></td>
    </tr>
</table>

## Deploying

### Progressive Web App

1. Un-comment [these lines](https://github.com/ionic-team/ionic2-app-base/blob/master/src/index.html#L21)
2. Run `ionic build --prod`
3. Push the `www` folder to your hosting service

### Android

1. Run `ionic cap add android`
2. Run `ionic build --prod`
3. Run `ionic cap sync android`
4. Run `ionic cap open android`

_Note: if you experience problems when building on android. try to fix it using jetify `npm install jetifier` and Run `npx jetify` and try build again._

### iOS

1. Run `ionic cap add ios`
2. Run `ionic build --prod`
3. Run `ionic cap sync ios`
4. Run `ionic cap open ios`

_Note: The iOS simulator is not supported by the Ionic CLI. To run iOS apps on your local machine, you must use Xcode_
