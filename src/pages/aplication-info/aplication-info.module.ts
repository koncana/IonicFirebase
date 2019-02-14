import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AplicationInfoPage } from './aplication-info';

@NgModule({
  declarations: [
    AplicationInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(AplicationInfoPage),
  ],
})
export class AplicationInfoPageModule {}
