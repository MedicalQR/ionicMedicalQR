import { Component } from '@angular/core';
import { NavController, NavParams, MenuController} from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public menu: MenuController, public navParams: NavParams, private authProvider: AuthProvider) {
    this.menu.enable(false);
  }

  ionViewWillEnter() {
    this.menu.enable(false);
  }

  ionViewDidLoad() {
    console.log("ion view did load del login");
    this.authProvider.ui.start('#firebaseui-auth-container', AuthProvider.getUiConfig());
  }

}
