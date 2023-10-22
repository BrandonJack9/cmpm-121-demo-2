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

const twoDee = canvas.getContext("2d");

const lines: { x: number; y: number }[][] = [];
const redoLines: { x: number; y: number }[][] = [];

let currentLine: { x: number; y: number }[] | null = null;

const point = { active: false, x: 0, y: 0 };

const canvasEventTarget = new EventTarget();

canvas.addEventListener("mousedown", (e) => {
  point.active = true;
  point.x = e.offsetX;
  point.y = e.offsetY;

  currentLine = [];
  lines.push(currentLine);
  redoLines.splice(0, redoLines.length);
  currentLine.push({ x: point.x, y: point.y });
  redraw();

  canvasEventTarget.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (e) => {
  if (point.active && currentLine) {
    point.x = e.offsetX;
    point.y = e.offsetY;
    currentLine.push({ x: point.x, y: point.y });

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
      if (line.length > 1) {
        twoDee.beginPath();
        const { x, y } = line[0];
        twoDee.moveTo(x, y);
        for (const { x, y } of line) {
          twoDee.lineTo(x, y);
        }
        twoDee.stroke();
      }
    }
  }
}

document.body.append(document.createElement("br"));

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";

container.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.splice(0, lines.length);
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

canvasEventTarget.addEventListener("drawing-changed", () => {
  redraw();
});
