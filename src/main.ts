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

const point = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (e) => {
  point.active = true;
  point.x = e.offsetX;
  point.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (point.active && twoDee) {
    twoDee.beginPath();
    twoDee.moveTo(point.x, point.y);
    twoDee.lineTo(e.offsetX, e.offsetY);
    twoDee.stroke();
    point.x = e.offsetX;
    point.y = e.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  point.active = false;
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";

container.append(clearButton);

clearButton.addEventListener("click", () => {
  if (twoDee) {
    twoDee.clearRect(0, 0, canvas.width, canvas.height);
  }
});
