import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AllAccountsPage } from './all-accounts';

@NgModule({
  declarations: [
    AllAccountsPage,
  ],
  imports: [
    IonicPageModule.forChild(AllAccountsPage),
  ],
})
export class AllAccountsPageModule {}
