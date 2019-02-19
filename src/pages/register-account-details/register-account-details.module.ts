import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegisterAccountDetailsPage } from './register-account-details';

@NgModule({
  declarations: [
    RegisterAccountDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(RegisterAccountDetailsPage),
  ],
})
export class RegisterAccountDetailsPageModule {}
