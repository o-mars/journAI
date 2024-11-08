import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LogoutComponent } from './components/logout/logout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EntryComponent } from './components/entry/entry.component';
import { NewEntryComponent } from './components/new-entry/new-entry.component';
import { HeaderComponent } from './components/header/header.component';
import { MenuComponent } from './components/menu/menu.component';
import { ConversationComponent } from './components/conversation/conversation.component';
import { VolumeMeterComponent } from './components/volume-meter/volume-meter.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    SettingsComponent,
    LogoutComponent,
    DashboardComponent,
    EntryComponent,
    NewEntryComponent,
    HeaderComponent,
    MenuComponent,
    ConversationComponent,
    VolumeMeterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
