import { TestBed } from '@angular/core/testing';

import { OpenaiRealtimeClientService } from './openai-realtime-client.service';

describe('OpenaiRealtimeClientService', () => {
  let service: OpenaiRealtimeClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenaiRealtimeClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
