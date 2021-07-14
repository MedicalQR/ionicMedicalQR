import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, NavController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomeDoctorsPage } from '../pages/home-doctors/home-doctors';
import { HomePharmacyPage } from '../pages/home-pharmacy/home-pharmacy';
import { RegisterPage } from '../pages/register/register';
import { ModalQrPage } from '../pages/modal-qr/modal-qr';
import { ModalPharmacyPage } from '../pages/modal-pharmacy/modal-pharmacy';
import { UserProfilePage } from '../pages/user-profile/user-profile';
import { GlobalDataProvider } from '../providers/auth/global-data/global-data';
import { HttpClient } from '@angular/common/http';
import { AlertController } from 'ionic-angular';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { AuthProvider } from '../providers/auth/auth';
import firebase from 'firebase/app';
import 'firebase/auth';
import * as firebaseui from 'firebaseui';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any;
  firstRun: boolean = true;
  actualView: any;
  user : any = {};
  existingUser : any = {};
  doctors: any[];
  pharmacies: any[];
  allRoles: any[];
  errorMessage : any;
  uid; 

  constructor(private platform: Platform,public menu: MenuController,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
              public globalDataCtrl: GlobalDataProvider,
              public http: HttpClient,
              public alertCtrl: AlertController) {

    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyB0qxCieE7-B0aM0m03qdoSomMk0xVG3dY",
      authDomain: "ionicfirebaseui.firebaseapp.com",
      databaseURL: "https://ionicfirebaseui.firebaseio.com",
      projectId: "ionicfirebaseui",
      storageBucket: "ionicfirebaseui.appspot.com",
      messagingSenderId: "281186760812"
    };

    firebase.initializeApp(config);
  }

  ngAfterViewInit() {
    this.existingUser = null;
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log("user");
        console.log(user);
        this.uid  = user.uid;
        this.globalDataCtrl.setGmailId(this.uid);
        this.getDoctors().then((result) => {
          if(this.doctors.length > 0){
            this.doctors.forEach(doctor => {
              if(doctor.GmailID == this.uid){
                console.log("doctor");
                console.log(doctor);
                this.existingUser = doctor;
                this.setGlobalInformation(doctor.id, "Profesionales de la Salud");
                if(this.existingUser.Status == 'Activo'){
                  console.log("Status");
                  console.log(this.existingUser.Status);
                  this.globalDataCtrl.setUserEmail(this.existingUser.email);
                  this.globalDataCtrl.setHomePage(HomeDoctorsPage);
                  this.nav.push(HomeDoctorsPage);
                } else {
                  this.goToHome("Profesionales de la Salud");
                  this.nav.push(LoginPage);
                }
              }
            });
          }
          if(this.existingUser == null){
            this.getPharmacies().then((result) => {
              if(this.pharmacies.length > 0){
                this.pharmacies.forEach(pharmacy => {
                  if(pharmacy.GmailID == this.uid){
                    this.existingUser = pharmacy;
                    this.setGlobalInformation(pharmacy.id, "Farmacia");
                    this.globalDataCtrl.setUserEmail(this.existingUser.email);
                    this.globalDataCtrl.setHomePage(HomePharmacyPage);
                    this.nav.push(HomePharmacyPage);
                  }
                });
              }
            });
          }
          if(this.existingUser == null) {
            this.nav.push(RegisterPage);
          }
        })
      } else {
        // User is not authenticated.
        
        this.nav.push(LoginPage);
      }
    });
  }

  setRootPage(page) {
    if (this.firstRun) {
      // if its the first run we also have to hide the splash screen
      this.nav.setRoot(page)
        .then(() => this.platform.ready())
        .then(() => {

          // Okay, so the platform is ready and our plugins are available.
          // Here you can do any higher level native things you might need.
          this.statusBar.styleDefault();
          this.splashScreen.hide();
          this.firstRun = false;
        });
    } else {
      this.nav.setRoot(page);
    }
  }

  register() {
    this.nav.push(RegisterPage);
  }

  getDoctors(){
    var apiURL = this.globalDataCtrl.getApiURL();
    return new Promise(resolve => {
      this.http.get(apiURL+'Doctors').subscribe((data: any[]) => {
        resolve(this.doctors = data);
      }, err => {
        console.log("getDoctors error");
        console.log(err);
      });
    });
  }

  getPharmacies(){
    var apiURL = this.globalDataCtrl.getApiURL();
    return new Promise(resolve => {
      this.http.get(apiURL+'Pharmacies').subscribe((data: any[]) => {
        resolve(this.pharmacies = data);
      }, err => {
        console.log(err);
      });
    });
  }

  goToHome(role_id){
    if (role_id == "Profesionales de la Salud"){ //Doctores
      let message = "El Ministerio de salud deberá habilitar tu registro en no menos de 48 horas, te avisaremos una vez el Ministerio habilite tu registro";
      this.showPrompt(message);
    }else if (role_id == "Farmacia"){ //Farmacias
      let message = "Por favor ingresa nuevamente tus datos para acceder a la aplicación";
      this.showPrompt(message);
    }
  }

  setGlobalInformation(userId, role){
    this.globalDataCtrl.setUser_id(userId);
    this.globalDataCtrl.setRole(role);
  }

  showPrompt(message) {
    const alert = this.alertCtrl.create({
      title: 'Pendiente de habilitación',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  openProfile(){
    this.menu.close();
    this.nav.push(UserProfilePage);
  }

  closeSession(){
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.push(LoginPage);
  }
}
