import {ChangeDetectorRef, Component} from '@angular/core';

export interface GridItem {
  shipId: number | null;
  status: boolean; // поражена ли клетка
}

export interface Coord {
  x: number;
  y: number;
}

export interface Ship {
  id: number;
  coords: Coord[]; // массив клеток, занимаемых кораблем
  type: string;
  dots: number;
}

export enum ShipTypes {
  L_SHAPED = 'L-shaped ship',
  I_SHAPED = 'I-shaped ship',
  DOT_SHAPED = 'Dot-shaped ship',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  readonly maxGrid = 10;
  title = 'battleship';
  matrix: GridItem[][];

  ships: Ship[] = [
    {
      id: 1,
      coords: [],
      type: ShipTypes.L_SHAPED,
      dots: 4,
    },
    {
      id: 2,
      coords: [],
      type: ShipTypes.I_SHAPED,
      dots: 4,
    },
    {
      id: 3,
      coords: [],
      type: ShipTypes.DOT_SHAPED,
      dots: 1,
    },
    {
      id: 4,
      coords: [],
      type: ShipTypes.DOT_SHAPED,
      dots: 1,
    },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
  ) {
    this.init();
  }

  private init(): void {
    this.matrix = this.createEmptyMatrix();
    this.generateShips(this.ships);
    console.log(this.ships);
  }

  private createEmptyMatrix(): GridItem[][] {
    const x = this.maxGrid;
    const y = this.maxGrid;
    const matrix = new Array(x);
    for (let i = 0; i < x; i++) {
      matrix[i] = new Array(y);
      for (let j = 0; j < y; j++) {
        matrix[i][j] = {
          shipId: null,
          status: false,
        } as GridItem;
      }
    }
    return matrix;
  }

  private generateShips(ships: Ship[]): void {
    for (const ship of ships) {
      switch (ship.type) {
        case ShipTypes.L_SHAPED:
          this.generateShipShapeL(ship);
          break;
        case ShipTypes.I_SHAPED:
          this.generateShipShapeI(ship);
          break;
        case ShipTypes.DOT_SHAPED:
          this.generateShipShapeDot(ship);
          break;
      }
    }
  }

  private random(max): number {
    return Math.floor(Math.random() * (max + 1));
  }

  private placeShip(ship: Ship): void {
    for (const coord of ship.coords) {
      if (this.matrix[coord.x][coord.y]) {
        const currentItem = this.matrix[coord.x][coord.y];
        currentItem.shipId = ship.id;
      }
    }
  }

  private generateShipShapeL(ship: Ship): Ship {
    // выберем стартовую точку
    ship.coords = [];
    const startX = this.random(this.maxGrid);
    const startY = this.random(this.maxGrid);
    const horizontal = !!this.random(1);
    const atStart = this.random(1);
    const ckw = this.random(1);

    if (horizontal) {
      for (let i = startX; i < startX + 3; i++) {
        ship.coords.push({
          x: i,
          y: startY,
        } as Coord);
      }
      if (atStart) {
        if (ckw) {
          ship.coords.push({
            x: startX,
            y: startY + 1,
          } as Coord);
        } else {
          ship.coords.push({
            x: startX,
            y: startY - 1,
          } as Coord);
        }
      } else {
        if (ckw) {
          ship.coords.push({
            x: startX + 2,
            y: startY - 1,
          } as Coord);
        } else {
          ship.coords.push({
            x: startX + 2,
            y: startY + 1,
          } as Coord);
        }
      }
    } else {
      for (let i = startY; i < startY + 3; i++) {
        ship.coords.push({
          x: startX,
          y: i,
        } as Coord);
      }
      if (atStart) {
        if (ckw) {
          ship.coords.push({
            x: startX + 1,
            y: startY,
          } as Coord);
        } else {
          ship.coords.push({
            x: startX - 1,
            y: startY,
          } as Coord);
        }
      } else {
        if (ckw) {
          ship.coords.push({
            x: startX - 1,
            y: startY + 2,
          } as Coord);
        } else {
          ship.coords.push({
            x: startX + 1,
            y: startY + 2,
          } as Coord);
        }
      }
    }

    // ЗАЦИКЛИВАЕМСЯ ТУТ - RangeError: Maximum call stack size exceeded
    if (!this.validateShip(ship)) {
      return this.generateShipShapeL(ship);
    }

    this.placeShip(ship);
    return ship;
  }

  private generateShipShapeI(ship: Ship): Ship {
    // выберем стартовую точку
    ship.coords = [];
    const startX = this.random(this.maxGrid);
    const startY = this.random(this.maxGrid);
    const horizontal = !!this.random(1);

    if (horizontal) {
      for (let i = startX; i < startX + 4; i++) {
        ship.coords.push({
          x: i,
          y: startY,
        } as Coord);
      }
    } else {
      for (let i = startY; i < startY + 4; i++) {
        ship.coords.push({
          x: startX,
          y: i,
        } as Coord);
      }
    }

    // ЗАЦИКЛИВАЕМСЯ ТУТ - RangeError: Maximum call stack size exceeded
    if (!this.validateShip(ship)) {
      return this.generateShipShapeI(ship);
    }

    this.placeShip(ship);
    return ship;
  }

  private generateShipShapeDot(ship: Ship): Ship {
    ship.coords = [];
    ship.coords.push({
      x: this.random(this.maxGrid),
      y: this.random(this.maxGrid),
    } as Coord);

    // ЗАЦИКЛИВАЕМСЯ ТУТ - RangeError: Maximum call stack size exceeded
    if (!this.validateShip(ship)) {
      return this.generateShipShapeDot(ship);
    }

    this.placeShip(ship);
    return ship;
  }

  private validateShip(ship: Ship): boolean {
    for (const dot of ship.coords) {
      // проверить на выход за рамки
      if (
        ship.type !== ShipTypes.DOT_SHAPED
        && dot.x < 0 || dot.x > this.maxGrid - 1 || dot.y < 0 || dot.y > this.maxGrid - 1
      ) {
        return false;
      }

      // проверить на нахождение в непосредственной близости с другими уже созданными кораблями
      for (const curShip of this.ships) {
        if (curShip.id !== ship.id) {
          for (const otherCoord of curShip.coords) {
            if (Math.abs(otherCoord.x - dot.x) < 2 || Math.abs(otherCoord.y - dot.y) < 2) {
              return false;
            }
          }
        }
      }

    }
    return true;
  }
}
