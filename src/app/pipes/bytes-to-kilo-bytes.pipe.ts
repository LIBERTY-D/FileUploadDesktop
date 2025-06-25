import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytesToKiloBytes',
  standalone: true,
})
export class BytesToKiloBytesPipe implements PipeTransform {
  transform(bytes: number, precise: number = 2): unknown {
    let kilo = bytes / 1024;
    return kilo.toFixed(precise);
  }
}
