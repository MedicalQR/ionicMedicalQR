import { Component } from '@angular/core';
import { IonicPage, NavController, MenuController, NavParams, ViewController } from 'ionic-angular';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import { GlobalDataProvider } from '../../providers/auth/global-data/global-data';
import * as firebase from 'firebase/app';
import { HttpClient } from '@angular/common/http';
import { HomeDoctorsPage } from '../home-doctors/home-doctors';
import { HomePharmacyPage } from '../home-pharmacy/home-pharmacy';
import { AlertController } from 'ionic-angular';
import { Guid } from "guid-typescript";
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-user-profile',
  templateUrl: 'user-profile.html',
})
export class UserProfilePage {

  loggedUser : any;
  newUser : any = {};
  role: any;

  constructor(public menuCtrl: MenuController, public alertCtrl: AlertController,private formBuilder: FormBuilder, public navCtrl: NavController, public navParams: NavParams,  public globalDataCtrl: GlobalDataProvider, public http: HttpClient, private authProvider: AuthProvider) {
    let tempUser = {} 
    this.loggedUser = tempUser;
    this.newUser = this.formBuilder.group({
      document: [this.loggedUser.cuit],
      license: [this.loggedUser.medicalLicense],
      name : [this.loggedUser.name],
      lastname : [this.loggedUser.lastName],
      companyname : [this.loggedUser.company_name],
      businessname : [this.loggedUser.business_name],
      email : [this.loggedUser.email, Validators.compose([Validators.required, Validators.email])],
      role_id: this.globalDataCtrl.getRole()
    })
  }

  ionViewWillEnter(){
    this.showUserInfo();
  }

  showUserInfo(){
    this.role = this.globalDataCtrl.getRole();
    let user_id = this.globalDataCtrl.getUser_id();
    let url = "";
    if(this.role == "Profesionales de la Salud") {
      url = "doctors/"
    }
    else if(this.role == "Farmacia") {
      url = "pharmacies/"
    }
    this.getUserById(url + user_id).then((result) => {
      this.newUser.controls["document"].setValue(this.loggedUser.cuit);
      this.newUser.controls["license"].setValue(this.loggedUser.medicalLicense);
      this.newUser.controls["name"].setValue(this.loggedUser.name);
      this.newUser.controls["lastname"].setValue(this.loggedUser.lastName);
      this.newUser.controls["companyname"].setValue(this.loggedUser.company_name);
      this.newUser.controls["businessname"].setValue(this.loggedUser.business_name);
      this.newUser.controls["email"].setValue(this.loggedUser.email);
      this.newUser.controls["role_id"].setValue(this.globalDataCtrl.getRole());
    });
  }

  getUserById(url){
    var apiURL = this.globalDataCtrl.getApiURL();
    return new Promise(resolve => {
      this.http.get(apiURL+url).subscribe((data: any) => {
        resolve(this.loggedUser = data);
      }, err => {
        console.log(err);
      });
    });
  }

  saveChanges(){
    let updatedUser = {};
    let url;

    if(this.role == "Profesionales de la Salud") {
      url = "doctors/";
      updatedUser = {
        medicalLicense : this.newUser.value.license,
        name : this.newUser.value.name,
        Status : this.loggedUser.Status,
        lastName: this.newUser.value.lastname,
        email : this.newUser.value.email,
        GmailID : this.loggedUser.GmailID,
        FacebookID : this.loggedUser.FacebookID
      }
    }
    else {
      url = "pharmacies/";
      updatedUser = {
        cuit : this.newUser.value.cuit,
        email: this.newUser.value.email,
        company_name : this.newUser.value.companyname,
        business_name : this.newUser.value.businessname,
        Status : this.loggedUser.Status,
        GmailID : this.loggedUser.GmailID,
        FacebookID : this.loggedUser.FacebookID
      }
    }

    this.updateUser(updatedUser, url);
  }

  updateUser(updatedUser, url){
    var apiURL = this.globalDataCtrl.getApiURL();
    return new Promise(resolve => {
      this.http.put(apiURL + url + this.loggedUser.id, updatedUser).subscribe(data => {
        resolve(data);
        this.showPrompt();
      }, err => {
        console.log(err);
      });
    });
  }

  showPrompt() {
    const alert = this.alertCtrl.create({
      title: "Cambio realizado",
      subTitle: "Información de perfil actualizada",
      buttons: ['OK']
    });
    alert.present();
    if(this.role == "Profesionales de la Salud") {
      this.navCtrl.push(HomeDoctorsPage);
    }
    else if(this.role == "Farmacia") {
      this.navCtrl.push(HomePharmacyPage);
    }
  }
}
