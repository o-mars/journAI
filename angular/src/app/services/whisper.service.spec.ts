import { TestBed } from '@angular/core/testing';

import { WhisperService } from './whisper.service';

describe('WhisperServiceService', () => {
  let service: WhisperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhisperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
