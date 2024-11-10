import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-volume-meter',
  templateUrl: './volume-meter.component.html',
  styleUrls: ['./volume-meter.component.scss']
})
export class VolumeMeterComponent implements OnChanges {
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';

  volumeHeight = 0;
  barColor = '#00ff00';

  @Input() audioData?: Int16Array;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['audioData'] && this.audioData) {
      this.calculateVolume();
    } else if (!this.audioData) {
      this.volumeHeight = 0;
      this.barColor = this.getColorForVolume(this.volumeHeight);
    }
  }

  private calculateVolume(): void {
    const absValues = this.audioData!.map(sample => Math.abs(sample));
    const averageVolume = absValues.reduce((sum, val) => sum + val, 0) / absValues.length;

    // Normalize to a 0-100 scale (you might adjust this depending on your audio range)
    this.volumeHeight = Math.max(10, Math.min(100, (averageVolume / 32768) * 2048));

    // Update color based on volume
    this.barColor = this.getColorForVolume(this.volumeHeight);
  }

  private getColorForVolume(volume: number): string {
    // Transition from green to red as volume goes from 0 to 100
    if (volume < 50) {
      return `rgb(${(volume / 50) * 255}, 255, 0)`;
    } else {
      return `rgb(255, ${(1 - (volume - 50) / 50) * 255}, 0)`;
    }
  }
}