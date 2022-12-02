class Cell {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.edges = {
      top: true,
      bottom: true,
      right: true,
      left: true,
    }
    this.visited = false;
    this.startCell = false;
  }

  getX = () => { return this.x; }
  getY = () => { return this.y; }

  setEdge = (edge, value) => { this.edges[edge] = value; }

  isVisited = () => { return this.visited; }
  setVisited = (visited) => { this.visited = visited; }

  setStartCell = (startCell) => { this.startCell = startCell; }

  render = (x, y, w, h) => {
    stroke('#4CAF50');
    if (this.edges.top) {
      line(x, y, x + w, y);
    }
    if (this.edges.bottom) {
      line(x, y + h, x + w, y + h);
    }
    if (this.edges.left) {
      line(x, y, x, y + h);
    }
    if (this.edges.right) {
      line(x + w, y, x + w, y + h);
    }

    if (this.startCell) {
      noStroke();
      fill('#aaf2bd');
      rect(x, y, w, h);
    }
  }
}

class Maze {
  constructor () {
    this.width = 100;
    this.height = 100;
    this.roomsNum = 2;
    this.roomsWidth = 2;
    this.roomsHeight = 2;
    this.entryPoint = 'right';
    this.cells = [];

    this.rooms = [];
  }

  setWidth = (width) => { this.width = width; }
  setHeight = (height) => { this.height = height; }
  setRooms = (rooms) => { this.roomsNum = rooms; }
  setRoomsWidth = (width) => { this.roomsWidth = width; }
  setRoomsHeight = (height) => { this.roomsHeight = height; }
  setEntryPoint = (entryPoint) => { this.entryPoint = entryPoint; }

  _generateRooms = () => {
    let generated = false;
    let x = 0;
    let y = 0;
    while (!generated) {
      x = floor(random(this.width - this.roomsWidth - 3) + 1);
      y = floor(random(this.height - this.roomsHeight - 3) + 1);

      generated = true;
      for (let i = 0; i < this.rooms.length; i++) {
        if (x >= this.rooms[i].x - this.roomsWidth - 1 && x <= this.rooms[i].x + this.roomsWidth + 1 &&
          y >= this.rooms[i].y - this.roomsHeight - 1 && y <= this.rooms[i].y + this.roomsHeight + 1) {
            generated = false;
            break;
        }
      }
    }

    this.rooms.push({ x: x, y: y });

    for (let i = x; i < x + this.roomsWidth; i++) {
      for (let j = y; j < y + this.roomsHeight; j++) {
        this.cells[i][j].setEdge('left', false);
        this.cells[i][j].setEdge('right', false);
        this.cells[i][j].setEdge('top', false);
        this.cells[i][j].setEdge('bottom', false);
      }
    }
  }

  _getStartCell = () => {
    let current = null;

    if (this.entryPoint === 'right') {
      const x = this.width - 1;
      const y = floor(this.height / 2);
      current = this.cells[x][y];
    } else if (this.entryPoint === 'left') {
      const x = 0;
      const y = floor(this.height / 2);
      current = this.cells[x][y];
    } else if (this.entryPoint === 'bottom') {
      const x = floor(this.width / 2);
      const y = this.height - 1;
      current = this.cells[x][y];
    } else {
      const x = floor(this.width / 2);
      const y = 0;
      current = this.cells[x][y];
    }

    return current;
  }

  _getCell = (x, y) => {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }

    return this.cells[x][y];
  }

  _getRandomNeigbour = (x, y) => {
    const pool = [];
    let cell = null;

    cell = this._getCell(x, y + 1);
    if (cell && !cell.isVisited()) {
      pool.push(cell);
    }

    cell = this._getCell(x, y - 1);
    if (cell && !cell.isVisited()) {
      pool.push(cell);
    }

    cell = this._getCell(x + 1, y);
    if (cell && !cell.isVisited()) {
      pool.push(cell);
    }

    cell = this._getCell(x - 1, y);
    if (cell && !cell.isVisited()) {
      pool.push(cell);
    }

    if (!pool.length) {
      return undefined;
    }

    return random(pool);
  }

  _removeWalls = (a, b) => {
    let diff = a.getX() - b.getX();
    if (diff > 0) {
      a.setEdge('left', false);
      b.setEdge('right', false);
    } else if (diff < 0) {
      a.setEdge('right', false);
      b.setEdge('left', false);
    }

    diff = a.getY() - b.getY();
    if (diff > 0) {
      a.setEdge('top', false);
      b.setEdge('bottom', false);
    } else if (diff < 0) {
      a.setEdge('bottom', false);
      b.setEdge('top', false);
    }
  }

  generate = () => {
    this.cells = [];
    const bucket = [];

    for (let i = 0; i < this.width; i++) {
      this.cells.push([]);
      for (let j = 0; j < this.height; j++) {
        this.cells[i].push(new Cell(i, j));
        bucket.push({ x: i, y: j });

        if (i > 0) {
          bucket.push({ x: i, y: j, edge: 'left' });
        }
        if (j > 0) {
          bucket.push({ x: i, y: j, edge: 'bottom' });
        }
        if (i < this.width - 1) {
          bucket.push({ x: i, y: j, edge: 'right' });
        }
        if (i < this.height - 1) {
          bucket.push({ x: i, y: j, edge: 'right' });
        }
      }
    }

    this.rooms = [];
    for (let i = 0; i < this.roomsNum; i++) {
      this._generateRooms();
    }

    let current = this._getStartCell();
    const stack = [];

    current.setVisited(true);
    current.setStartCell(true);
    stack.push(current);

    while (stack.length) {
      current = stack.pop();
      console.log(stack.length);

      const next = this._getRandomNeigbour(current.getX(), current.getY());
      if (next) {
        stack.push(current);
        this._removeWalls(current, next);
        next.setVisited(true);
        stack.push(next);
      }
    }
  }

  render = () => {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells.length; j++) {
        const w = width / this.width
        const h = height / this.height
        this.cells[i][j].render(i * w, j * h, w, h);
      }
    }
  }
}

let maze = null;

function setup() {
  const canvas = createCanvas(select('#canvas-container').width, windowHeight);
  canvas.parent('canvas-container');

  maze = new Maze();

  select('#btn-generate').mousePressed(() => {
    maze.setWidth(int(select('#width').value()));
    maze.setHeight(int(select('#height').value()));
    maze.setRooms(int(select('#rooms-num').value()));
    maze.setRoomsWidth(int(select('#rooms-width').value()));
    maze.setRoomsHeight(int(select('#rooms-height').value()));
    maze.setEntryPoint(select('#entry-point').value());
    maze.generate();
  });
}

function draw() {
  background(55);
  maze.render();
}
