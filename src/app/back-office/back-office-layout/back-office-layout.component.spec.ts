import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BackOfficeLayoutComponent } from './back-office-layout.component';

describe('BackOfficeLayoutComponent', () => {
  let component: BackOfficeLayoutComponent;
  let fixture: ComponentFixture<BackOfficeLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, BackOfficeLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackOfficeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
