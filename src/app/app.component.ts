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
  admins: any[];
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
      /*apiKey: "AIzaSyB0qxCieE7-B0aM0m03qdoSomMk0xVG3dY",
      authDomain: "ionicfirebaseui.firebaseapp.com",
      databaseURL: "https://ionicfirebaseui.firebaseio.com",
      projectId: "ionicfirebaseui",
      storageBucket: "ionicfirebaseui.appspot.com",
      messagingSenderId: "281186760812"*/
      apiKey: "AIzaSyDUBtCAdjZem5IbH9PqMhudLVAXxJNq51o",
      authDomain: "medicalqr-42850.firebaseapp.com",
      databaseURL: "https://medicalqr-42850.firebaseio.com",
      projectId: "medicalqr-42850",
      storageBucket: "medicalqr-42850.appspot.com",
      messagingSenderId: "988656361007"
    };

    firebase.initializeApp(config);
  }

  ngAfterViewInit() {
    firebase.auth().signOut();
    this.existingUser = null;
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.uid  = user.uid;
        this.globalDataCtrl.setGmailId(this.uid);
        this.getAdmins().then((result) => {
          if(this.admins.length > 0){
            this.admins.forEach(admin => {
              if(admin.GmailID == this.uid){
                this.existingUser = admin;
                this.goToHome("Admin");
                this.setRootPage(LoginPage);
              }
            });
          }
          if(this.existingUser == null){
            this.getDoctors().then((result) => {
              if(this.doctors.length > 0){
                this.doctors.forEach(doctor => {
                  if(doctor.GmailID == this.uid){
                    this.existingUser = doctor;
                    this.setGlobalInformation(doctor.id, "Profesionales de la Salud");
                    if(this.existingUser.Status == 'Activo'){
                      this.globalDataCtrl.setUserEmail(this.existingUser.email);
                      this.globalDataCtrl.setHomePage(HomeDoctorsPage);
                      this.setRootPage(HomeDoctorsPage);
                    } else {
                      this.goToHome("Profesionales de la Salud");
                      this.setRootPage(LoginPage);
                    }
                  }
                });
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
                    this.globalDataCtrl.setPharmacy(pharmacy);
                    this.setRootPage(HomePharmacyPage);
                  }
                });
              }
            })
            .catch(function(e) {
              console.log(e); // "oh, no!"
            })
          }
          if(this.existingUser == null) {
            this.setRootPage(RegisterPage);
          }
        })
        .catch(function(e) {
          console.log(e); // "oh, no!"
        })
      } else {
        // User is not authenticated.
        this.setRootPage(LoginPage);
      }
    });
  }

  setRootPage(page) {
    if (this.firstRun) {
      this.nav.push(page)
        .then(() => this.platform.ready())
        .catch(function(e) {
          console.log(e); // "oh, no!"
        })
        .then(() => {
          this.statusBar.styleDefault();
          this.splashScreen.hide();
          this.firstRun = false;
        })
        .catch(function(e) {
          console.log(e); // "oh, no!"
        })
    } else {
      this.nav.push(page);
    }
  }

  register() {
    this.nav.push(RegisterPage);
  }

  getAdmins(){
    var apiURL = this.globalDataCtrl.getApiURL();
    return new Promise(resolve => {
      this.http.get(apiURL+'Admins').subscribe((data: any[]) => {
        resolve(this.admins = data);
      }, err => {
        console.log(err);
      });
    });
  }

  getDoctors(){
    var apiURL = this.globalDataCtrl.getApiURL();
    return new Promise(resolve => {
      this.http.get(apiURL+'Doctors').subscribe((data: any[]) => {
        resolve(this.doctors = data);
      }, err => {
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
      let title = "Pendiente de habilitación";
      let message = "El Ministerio de salud deberá habilitar tu registro en no menos de 48 horas, te avisaremos una vez el Ministerio habilite tu registro";
      this.showPrompt(title, message);
    } else if (role_id == "Farmacia"){ //Farmacias
      let title = "Registro exitoso";
      let message = "Por favor ingresa nuevamente tus datos para acceder a la aplicación";
      this.showPrompt(title, message);
    } else if (role_id == "Admin"){ //Farmacias
      let title = "Acceso denegado";
      let message = "No puedes ingresar con este rol a través de la app. Por favor ingrese a través de la web.";
      this.showPrompt(title, message);
    }
  }

  setGlobalInformation(userId, role){
    this.globalDataCtrl.setUser_id(userId);
    this.globalDataCtrl.setRole(role);
  }

  showPrompt(title, message) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: message
    });
    alert.present().then(function(e) {
      setTimeout(function(){ window.location.reload() }, 4000);
    })
  }

  openProfile(){
    this.menu.close();
    this.setRootPage(UserProfilePage);
  }

  openHome(){
    this.menu.close();
    this.setRootPage(this.globalDataCtrl.getHomePage());
  }

  closeSession(){
    firebase.auth().signOut().then(function(e) {
      window.location.reload()
    })
  }
}
