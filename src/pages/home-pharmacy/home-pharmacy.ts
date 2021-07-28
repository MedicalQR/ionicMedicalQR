import { Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, Nav, NavParams, ModalController, MenuController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ModalPharmacyPage } from '../modal-pharmacy/modal-pharmacy';
import { HttpClient } from '@angular/common/http';
import { GlobalDataProvider } from '../../providers/auth/global-data/global-data';
import { UserProfilePage } from '../../pages/user-profile/user-profile';
import { LoginPage } from '../../pages/login/login';
import firebase from 'firebase/app';
import 'firebase/auth';

@IonicPage()
@Component({
  selector: 'page-home-pharmacy',
  templateUrl: 'home-pharmacy.html',
})
export class HomePharmacyPage {
  @ViewChild(Nav) nav: Nav;
  qrData = null;
  createdCode = null;
  scannedCode = null;
  qr: any;
  doctor: any;
  pharmacy: any;
 
  constructor(public navCtrl: NavController, public menu: MenuController, public navParams: NavParams, private barcodeScanner: BarcodeScanner, public modalCtrl: ModalController, public menuCtrl: MenuController, public globalDataCtrl: GlobalDataProvider, public http: HttpClient) 
  {
    this.menuCtrl.enable(true, "myMenu");
    this.pharmacy = this.globalDataCtrl.getPharmacy();
  }

  ionViewDidLoad() 
  {
    this.menuCtrl.enable(true, "myMenu");
  }

  scanCode() {
    /*this.barcodeScanner.scan().then(barcodeData => {
      this.scannedCode = barcodeData.text;*/
      this.scannedCode = "5548ed03-1a6c-a352-db75-a0e1b1a480a6";
      var apiURL = this.globalDataCtrl.getApiURL();
      return new Promise(resolve => {
        this.http.get(apiURL+'UniqueIdentifierCodes/' + this.scannedCode).subscribe((data: any[]) => {
          resolve(this.qr = data);
          this.getDoctorInformation()
        }, err => {
          console.log(err);
        });
      });
    /*}, 
    (err) => {
      alert('Error: ' + err);
    });*/
  }
  
  getDoctorInformation() {
    var apiURL = this.globalDataCtrl.getApiURL();
    return new Promise(resolve => {
      this.http.get(apiURL+'doctors/' + this.qr.doctorId).subscribe((data: any[]) => {
        resolve(this.doctor = data);
        this.openModal();
      }, err => {
        console.log(err);
      });
    });
  }

  openModal() { 
    let modal = this.modalCtrl.create(ModalPharmacyPage, {qr: this.qr});
    modal.present();
  }
}