import {Component, HostListener} from '@angular/core';

export interface GridItem {
  shipId: number | null;
  damaged: boolean; // поражена ли клетка
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
  dotsLeft: number;
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
      dotsLeft: 4,
      alive: true,
    },
    {
      id: 2,
      coords: [],
      type: ShipTypes.I_SHAPED,
      dots: 4,
      dotsLeft: 4,
      alive: true,
    },
    {
      id: 3,
      coords: [],
      type: ShipTypes.DOT_SHAPED,
      dots: 1,
      dotsLeft: 1,
      alive: true,
    },
    {
      id: 4,
      coords: [],
      type: ShipTypes.DOT_SHAPED,
      dots: 1,
      dotsLeft: 1,
      alive: true,
    },
  ];

  @HostListener('window:keydown', ['$event'])
  spaceEvent(event: KeyboardEvent) {
    if (event.code === 'Space') {
      if (!this.gameIsOver) {
        this.shootRandom();
        this.gameIsOver = this.checkIfGameIsOver();
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    }
  }

  constructor() {
    this.matrix = this.createEmptyMatrix();
    this.generateShips(this.ships);
  }

  private shootRandom(): void {
    let x = 0;
    let y = 0;
    do {
      x = this.random(this.maxGrid - 1);
      y = this.random(this.maxGrid - 1);
    } while (this.matrix[x][y].damaged);
    this.matrix[x][y].damaged = true;
    for (const ship of this.ships) {
      const shipIsDamaged = this.checkIfShipDamaged(ship, x, y);
      if (shipIsDamaged) {
        const shipDots = document.querySelectorAll(`.ship${ship.id}`);
        // добавим класс поражения корабля для мигания
        // @ts-ignore
        for (const shipDot of shipDots) {
          shipDot.classList.add('damaged');
        }
        if (ship.dotsLeft - 1 > 0) {
          ship.dotsLeft--;
          // @ts-ignore
          for (const shipDot of shipDots) {
            setTimeout(() => {
              shipDot.classList.remove('damaged');
            }, 300);
          }
        }
      }
    }
  }

  private checkIfShipDamaged(ship: Ship, x: number, y: number): boolean {
    for (const coord of ship.coords) {
      if (coord.x === x && coord.y === y) {
        return true;
      }
    }
    return false;
  }

  private checkIfGameIsOver(): boolean {
    const maxDots = 4 + 4 + 1 + 1;
    let countDamaged = 0;
    for (let i = 0; i < this.maxGrid; i++) {
      for (let j = 0; j < this.maxGrid; j++) {
        const item = this.matrix[i][j];
        if (item.damaged && item.shipId !== null) {
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
          damaged: false,
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
    ship.coords = [];
    ship.coords.push({
      x: this.random(this.maxGrid - 1),
      y: this.random(this.maxGrid - 1),
    } as Coord);
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
      for (const otherShip of this.ships) {
        if (otherShip.id !== ship.id) {
          for (const otherCoord of otherShip.coords) {
            if (Math.abs(otherCoord.x - dot.x) < 2 && Math.abs(otherCoord.y - dot.y) < 2) {
              return false;
            }
          }
        }
      }

    }
    return true;
  }
}
