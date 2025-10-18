import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPrioritiesComponent } from './user-priorities-component';

describe('UserPrioritiesComponent', () => {
  let component: UserPrioritiesComponent;
  let fixture: ComponentFixture<UserPrioritiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPrioritiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPrioritiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
