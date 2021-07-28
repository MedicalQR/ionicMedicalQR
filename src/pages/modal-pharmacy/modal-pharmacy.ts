import { Component } from '@angular/core';
import { ModalController, Platform, NavParams, ViewController } from 'ionic-angular';
import { IfStmt } from '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { GlobalDataProvider } from '../../providers/auth/global-data/global-data';
import { Guid } from "guid-typescript";


@Component({
  templateUrl: 'modal-pharmacy.html',
})
export class ModalPharmacyPage {
    
  qr: any;
  doctor: any;
  id: any;
  info: any = {};
  message: any;
  color: any;
  code: any = {};
  allSecurityCodes: any = [];

  constructor(public platform: Platform, public params: NavParams, public viewCtrl: ViewController, public globalDataCtrl: GlobalDataProvider, public http: HttpClient) 
  {
    let qr = {};
    this.qr = this.params.get('qr');  
    let doctor = {};
    this.doctor = doctor;
    let info = {};
    this.info = info;
  }

  ionViewWillEnter(){
    this.getDoctorInformation();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getSecurityCodes(){
    var apiURL = this.globalDataCtrl.getApiURL();
    var securityCodes;
    return new Promise(resolve => {
      this.http.get(apiURL+'SecurityCodes').subscribe((data: any[]) => {
        resolve(securityCodes = data);
        securityCodes.forEach(securityCode => {
          if(securityCode.doctorId == this.doctor.id) {
            this.allSecurityCodes.push(securityCode);
          }
        });
      }, err => {
        console.log(err);
      });
    });
  }

  getDoctorInformation() {
    var apiURL = this.globalDataCtrl.getApiURL();
    return new Promise(resolve => {
      this.http.get(apiURL+'doctors/' + this.qr.doctorId).subscribe((data: any[]) => {
        resolve(this.doctor = data);
        this.getSecurityCodes();
      }, err => {
        console.log(err);
      });
    });
  }

  checkPrescription() {
    let result = false;
    let validationCode = document.getElementById("validation_code");
    let validationDate = document.getElementById("validation_date");
    if(this.info.code != null) {
      validationCode.innerHTML = "";
      if(this.info.date != null) {
        validationDate.innerHTML = "";
        let splitDate = this.info.date.split("-");
        let yy = splitDate[0];
        let mm = splitDate[1];
        let dd = splitDate[2];
        let date = mm + "/" + dd + "/" + yy;
        var timeDiff = Math.abs(new Date().getTime() - new Date(date).getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

        if(this.allSecurityCodes.length > 0) {
          this.allSecurityCodes.forEach(securityCode => {
            if(this.info.code == securityCode.securityNumber){
              this.code = securityCode;
              result = true;
            }
            else {
              let result = false;
            }
          });
        }
        else {
          let result = false;
        }
        if(result) {
          this.verifyDetails(date, diffDays);
        }
        else {
          this.writeMessage(result);
        }
      }
      else 
      validationDate.innerHTML = "Por favor, ingrese la fecha que figura en la receta.";
    }
    else 
    validationCode.innerHTML = "Por favor, ingrese el código de seguridad que figura en la receta.";
  }

  verifyDetails(date, diffDays) {
    let result = false;
    if(this.code != null) {
      if(new Date(this.code.creationDate) <= new Date(date) && new Date(date) < new Date(this.code.expirationDate)) {
        if(diffDays < 30) {
          if(this.qr.status == "Activo") {
            result = true;
          }
          else if(this.qr.status == "Inactivo") {
            if(new Date(date) < new Date(this.qr.modificationDate)) {
              result = true;
            }
          }
          else {
            result = false;
          }
        }
      }
    }

    this.writeMessage(result);
  }

  writeMessage(result) {
    if(result) {
      let message = document.getElementById("message");
      message.innerHTML = "La receta pasó la validación exitosamente.";
      message.style.color = "green";

      let pharmacy = this.globalDataCtrl.getPharmacy();
      let medicalreceipt = {
        "id": Guid.create().toString(),
        "scanDate": new Date(),
        "validationResult": "Exitoso",
        "pharmacyId": pharmacy.id,
        "uicId": this.qr.id,
        "securityCodeId": this.info.code,
        "applicationMessage": "La prescripción médica es válida."
      }

      var apiURL = this.globalDataCtrl.getApiURL();
      return new Promise(resolve => {
        this.http.post(apiURL+'MedicalReceipts', medicalreceipt).subscribe(data => {
          resolve(data);
        }, err => {
          console.log(err);
        });
      });
    }
    else {
      let message = document.getElementById("message");
      message.innerHTML = "Error! La receta no pasó la validación.";
      message.style.color = "red";

      let pharmacy = this.globalDataCtrl.getPharmacy();
      let medicalreceipt = {
        "id": Guid.create().toString(),
        "scanDate": new Date(),
        "validationResult": "Fallido",
        "pharmacyId": pharmacy.id,
        "uicId": this.qr.id,
        "securityCodeId": this.info.code,
        "applicationMessage": "Alguno de los datos ingresados no es válido. La prescripción médica no es válida."
      }

      var apiURL = this.globalDataCtrl.getApiURL();
      return new Promise(resolve => {
        this.http.post(apiURL+'MedicalReceipts', medicalreceipt).subscribe(data => {
          resolve(data);
        }, err => {
          console.log(err);
        });
      });
    }
  }
}
