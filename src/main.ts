import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "ShadowHand's Game";

document.title = gameName;

const container = document.createElement("div");
app.append(container);

const header = document.createElement("h1");
header.innerHTML = gameName;
container.append(header);
const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 300;
container.append(canvas);

let thickness = 2;
const tinyStroke = 2;
const largeStroke = 2;

let currentBrush = "thin";

const twoDee = canvas.getContext("2d");

class PenStroke {
  private points: { x: number; y: number }[];
  private lineWidth: number;
  constructor(initialPosition: { x: number; y: number }, lineWidth: number) {
    this.points = [initialPosition];
    this.lineWidth = lineWidth;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(context: CanvasRenderingContext2D) {
    if (this.points.length > 1) {
      context.beginPath();
      context.lineWidth = this.lineWidth;
      const { x, y } = this.points[0];
      context.moveTo(x, y);
      for (const { x, y } of this.points) {
        context.lineTo(x, y);
      }
      context.stroke();
    }
  }
}

const lines: PenStroke[] = [];
const redoLines: PenStroke[] = [];
let currentLine: PenStroke | null = null;

const point = { active: false, x: 0, y: 0 };

const canvasEventTarget = new EventTarget();

canvas.addEventListener("mousedown", (e) => {
  point.active = true;
  point.x = e.offsetX;
  point.y = e.offsetY;

  if (currentBrush == "thin") {
    thickness = tinyStroke;
  } else {
    thickness = largeStroke;
  }

  currentLine = new PenStroke({ x: point.x, y: point.y }, thickness);
  lines.push(currentLine);
  redoLines.length = 0;
  currentLine.drag(point.x, point.y);
  redraw();

  canvasEventTarget.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (point.active && currentLine) {
    point.x = e.offsetX;
    point.y = e.offsetY;
    currentLine.drag(point.x, point.y);

    redraw();

    canvasEventTarget.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  point.active = false;
  currentLine = null;

  redraw();

  canvasEventTarget.dispatchEvent(new Event("drawing-changed"));
});

function redraw() {
  if (twoDee) {
    twoDee.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
      line.display(twoDee);
    }
  }
}

document.body.append(document.createElement("br"));

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";

container.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.length = 0;
  redraw();

  canvasEventTarget.dispatchEvent(new Event("drawing-changed"));
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
container.append(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const poppedLine = lines.pop();
    if (poppedLine) {
      redoLines.push(poppedLine);
      redraw();

      canvasEventTarget.dispatchEvent(new Event("drawing-changed"));
    }
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
container.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoLines.length > 0) {
    const poppedRedoLine = redoLines.pop();
    if (poppedRedoLine) {
      lines.push(poppedRedoLine);
      redraw();

      canvasEventTarget.dispatchEvent(new Event("drawing-changed"));
    }
  }
});

const secondClass = document.createElement("div");
app.append(secondClass);

const thinToolButton = document.createElement("button");
thinToolButton.innerHTML = "thin";
secondClass.append(thinToolButton);

const thickToolButton = document.createElement("button");
thickToolButton.innerHTML = "thick";
secondClass.append(thickToolButton);

thinToolButton.addEventListener("click", () => {
  currentBrush = "thin";
  thinToolButton.classList.add("selectedTool");
  thickToolButton.classList.remove("selectedTool");
});

thickToolButton.addEventListener("click", () => {
  currentBrush = "thick";
  thickToolButton.classList.add("selectedTool");
  thinToolButton.classList.remove("selectedTool");
});
