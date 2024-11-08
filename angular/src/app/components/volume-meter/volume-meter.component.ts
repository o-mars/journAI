import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-volume-meter',
  templateUrl: './volume-meter.component.html',
  styleUrls: ['./volume-meter.component.scss']
})
export class VolumeMeterComponent {
  @Input() barColor: string = 'lightgreen';
  bars: number[] = new Array(10).fill(0);

  @Input()
  set audioData(data: Int16Array | undefined) {
    if (data) this.updateVolumeMeter(data);
    else {
      for (let i = 0; i < this.bars.length; i++) {
        this.bars[i] = 0;
      }  
    }
  }

  private calculateAverageVolume(data: Int16Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += Math.abs(data[i]);
    }
    return sum / data.length;
  }

  private updateVolumeMeter(data: Int16Array): void {
    const volume = this.calculateAverageVolume(data);
    const normalizedVolume = Math.min(volume / 32767, 1); // Normalize to [0, 1]

    for (let i = 0; i < this.bars.length; i++) {
      this.bars[i] = i < this.bars.length * normalizedVolume ? normalizedVolume * 100 : 0;
    }
  }
}
