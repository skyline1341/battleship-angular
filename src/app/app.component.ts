import {ChangeDetectorRef, Component, HostListener} from '@angular/core';

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
  alive: true;
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
  gameIsOver = false;

  ships: Ship[] = [
    {
      id: 1,
      coords: [],
      type: ShipTypes.L_SHAPED,
      dots: 4,
      alive: true,
    },
    {
      id: 2,
      coords: [],
      type: ShipTypes.I_SHAPED,
      dots: 4,
      alive: true,
    },
    {
      id: 3,
      coords: [],
      type: ShipTypes.DOT_SHAPED,
      dots: 1,
      alive: true,
    },
    {
      id: 4,
      coords: [],
      type: ShipTypes.DOT_SHAPED,
      dots: 1,
      alive: true,
    },
  ];

  @HostListener('window:keydown', ['$event'])
  spaceEvent(event: KeyboardEvent) {
    if (event.code === 'Space') {
      if (!this.gameIsOver) {
        this.shootRandom();
        this.gameIsOver = this.checkIfGameIsOver();
      }
    }
  }

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

  private shootRandom(): void {
    let x = 0;
    let y = 0;
    do {
      x = this.random(this.maxGrid - 1);
      y = this.random(this.maxGrid - 1);
    } while (this.matrix[x][y].status);
    this.matrix[x][y].status = true;
  }

  // private checkShipsKilled(): void {
  //   const shootedDots: Coord[] = [];
  //   for (let i = 0; i < this.maxGrid; i++) {
  //     for (let j = 0; j < this.maxGrid; j++) {
  //       if (this.matrix[i][j].status) {
  //         shootedDots.push({
  //           x: i,
  //           y: j,
  //         } as Coord);
  //       }
  //     }
  //   }
  //   console.log(shootedDots);
  // }

  private checkIfGameIsOver(): boolean {
    const maxDots = 4 + 4 + 1 + 1;
    let countDamaged = 0;
    for (let i = 0; i < this.maxGrid; i++) {
      for (let j = 0; j < this.maxGrid; j++) {
        const item = this.matrix[i][j];
        if (item.status && item.shipId !== null) {
          countDamaged++;
          if (countDamaged === maxDots) {
            return true;
          }
        }
      }
    }
    return false;
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
    const startX = this.random(this.maxGrid - 1);
    const startY = this.random(this.maxGrid - 1);
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

    if (!this.validateShip(ship)) {
      return this.generateShipShapeL(ship);
    }

    this.placeShip(ship);
    return ship;
  }

  private generateShipShapeI(ship: Ship): Ship {
    // выберем стартовую точку
    ship.coords = [];
    const startX = this.random(this.maxGrid - 1);
    const startY = this.random(this.maxGrid - 1);
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

    if (!this.validateShip(ship)) {
      return this.generateShipShapeI(ship);
    }

    this.placeShip(ship);
    return ship;
  }

  private generateShipShapeDot(ship: Ship): Ship {
    let count = 0;
    do {
      ship.coords = [];
      ship.coords.push({
        x: this.random(this.maxGrid - 1),
        y: this.random(this.maxGrid - 1),
      } as Coord);
      count++;
      if (this.validateShip(ship)) {
        break;
      }
    } while (count < 100);
    console.log(count);

    // // подвисаем тут - RangeError: Maximum call stack size exceeded
    // if (!this.validateShip(ship)) {
    //   return this.generateShipShapeDot(ship);
    // }
    // быстренько закостылил сверху кодом на время

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
