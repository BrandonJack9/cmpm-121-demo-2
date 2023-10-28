import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "ShadowHand's Game";

document.title = gameName;
const one = 1;
const zero = 0;
const eight = 8;
const sixteen = 16;

const container = document.createElement("div");
app.append(container);

const header = document.createElement("h1");
header.innerHTML = gameName;
container.append(header);
const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 300;
canvas.style.cursor = "none";
container.append(canvas);

let thickness = 2;
const tinyStroke = 2;
const largeStroke = 6;

let currentBrush = "thin";

const twoDee = canvas.getContext("2d");

const lines: (PenStroke | StickerCommand)[] = [];
const redoLines: (PenStroke | StickerCommand)[] = [];

function notify(name: string) {
  bus.dispatchEvent(new Event(name));
}

let cursorCommand: CursorCommand | null = null;
let currentSticker: StickerCommand | null = null;

const bus = new EventTarget();
bus.addEventListener("drawing-changed", () => {
  redraw();
});

bus.addEventListener("tool-changed", () => {
  redraw();
});

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

  display(twoDee: CanvasRenderingContext2D) {
    if (this.points.length > one) {
      if (twoDee) {
        twoDee.strokeStyle = "black";
        twoDee.lineWidth = this.lineWidth;
        twoDee.beginPath();
        const { x, y } = this.points[zero];
        twoDee.moveTo(x, y);
        for (const { x, y } of this.points) {
          twoDee.lineTo(x, y);
        }
        twoDee.stroke();
      }
    }
  }
}

class CursorCommand {
  x: number;
  y: number;
  s: string;
  pos: { x: number; y: number };
  constructor(x: number, y: number, s: string) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.pos = { x, y };
  }
  execute(twoDee: CanvasRenderingContext2D) {
    if (twoDee) {
      twoDee.fillText("x", this.x - eight, this.y + sixteen);
      if (this.s) {
        twoDee.font = "10px monospace";
        twoDee.fillText(this.s, this.x - eight, this.y + sixteen);
      } else {
        if (thickness == largeStroke) {
          // Use a larger font size for the asterisk when using the "thick" tool
          twoDee.font = "30px monospace"; // Adjust the size as needed
        } else {
          // Use a smaller font size for the asterisk when using the "thin" tool
          twoDee.font = "10px monospace"; // Adjust the size as needed
        }
        twoDee.fillText("x", this.x - eight, this.y + sixteen);
      }
    }
  }
}

class StickerCommand {
  x: number;
  y: number;
  s: string;
  pos: { x: number; y: number };

  constructor(x: number, y: number, s: string) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.pos = { x, y };
  }

  display(twoDee: CanvasRenderingContext2D) {
    if (twoDee) {
      twoDee.font = "30px sans-serif"; // Adjust the size as needed
      twoDee.fillText(this.s, this.pos.x, this.pos.y);
    }
  }
  drag(x: number, y: number) {
    this.pos = { x: x, y: y };
  }
}

let currentLine: PenStroke | StickerCommand = new PenStroke(
  { x: zero, y: zero },
  zero
);

canvas.addEventListener("mouseout", () => {
  cursorCommand = null;
  currentSticker = null;
  notify("tool-changed");
});

//const points = { active: false, x: 0, y: 0 };

const canvasEventTarget = new EventTarget();

canvas.addEventListener("mouseenter", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY, "");
  canvasEventTarget.dispatchEvent(new Event("tool"));
});

canvas.addEventListener("mousemove", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY, "");
  if (currentSticker) {
    currentSticker.drag(e.offsetX, e.offsetY);
  }
  notify("tool-changed");

  if (e.buttons == one && currentLine) {
    cursorCommand = null;
    currentLine.drag(e.offsetX, e.offsetY);
    redraw();
    notify("drawing-changed");
  }
});

canvas.addEventListener("mousedown", (e) => {
  if (cursorCommand?.s) {
    currentSticker = new StickerCommand(e.offsetX, e.offsetY, cursorCommand.s);
  } else {
    //cursorCommand = null; //remove when draw
    if (currentBrush === "thin") {
      thickness = tinyStroke;
    } else {
      thickness = largeStroke;
    }
    currentLine = new PenStroke({ x: e.offsetX, y: e.offsetY }, thickness);
  }
  lines.push(currentSticker ?? currentLine); // Use the current sticker if avai
  redoLines.length = 0;
  notify("drawing-changed");
});

canvas.addEventListener("mouseup", () => {
  if (currentSticker) {
    currentSticker = null;
  }

  notify("drawing-changed");
});

function redraw() {
  if (twoDee) {
    twoDee.clearRect(zero, zero, canvas.width, canvas.height);
    lines.forEach((line) => line.display(twoDee));
    if (cursorCommand) {
      cursorCommand.execute(twoDee);
    }
    if (currentSticker) {
      currentSticker.display(twoDee);
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
  notify("drawing-changed");
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
container.append(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length > zero) {
    const poppedLine = lines.pop();
    if (poppedLine) {
      redoLines.push(poppedLine);
      redraw();
      notify("drawing-changed");
    }
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
container.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoLines.length > zero) {
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

const lineButton = document.createElement("button");
lineButton.innerHTML = "Pen";
secondClass.append(lineButton);

lineButton.addEventListener("click", () => {
  cursorCommand!.s = "";
});

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

const container3 = document.createElement("div");
app.append(container3);

// container 2 so buttons are below other buttons
const stickers = ["🎃", "😈", "👻", "👿", "☠️", "👺"];
for (const sticker of stickers) {
  const stickerButton = document.createElement("button");
  stickerButton.className = "sticker-button";
  stickerButton.type = "button";
  stickerButton.innerHTML = sticker; // Display the sticker as the button label

  // Event listener for each button
  stickerButton.addEventListener("click", (e) => {
    // Implement the command pattern for sticker placement
    const stickerCommand = new StickerCommand(e.offsetX, e.offsetY, sticker);
    currentSticker = stickerCommand;
    if (twoDee) {
      stickerCommand.display(twoDee);
    }
    lines.push(stickerCommand);
    notify("drawing-changed");
  });

  // Append the button to the container
  container3.append(stickerButton);
}
