import GameMap from './GameMap';
import Player from "./Player";
import Control from "./Control";
import Camera from "./Camera"
import Item from './Item';
import Box from './Box';
import {MAP_WIDTH, MAP_HEIGHT, BLOCK_SIZE, GAME_STATE} from '../constant/map';
import {level} from '../constant/level';
import Portal from './Portal';

const colorObj = {r: 0, g: 0, b: 0};
let hasBackgroundColor = false;

class Game {
  init() {
    // main canvas
    this.canvas = document.getElementById('canvas');
    this.canvas.width = MAP_WIDTH;
    this.canvas.height = MAP_HEIGHT;
    this.context = this.canvas.getContext('2d');

    this.state = GAME_STATE.GAME_READY;
    this.stageNum = 0;

    this.camera = new Camera();
    this.map = new GameMap(this.context);
    this.control = new Control()
    if (this.state === GAME_STATE.GAME_READY) {
      this.load(this.stageNum);
      this.state = GAME_STATE.GAME_PLAYING;
    }
  }

  load(stageNum) {
    const {map, control, context} = this;
    const stage = level[stageNum];

    map.load(stage.map);
    control.init();

    this.player = new Player(0, 0);

    console.log(stage.portal)
    this.portal = new Portal(stage.portal, this.context, this.player);
  
    this.items = stage.items.map(({x, y, color}) => {
      const item =  new Item(x * BLOCK_SIZE, y * BLOCK_SIZE, color, context, this.player);
      return item;
    });

    this.boxes = stage.boxes.map(({x, y, color}) => {
      const box =  new Box(x * BLOCK_SIZE, y * BLOCK_SIZE, color, context, this.player);
      return box;
    });
  }

  update() {
    const {player, camera, items, boxes, portal} = this;
    player.move(this.control);
    player.update();
    camera.update(player.x);
    portal.update();
    items.forEach(item => {
      item.update();

      if (!item.show && item.changeBackground) {
        hasBackgroundColor = true;
        colorObj.r += item.color.r;
        colorObj.g += item.color.g;
        colorObj.b += item.color.b;
        item.changeBackground = false;
      }
    })

    boxes.forEach(box => {
      box.update(colorObj)
    });

    // when player reach the portal
    if (this.portal.reach) {
      this.state = GAME_STATE.GAME_CLEAR;
      this.stageNum += 1;
    }
  }

  render() {
    const {state, context, map, player, camera, items, boxes, portal} = this;
    context.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    if(hasBackgroundColor) {
      context.fillStyle = `rgb(${colorObj.r}, ${colorObj.g}, ${colorObj.b})`;
      context.fillRect(0,0,MAP_WIDTH, MAP_HEIGHT)
    }

    if (state === GAME_STATE.GAME_READY) {
      // Todo: renderReady
    } else if (state === GAME_STATE.GAME_PLAYING) {
      this.update();
      map.render(camera.cx);
      items.forEach(item => {
        item.render(camera.cx)
      });
      boxes.forEach(box => {
        box.render(camera.cx)
      });
      player.render(camera.cx, context);
      portal.render(camera.cx)
    } else if (state === GAME_STATE.GAME_CLEAR) {
      this.load(this.stageNum);
      this.state = GAME_STATE.GAME_PLAYING
    }

  }
}

export default Game;
