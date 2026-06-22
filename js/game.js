const GAME_WIDTH = 1200;
const GAME_HEIGHT = 800;
const PLAYER_SPEED = 280;
const PLAYER_SLIDE_SPEED = 500;
const WATER_BOOST_SPEED = 600;
const SYRUP_SLOW_SPEED = 140;
const WATER_STAIN_SLIDE_SPEED = 700;

const STAIN_NORMAL = 'normal';
const STAIN_STUBBORN = 'stubborn';
const STAIN_OIL = 'oil';
const STAIN_SYRUP = 'syrup';
const STAIN_FLOUR = 'flour';
const STAIN_WATER = 'water';

const STAIN_COLORS = {
    [STAIN_NORMAL]: { fill: 0x8d6e63, alpha: 0.6, name: '普通污渍' },
    [STAIN_STUBBORN]: { fill: 0x5d4037, alpha: 0.9, name: '顽固污渍' },
    [STAIN_OIL]: { fill: 0x6d4c41, alpha: 0.85, name: '油渍' },
    [STAIN_SYRUP]: { fill: 0xfbc02d, alpha: 0.9, name: '糖浆' },
    [STAIN_FLOUR]: { fill: 0xeceff1, alpha: 0.95, name: '面粉' },
    [STAIN_WATER]: { fill: 0x4fc3f7, alpha: 0.5, name: '水渍' }
};

let gameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(gameConfig);

let player;
let cursors;
let keys = {};
let stains = [];
let sponges = [];
let hotPans = [];
let potLids = [];
let steamBursts = [];
let waterStreams = [];
let crumbs = [];
let collectPoints = [];
let fragileDishes = [];
let drippingFaucets = [];
let soapBubbles = [];
let utensils = [];
let utensilRacks = [];
let droppedItems = [];
let comboText;
let stainTypeText;

let score = 0;
let timeLeft = 90;
let level = 1;
let gameState = 'menu';
let combo = 0;
let comboTimer = 0;
let maxCombo = 0;
let scoreText;
let timeText;
let levelText;
let backgroundGraphics;
let uiGraphics;
let menuGraphics;
let gameOverText;
let finalScoreText;
let hintText;
let objectivesPanel;
let objStainText;
let objCrumbText;
let objFaucetText;
let objUtensilText;
let objDishText;
let objPanelGraphics;

let levelTotalStains = 0;
let levelTotalCrumbs = 0;
let levelTotalFaucets = 0;
let levelTotalUtensils = 0;
let levelTotalDishes = 0;
let levelTotalPots = 0;

let playerVelocity = new Phaser.Math.Vector2();
let isSliding = false;
let slideDirection = new Phaser.Math.Vector2();
let slideTimer = 0;
let sprayCooldown = 0;
let sprayParticles = [];
let invincible = false;
let invincibleTimer = 0;
let onWaterStream = false;
let waterBoostTimer = 0;
let onSyrup = false;
let syrupSlowTimer = 0;
let onWaterStain = false;
let onFlour = false;
let heldItem = null;

let lastTime = 0;

function preload() {
}

function create() {
    backgroundGraphics = this.add.graphics();
    uiGraphics = this.add.graphics();
    menuGraphics = this.add.graphics();

    cursors = this.input.keyboard.createCursorKeys();
    keys.W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keys.A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keys.S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keys.D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keys.SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keys.SHIFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    keys.E = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    keys.ENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    scoreText = this.add.text(20, 20, '分数: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setScrollFactor(0).setDepth(100);

    timeText = this.add.text(GAME_WIDTH - 200, 20, '时间: 90', {
        fontSize: '24px',
        fill: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setScrollFactor(0).setDepth(100);

    levelText = this.add.text(GAME_WIDTH / 2 - 60, 20, '第 1 关', {
        fontSize: '24px',
        fill: '#ffeb3b',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setScrollFactor(0).setDepth(100);

    hintText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40,
        'WASD/方向键移动 | 空格喷清洁剂 | Shift滑行 | E交互/捡道具', {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(100).setOrigin(0.5);

    objPanelGraphics = this.add.graphics();
    objPanelGraphics.setScrollFactor(0).setDepth(99);
    objPanelGraphics.fillStyle(0x000000, 0.55);
    objPanelGraphics.fillRoundedRect(15, 60, 205, 180, 10);
    objPanelGraphics.lineStyle(2, 0x4fc3f7, 0.8);
    objPanelGraphics.strokeRoundedRect(15, 60, 205, 180, 10);

    let objTitle = this.add.text(118, 75, '🎯 关卡目标', {
        fontSize: '15px',
        fill: '#ffeb3b',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    }).setScrollFactor(0).setDepth(100).setOrigin(0.5);

    objStainText = this.add.text(28, 100, '污渍: 0/0 ✅', {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
    }).setScrollFactor(0).setDepth(100);

    objCrumbText = this.add.text(28, 125, '碎屑: 0/0 ✅', {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
    }).setScrollFactor(0).setDepth(100);

    objFaucetText = this.add.text(28, 150, '水龙头: 0/0 ✅', {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
    }).setScrollFactor(0).setDepth(100);

    objUtensilText = this.add.text(28, 175, '餐具整理: 0/0 ✅', {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
    }).setScrollFactor(0).setDepth(100);

    objDishText = this.add.text(28, 200, '杯盘完好: 0/0 ✅', {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
    }).setScrollFactor(0).setDepth(100);

    comboText = this.add.text(GAME_WIDTH - 20, 60, '', {
        fontSize: '28px',
        fill: '#ffeb3b',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setScrollFactor(0).setDepth(100).setOrigin(1, 0);

    stainTypeText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 75, '', {
        fontSize: '14px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2
    }).setScrollFactor(0).setDepth(100).setOrigin(0.5);

    gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '', {
        fontSize: '64px',
        fill: '#ff5722',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8
    }).setScrollFactor(0).setDepth(200).setOrigin(0.5).setVisible(false);

    finalScoreText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, '', {
        fontSize: '32px',
        fill: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
    }).setScrollFactor(0).setDepth(200).setOrigin(0.5).setVisible(false);

    this.time.addEvent({
        delay: 1000,
        callback: () => {
            if (gameState === 'playing') {
                timeLeft--;
                if (timeLeft <= 0) {
                    endGame(false);
                }
            }
        },
        loop: true
    });

    showMenu();
}

function showMenu() {
    gameState = 'menu';
    menuGraphics.clear();
    menuGraphics.fillStyle(0x000000, 0.7);
    menuGraphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    menuGraphics.fillStyle(0x4fc3f7, 1);
    menuGraphics.fillRoundedRect(GAME_WIDTH / 2 - 250, GAME_HEIGHT / 2 - 200, 500, 400, 20);

    menuGraphics.lineStyle(4, 0x0288d1, 1);
    menuGraphics.strokeRoundedRect(GAME_WIDTH / 2 - 250, GAME_HEIGHT / 2 - 200, 500, 400, 20);

    let scene = game.scene.scenes[0];

    let title = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120,
        '🧹 微缩厨房清洁挑战 🧹', {
            fontSize: '36px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#01579b',
            strokeThickness: 6
        }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    let desc = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
        '操控小小清洁员\n在巨大的厨房中完成清洁任务！', {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    let featuresText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10,
        '💧 多种污渍 | 🔥 热锅蒸汽 | 🛡️ 锅盖屏障 | ⚡ 连击系统', {
            fontSize: '14px',
            fill: '#b3e5fc',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    let startText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70,
        '按 回车键 开始游戏', {
            fontSize: '28px',
            fill: '#ffeb3b',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    let controlsText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130,
        'WASD/方向键: 移动 | 空格: 喷清洁剂 | Shift: 滑行 | E: 交互/捡道具\n💡 油渍先喷清洁剂 | 面粉先滑行擦 | 糖浆减速 | 水渍加速 | 锅盖可推挡蒸汽', {
            fontSize: '14px',
            fill: '#e0e0e0',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setScrollFactor(0).setDepth(201).setOrigin(0.5);

    scene.menuTexts = [title, desc, featuresText, startText, controlsText];
}

function hideMenu() {
    menuGraphics.clear();
    let scene = game.scene.scenes[0];
    if (scene.menuTexts) {
        scene.menuTexts.forEach(t => t.setVisible(false));
    }
}

function startGame() {
    hideMenu();
    gameOverText.setVisible(false);
    finalScoreText.setVisible(false);

    score = 0;
    timeLeft = 90;
    level = 1;
    gameState = 'playing';
    playerVelocity = new Phaser.Math.Vector2();

    clearLevel();
    drawKitchenBackground();
    createLevel(level);
    createPlayer();
    updateUI();
}

function clearLevel() {
    stains.forEach(s => s.destroy());
    stains = [];
    sponges.forEach(s => { s.destroy(); });
    sponges = [];
    hotPans.forEach(p => p.destroy());
    hotPans = [];
    potLids.forEach(l => l.destroy());
    potLids = [];
    steamBursts.forEach(s => s.destroy());
    steamBursts = [];
    waterStreams.forEach(w => w.destroy());
    waterStreams = [];
    crumbs.forEach(c => c.destroy());
    crumbs = [];
    collectPoints.forEach(c => c.destroy());
    collectPoints = [];
    fragileDishes.forEach(d => d.destroy());
    fragileDishes = [];
    drippingFaucets.forEach(f => f.destroy());
    drippingFaucets = [];
    soapBubbles.forEach(b => b.destroy());
    soapBubbles = [];
    utensils.forEach(u => u.destroy());
    utensils = [];
    utensilRacks.forEach(r => r.destroy());
    utensilRacks = [];
    droppedItems.forEach(i => i.destroy());
    droppedItems = [];
    sprayParticles.forEach(p => p.destroy());
    sprayParticles = [];

    combo = 0;
    comboTimer = 0;
    heldItem = null;
    onSyrup = false;
    onWaterStain = false;
    onFlour = false;

    if (player) player.destroy();
    if (backgroundGraphics) backgroundGraphics.clear();
    if (comboText) comboText.setText('');
    if (stainTypeText) stainTypeText.setText('');
}

function createLevel(levelNum) {
    let numStains = 8 + levelNum * 3;
    let numHotPans = 2 + Math.floor(levelNum / 2);
    let numWaterStreams = 2 + Math.floor(levelNum / 3);
    let numCrumbs = 6 + levelNum * 2;
    let numFragile = 2 + levelNum;
    let numFaucets = 1 + Math.floor(levelNum / 2);
    let numSponges = 2;
    let numPotLids = Math.max(1, Math.floor(levelNum / 2));

    let counterLeft = 80;
    let counterRight = GAME_WIDTH - 80;
    let counterTop = 120;
    let counterBottom = GAME_HEIGHT - 120;

    let stainTypes = [STAIN_NORMAL, STAIN_STUBBORN, STAIN_OIL, STAIN_SYRUP, STAIN_FLOUR, STAIN_WATER];
    let stainWeights = [25, 15, 20, 15, 15, 10];

    for (let i = 0; i < numStains; i++) {
        let x = Phaser.Math.Between(counterLeft + 50, counterRight - 50);
        let y = Phaser.Math.Between(counterTop + 50, counterBottom - 50);
        let size = Phaser.Math.Between(35, 65);
        let type = getWeightedRandom(stainTypes, stainWeights);
        createStain(x, y, size, type);
    }

    for (let i = 0; i < numSponges; i++) {
        let x = Phaser.Math.Between(counterLeft + 80, counterRight - 80);
        let y = Phaser.Math.Between(counterTop + 80, counterBottom - 80);
        createSponge(x, y);
    }

    for (let i = 0; i < numHotPans; i++) {
        let x = Phaser.Math.Between(counterLeft + 120, counterRight - 120);
        let y = Phaser.Math.Between(counterTop + 120, counterBottom - 120);
        createHotPan(x, y);
    }

    for (let i = 0; i < numPotLids; i++) {
        let x = Phaser.Math.Between(counterLeft + 100, counterRight - 100);
        let y = Phaser.Math.Between(counterTop + 100, counterBottom - 100);
        createPotLid(x, y);
    }

    for (let i = 0; i < numWaterStreams; i++) {
        let x = Phaser.Math.Between(counterLeft + 100, counterRight - 100);
        let y = Phaser.Math.Between(counterTop + 100, counterBottom - 100);
        let horizontal = Math.random() < 0.5;
        createWaterStream(x, y, horizontal);
    }

    for (let i = 0; i < numCrumbs; i++) {
        let x = Phaser.Math.Between(counterLeft + 50, counterRight - 50);
        let y = Phaser.Math.Between(counterTop + 50, counterBottom - 50);
        createCrumb(x, y);
    }

    for (let i = 0; i < 2; i++) {
        let x = i === 0 ? counterLeft + 30 : counterRight - 30;
        let y = Phaser.Math.Between(counterTop + 100, counterBottom - 100);
        createCollectPoint(x, y);
    }

    for (let i = 0; i < numFragile; i++) {
        let x = Phaser.Math.Between(counterLeft + 80, counterRight - 80);
        let y = Phaser.Math.Between(counterTop + 80, counterBottom - 80);
        createFragileDish(x, y);
    }

    for (let i = 0; i < numFaucets; i++) {
        let x = Phaser.Math.Between(counterLeft + 100, counterRight - 100);
        let y = counterTop + 30;
        createDrippingFaucet(x, y);
    }

    for (let i = 0; i < 2; i++) {
        let rackX = i === 0 ? counterLeft + 80 : counterRight - 80;
        let rackY = counterBottom - 40;
        createUtensilRack(rackX, rackY);
    }

    for (let i = 0; i < 6; i++) {
        let x = Phaser.Math.Between(counterLeft + 60, counterRight - 60);
        let y = Phaser.Math.Between(counterTop + 60, counterBottom - 100);
        createUtensil(x, y);
    }

    for (let i = 0; i < 15; i++) {
        let x = Phaser.Math.Between(counterLeft + 30, counterRight - 30);
        let y = Phaser.Math.Between(counterTop + 30, counterBottom - 30);
        createSoapBubble(x, y);
    }

    levelTotalStains = stains.length;
    levelTotalCrumbs = crumbs.length;
    levelTotalFaucets = drippingFaucets.length;
    levelTotalUtensils = utensils.length;
    levelTotalDishes = fragileDishes.length;
    levelTotalPots = hotPans.length;
}

function getWeightedRandom(items, weights) {
    let total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) return items[i];
    }
    return items[0];
}

function drawKitchenBackground() {
    let graphics = backgroundGraphics;
    graphics.clear();

    graphics.fillStyle(0x8d6e63, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    graphics.fillStyle(0xbcaaa4, 1);
    graphics.fillRect(40, 80, GAME_WIDTH - 80, GAME_HEIGHT - 160);

    let tileSize = 60;
    graphics.lineStyle(1, 0x9e9e9e, 0.3);
    for (let x = 40; x < GAME_WIDTH - 40; x += tileSize) {
        graphics.beginPath();
        graphics.moveTo(x, 80);
        graphics.lineTo(x, GAME_HEIGHT - 80);
        graphics.strokePath();
    }
    for (let y = 80; y < GAME_HEIGHT - 80; y += tileSize) {
        graphics.beginPath();
        graphics.moveTo(40, y);
        graphics.lineTo(GAME_WIDTH - 40, y);
        graphics.strokePath();
    }

    graphics.fillStyle(0x6d4c41, 1);
    graphics.fillRect(40, 60, GAME_WIDTH - 80, 30);
    graphics.fillRect(40, GAME_HEIGHT - 90, GAME_WIDTH - 80, 30);

    graphics.fillStyle(0x5d4037, 1);
    graphics.fillRect(0, 0, GAME_WIDTH, 60);

    graphics.fillStyle(0x90a4ae, 1);
    for (let x = 0; x < GAME_WIDTH; x += 80) {
        for (let y = 0; y < 60; y += 30) {
            graphics.fillRect(x + (y % 60 === 0 ? 0 : 40), y, 78, 28);
        }
    }

    graphics.fillStyle(0x3e2723, 1);
    graphics.fillRect(0, GAME_HEIGHT - 60, GAME_WIDTH, 60);

    graphics.fillStyle(0x5d4037, 1);
    for (let x = 0; x < GAME_WIDTH; x += 100) {
        graphics.fillRect(x + 10, GAME_HEIGHT - 50, 80, 40);
    }

    graphics.fillStyle(0x4fc3f7, 0.15);
    graphics.fillRect(GAME_WIDTH / 2 - 150, 100, 300, 200);
    graphics.lineStyle(4, 0x0288d1, 0.5);
    graphics.strokeRect(GAME_WIDTH / 2 - 150, 100, 300, 200);

    graphics.lineStyle(2, 0x0288d1, 0.3);
    graphics.beginPath();
    graphics.moveTo(GAME_WIDTH / 2, 100);
    graphics.lineTo(GAME_WIDTH / 2, 300);
    graphics.moveTo(GAME_WIDTH / 2 - 150, 200);
    graphics.lineTo(GAME_WIDTH / 2 + 150, 200);
    graphics.strokePath();
}

function createPlayer() {
    let scene = game.scene.scenes[0];

    player = scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    player.setDepth(50);
    player.radius = 20;

    let body = scene.add.graphics();
    body.fillStyle(0x4fc3f7, 1);
    body.fillCircle(0, 0, 20);
    body.lineStyle(3, 0x0288d1, 1);
    body.strokeCircle(0, 0, 20);

    let helmet = scene.add.graphics();
    helmet.fillStyle(0xffeb3b, 1);
    helmet.fillEllipse(0, -18, 24, 14);
    helmet.lineStyle(2, 0xf9a825, 1);
    helmet.strokeEllipse(0, -18, 24, 14);

    let eye1 = scene.add.graphics();
    eye1.fillStyle(0xffffff, 1);
    eye1.fillCircle(-7, -5, 6);
    eye1.fillStyle(0x000000, 1);
    eye1.fillCircle(-5, -5, 3);

    let eye2 = scene.add.graphics();
    eye2.fillStyle(0xffffff, 1);
    eye2.fillCircle(7, -5, 6);
    eye2.fillStyle(0x000000, 1);
    eye2.fillCircle(9, -5, 3);

    let smile = scene.add.graphics();
    smile.lineStyle(2, 0x000000, 1);
    smile.beginPath();
    smile.arc(0, 2, 6, 0.2, Math.PI - 0.2);
    smile.strokePath();

    let sprayNozzle = scene.add.graphics();
    sprayNozzle.fillStyle(0x607d8b, 1);
    sprayNozzle.fillRect(15, -5, 12, 10);
    sprayNozzle.fillStyle(0x455a64, 1);
    sprayNozzle.fillRect(25, -3, 6, 6);

    player.add([body, helmet, eye1, eye2, smile, sprayNozzle]);
    player.bodyGraphics = body;
    player.sprayNozzle = sprayNozzle;

    player.direction = new Phaser.Math.Vector2(1, 0);
    player.vx = 0;
    player.vy = 0;
}

function createStain(x, y, size, type) {
    let scene = game.scene.scenes[0];
    let stain = scene.add.container(x, y);
    stain.setDepth(5);

    let colorInfo = STAIN_COLORS[type] || STAIN_COLORS[STAIN_NORMAL];
    let graphics = scene.add.graphics();

    graphics.fillStyle(colorInfo.fill, colorInfo.alpha);
    for (let i = 0; i < 5; i++) {
        let angle = (Math.PI * 2 / 5) * i + Math.random() * 0.5;
        let dist = size * 0.3 + Math.random() * size * 0.4;
        let blobSize = size * 0.4 + Math.random() * size * 0.3;
        graphics.fillCircle(Math.cos(angle) * dist, Math.sin(angle) * dist, blobSize);
    }
    graphics.fillCircle(0, 0, size * 0.5);

    if (type === STAIN_OIL) {
        let shine = scene.add.graphics();
        shine.fillStyle(0xffffff, 0.3);
        for (let i = 0; i < 3; i++) {
            let angle = Math.random() * Math.PI * 2;
            let dist = size * 0.2 + Math.random() * size * 0.2;
            shine.fillEllipse(Math.cos(angle) * dist, Math.sin(angle) * dist, 8, 4, angle);
        }
        stain.add(shine);
    }

    if (type === STAIN_SYRUP) {
        let bubble = scene.add.graphics();
        bubble.fillStyle(0xfff176, 0.6);
        for (let i = 0; i < 4; i++) {
            let angle = Math.random() * Math.PI * 2;
            let dist = size * 0.1 + Math.random() * size * 0.3;
            bubble.fillCircle(Math.cos(angle) * dist, Math.sin(angle) * dist, 4 + Math.random() * 4);
        }
        stain.add(bubble);
    }

    if (type === STAIN_FLOUR) {
        let powder = scene.add.graphics();
        powder.fillStyle(0xffffff, 0.8);
        for (let i = 0; i < 8; i++) {
            let angle = Math.random() * Math.PI * 2;
            let dist = size * 0.1 + Math.random() * size * 0.35;
            powder.fillCircle(Math.cos(angle) * dist, Math.sin(angle) * dist, 2 + Math.random() * 3);
        }
        stain.add(powder);
    }

    if (type === STAIN_WATER) {
        let ripple = scene.add.graphics();
        ripple.lineStyle(1.5, 0xffffff, 0.4);
        for (let i = 0; i < 3; i++) {
            ripple.strokeCircle(0, 0, size * 0.3 + i * size * 0.15);
        }
        stain.add(ripple);
    }

    let labelText = '';
    let labelColor = '#ffffff';
    if (type === STAIN_STUBBORN) {
        labelText = '顽固!';
        labelColor = '#ff5722';
        let highlight = scene.add.graphics();
        highlight.lineStyle(2, 0xff5722, 0.8);
        highlight.strokeCircle(0, 0, size * 0.7);
        stain.add(highlight);
    } else if (type === STAIN_OIL) {
        labelText = '油渍';
        labelColor = '#8d6e63';
    } else if (type === STAIN_SYRUP) {
        labelText = '糖浆';
        labelColor = '#fbc02d';
    } else if (type === STAIN_FLOUR) {
        labelText = '面粉';
        labelColor = '#90a4ae';
    } else if (type === STAIN_WATER) {
        labelText = '水渍';
        labelColor = '#4fc3f7';
    }

    if (labelText) {
        let warning = scene.add.text(0, -size - 10, labelText, {
            fontSize: '12px',
            fill: labelColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        stain.add(warning);
        stain.warningText = warning;
    }

    stain.add(graphics);
    stain.graphics = graphics;
    stain.size = size;
    stain.type = type;
    stain.softened = false;
    stain.wetted = false;
    stain.expanded = false;

    let baseHealth = 1;
    if (type === STAIN_STUBBORN) baseHealth = 3;
    else if (type === STAIN_OIL) baseHealth = 2;
    else if (type === STAIN_SYRUP) baseHealth = 2;
    else if (type === STAIN_FLOUR) baseHealth = 2;

    stain.health = baseHealth;
    stain.maxHealth = baseHealth;

    stains.push(stain);
    return stain;
}

function createSponge(x, y) {
    let scene = game.scene.scenes[0];
    let sponge = scene.add.container(x, y);
    sponge.setDepth(30);
    sponge.radius = 25;

    let body = scene.add.graphics();
    body.fillStyle(0xffb74d, 1);
    body.fillRoundedRect(-25, -18, 50, 36, 8);
    body.lineStyle(2, 0xf57c00, 1);
    body.strokeRoundedRect(-25, -18, 50, 36, 8);

    let top = scene.add.graphics();
    top.fillStyle(0xffcc80, 1);
    top.fillRoundedRect(-22, -15, 44, 10, 4);

    let holes = scene.add.graphics();
    holes.fillStyle(0xe65100, 0.5);
    for (let i = 0; i < 6; i++) {
        let hx = -18 + (i % 3) * 18;
        let hy = -2 + Math.floor(i / 3) * 12;
        holes.fillCircle(hx, hy, 3);
    }

    sponge.add([body, top, holes]);
    sponge.vx = 0;
    sponge.vy = 0;

    sponges.push(sponge);
    return sponge;
}

function createHotPan(x, y) {
    let scene = game.scene.scenes[0];
    let pan = scene.add.container(x, y);
    pan.setDepth(20);
    pan.radius = 45;

    let panBody = scene.add.graphics();
    panBody.fillStyle(0x424242, 1);
    panBody.fillCircle(0, 0, 45);
    panBody.lineStyle(4, 0x212121, 1);
    panBody.strokeCircle(0, 0, 45);

    let inner = scene.add.graphics();
    inner.fillStyle(0x616161, 1);
    inner.fillCircle(0, 0, 38);

    let handle = scene.add.graphics();
    handle.fillStyle(0x5d4037, 1);
    handle.fillRoundedRect(40, -8, 50, 16, 4);
    handle.lineStyle(2, 0x3e2723, 1);
    handle.strokeRoundedRect(40, -8, 50, 16, 4);

    let heat = scene.add.graphics();
    heat.fillStyle(0xff5722, 0.6);
    heat.fillCircle(0, 0, 35);

    let flames = scene.add.graphics();
    flames.fillStyle(0xff9800, 0.8);
    for (let i = 0; i < 5; i++) {
        let angle = -Math.PI / 2 + (i - 2) * 0.3;
        let fx = Math.cos(angle) * 30;
        let fy = Math.sin(angle) * 30 - 10;
        flames.beginPath();
        flames.moveTo(fx - 4, fy + 10);
        flames.lineTo(fx, fy - 8);
        flames.lineTo(fx + 4, fy + 10);
        flames.fill();
    }

    let steamZone = scene.add.graphics();
    steamZone.fillStyle(0xffffff, 0);
    steamZone.fillCircle(0, 0, 80);

    let warning = scene.add.text(0, -60, '⚠ 热锅 ⚠', {
        fontSize: '14px',
        fill: '#ff5722',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    let timerText = scene.add.text(0, 60, '', {
        fontSize: '16px',
        fill: '#ff9800',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    pan.add([panBody, inner, handle, heat, flames, steamZone, warning, timerText]);
    pan.heat = heat;
    pan.flames = flames;
    pan.steamZone = steamZone;
    pan.warningText = warning;
    pan.timerText = timerText;
    pan.steamTimer = 0;
    pan.steamInterval = Phaser.Math.Between(4, 7);
    pan.steamDuration = 2;
    pan.isSteaming = false;
    pan.steamParticles = [];

    scene.tweens.add({
        targets: heat,
        alpha: { from: 0.4, to: 0.8 },
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    hotPans.push(pan);
    return pan;
}

function createPotLid(x, y) {
    let scene = game.scene.scenes[0];
    let lid = scene.add.container(x, y);
    lid.setDepth(25);
    lid.radius = 40;

    let lidBody = scene.add.graphics();
    lidBody.fillStyle(0x78909c, 1);
    lidBody.fillCircle(0, 0, 40);
    lidBody.lineStyle(3, 0x455a64, 1);
    lidBody.strokeCircle(0, 0, 40);

    let lidTop = scene.add.graphics();
    lidTop.fillStyle(0x90a4ae, 1);
    lidTop.fillCircle(0, 0, 32);

    let handle = scene.add.graphics();
    handle.fillStyle(0xff9800, 1);
    handle.fillCircle(0, 0, 10);
    handle.lineStyle(2, 0xf57c00, 1);
    handle.strokeCircle(0, 0, 10);

    let shine = scene.add.graphics();
    shine.fillStyle(0xffffff, 0.4);
    shine.beginPath();
    shine.arc(-15, -15, 12, 0, Math.PI);
    shine.fill();

    let label = scene.add.text(0, 55, '锅盖 (可推动)', {
        fontSize: '12px',
        fill: '#90a4ae',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    lid.add([lidBody, lidTop, handle, shine, label]);
    lid.vx = 0;
    lid.vy = 0;
    lid.isBarrier = false;
    lid.barrierTimer = 0;

    potLids.push(lid);
    return lid;
}

function createSteamBurst(pan) {
    let scene = game.scene.scenes[0];
    let steam = scene.add.container(pan.x, pan.y);
    steam.setDepth(15);

    let particles = [];
    for (let i = 0; i < 15; i++) {
        let particle = scene.add.graphics();
        let size = Phaser.Math.Between(15, 30);
        particle.fillStyle(0xffffff, 0.4);
        particle.fillCircle(0, 0, size);
        particle.alpha = 0;
        particle.baseSize = size;
        particles.push(particle);
        steam.add(particle);
    }

    steam.particles = particles;
    steam.radius = 80;
    steam.duration = 2;
    steam.life = 2;
    steam.pan = pan;

    scene.tweens.add({
        targets: steam,
        scaleX: { from: 0.5, to: 1.2 },
        scaleY: { from: 0.5, to: 1.2 },
        duration: 2000,
        ease: 'Cubic.easeOut'
    });

    steamBursts.push(steam);
    return steam;
}

function updateHotPans(dt) {
    for (let pan of hotPans) {
        pan.steamTimer += dt;

        if (pan.isSteaming) {
            let timeLeft = pan.steamDuration - (pan.steamTimer % pan.steamInterval);
            if (pan.timerText) {
                pan.timerText.setText(`蒸汽中 ${timeLeft.toFixed(1)}s`);
                pan.timerText.setFill('#4fc3f7');
            }

            if (pan.steamTimer >= pan.steamDuration) {
                pan.isSteaming = false;
                pan.steamTimer = 0;
                if (pan.steamZone) {
                    pan.steamZone.fillStyle(0xffffff, 0);
                    pan.steamZone.clear();
                    pan.steamZone.fillStyle(0xffffff, 0);
                    pan.steamZone.fillCircle(0, 0, 80);
                }
            }
        } else {
            let timeToSteam = pan.steamInterval - pan.steamTimer;
            if (pan.timerText) {
                if (timeToSteam <= 1.5) {
                    pan.timerText.setText(`⚠ 即将喷汽 ${timeToSteam.toFixed(1)}s`);
                    pan.timerText.setFill('#ff5722');
                } else {
                    pan.timerText.setText(`下一次喷汽 ${timeToSteam.toFixed(1)}s`);
                    pan.timerText.setFill('#ff9800');
                }
            }

            if (timeToSteam <= 0) {
                pan.isSteaming = true;
                pan.steamTimer = 0;
                createSteamBurst(pan);

                if (pan.steamZone) {
                    pan.steamZone.fillStyle(0xffffff, 0.25);
                    pan.steamZone.clear();
                    pan.steamZone.fillStyle(0xffffff, 0.25);
                    pan.steamZone.fillCircle(0, 0, 80);
                }

                if (pan.warningText) {
                    pan.warningText.setText('💨 蒸汽! 💨');
                    pan.warningText.setFill('#4fc3f7');
                }

                let scene = game.scene.scenes[0];
                scene.time.delayedCall(2000, () => {
                    if (pan.warningText && pan.active) {
                        pan.warningText.setText('⚠ 热锅 ⚠');
                        pan.warningText.setFill('#ff5722');
                    }
                });
            }
        }
    }
}

function updateSteamBursts(dt) {
    for (let i = steamBursts.length - 1; i >= 0; i--) {
        let steam = steamBursts[i];
        steam.life -= dt;

        let alpha = steam.life / steam.duration;
        for (let j = 0; j < steam.particles.length; j++) {
            let particle = steam.particles[j];
            particle.alpha = alpha * 0.5;
            let offset = (steam.duration - steam.life) * 50;
            particle.x = Math.cos(j * 0.8) * offset;
            particle.y = Math.sin(j * 0.8) * offset - (steam.duration - steam.life) * 30;
            particle.scaleX = 1 + (steam.duration - steam.life) * 0.5;
            particle.scaleY = 1 + (steam.duration - steam.life) * 0.5;
        }

        if (steam.life <= 0) {
            steam.destroy();
            steamBursts.splice(i, 1);
        }
    }
}

function updatePotLids(dt) {
    for (let lid of potLids) {
        lid.x += lid.vx * dt;
        lid.y += lid.vy * dt;
        lid.vx *= 0.9;
        lid.vy *= 0.9;

        if (lid.isBarrier) {
            lid.barrierTimer -= dt;
            if (lid.barrierTimer <= 0) {
                lid.isBarrier = false;
            }
        }

        let counterLeft = 80;
        let counterRight = GAME_WIDTH - 80;
        let counterTop = 120;
        let counterBottom = GAME_HEIGHT - 120;

        if (lid.x < counterLeft + 40) {
            lid.x = counterLeft + 40;
            lid.vx *= -0.5;
        }
        if (lid.x > counterRight - 40) {
            lid.x = counterRight - 40;
            lid.vx *= -0.5;
        }
        if (lid.y < counterTop + 40) {
            lid.y = counterTop + 40;
            lid.vy *= -0.5;
        }
        if (lid.y > counterBottom - 40) {
            lid.y = counterBottom - 40;
            lid.vy *= -0.5;
        }
    }
}

function createWaterStream(x, y, horizontal) {
    let scene = game.scene.scenes[0];
    let stream = scene.add.container(x, y);
    stream.setDepth(10);

    let length = 200;
    let width = 40;

    let water = scene.add.graphics();
    water.fillStyle(0x4fc3f7, 0.6);
    if (horizontal) {
        water.fillRoundedRect(-length / 2, -width / 2, length, width, width / 2);
    } else {
        water.fillRoundedRect(-width / 2, -length / 2, width, length, width / 2);
    }

    let highlights = scene.add.graphics();
    highlights.fillStyle(0xffffff, 0.4);
    for (let i = 0; i < 5; i++) {
        if (horizontal) {
            highlights.fillRoundedRect(-length / 2 + i * 45, -width / 4, 20, width / 2, 5);
        } else {
            highlights.fillRoundedRect(-width / 4, -length / 2 + i * 45, width / 2, 20, 5);
        }
    }

    let arrow = scene.add.graphics();
    arrow.fillStyle(0x0288d1, 0.8);
    if (horizontal) {
        arrow.beginPath();
        arrow.moveTo(length / 2 - 20, -10);
        arrow.lineTo(length / 2 - 5, 0);
        arrow.lineTo(length / 2 - 20, 10);
        arrow.fill();
    } else {
        arrow.beginPath();
        arrow.moveTo(-10, length / 2 - 20);
        arrow.lineTo(0, length / 2 - 5);
        arrow.lineTo(10, length / 2 - 20);
        arrow.fill();
    }

    stream.add([water, highlights, arrow]);
    stream.water = water;
    stream.highlights = highlights;
    stream.horizontal = horizontal;
    stream.length = length;
    stream.width = width;

    scene.tweens.add({
        targets: highlights,
        x: horizontal ? 15 : 0,
        y: horizontal ? 0 : 15,
        duration: 300,
        yoyo: true,
        repeat: -1
    });

    waterStreams.push(stream);
    return stream;
}

function createCrumb(x, y) {
    let scene = game.scene.scenes[0];
    let crumb = scene.add.container(x, y);
    crumb.setDepth(8);
    crumb.radius = 12;

    let graphics = scene.add.graphics();
    graphics.fillStyle(0x8d6e63, 1);

    let numPieces = Phaser.Math.Between(2, 4);
    for (let i = 0; i < numPieces; i++) {
        let angle = Math.random() * Math.PI * 2;
        let dist = Math.random() * 8;
        let size = 4 + Math.random() * 6;
        graphics.fillCircle(Math.cos(angle) * dist, Math.sin(angle) * dist, size);
    }

    crumb.add(graphics);
    crumb.graphics = graphics;
    crumb.collected = false;
    crumb.vx = 0;
    crumb.vy = 0;

    crumbs.push(crumb);
    return crumb;
}

function createCollectPoint(x, y) {
    let scene = game.scene.scenes[0];
    let point = scene.add.container(x, y);
    point.setDepth(3);
    point.radius = 35;

    let base = scene.add.graphics();
    base.fillStyle(0x37474f, 1);
    base.fillCircle(0, 0, 35);

    let inner = scene.add.graphics();
    inner.fillStyle(0x263238, 1);
    inner.fillCircle(0, 0, 28);

    let swirl = scene.add.graphics();
    swirl.lineStyle(3, 0x546e7a, 0.8);
    swirl.beginPath();
    for (let i = 0; i < 3; i++) {
        let r = 22 - i * 6;
        swirl.arc(0, 0, r, i * 0.5, Math.PI * 1.5 + i * 0.5);
    }
    swirl.strokePath();

    let label = scene.add.text(0, 50, '收集口', {
        fontSize: '14px',
        fill: '#4fc3f7',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    point.add([base, inner, swirl, label]);
    point.swirl = swirl;

    scene.tweens.add({
        targets: swirl,
        rotation: Math.PI * 2,
        duration: 3000,
        repeat: -1
    });

    collectPoints.push(point);
    return point;
}

function createFragileDish(x, y) {
    let scene = game.scene.scenes[0];
    let dish = scene.add.container(x, y);
    dish.setDepth(25);
    dish.radius = 35;

    let plate = scene.add.graphics();
    plate.fillStyle(0xffffff, 1);
    plate.fillEllipse(0, 0, 70, 70);
    plate.lineStyle(3, 0x90a4ae, 1);
    plate.strokeEllipse(0, 0, 70, 70);

    let inner = scene.add.graphics();
    inner.fillStyle(0xeceff1, 1);
    inner.fillEllipse(0, 0, 50, 50);

    let pattern = scene.add.graphics();
    pattern.fillStyle(0x4fc3f7, 0.6);
    for (let i = 0; i < 5; i++) {
        let angle = (Math.PI * 2 / 5) * i;
        let px = Math.cos(angle) * 15;
        let py = Math.sin(angle) * 15;
        pattern.fillCircle(px, py, 4);
    }

    let cup = scene.add.graphics();
    cup.fillStyle(0x90caf9, 1);
    cup.fillRoundedRect(-12, -20, 24, 20, 4);
    cup.lineStyle(2, 0x42a5f5, 1);
    cup.strokeRoundedRect(-12, -20, 24, 20, 4);

    let handle = scene.add.graphics();
    handle.lineStyle(3, 0x42a5f5, 1);
    handle.beginPath();
    handle.arc(12, -10, 6, -Math.PI / 2, Math.PI / 2);
    handle.strokePath();

    let warning = scene.add.text(0, -50, '易碎!', {
        fontSize: '12px',
        fill: '#e91e63',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    dish.add([plate, inner, pattern, cup, handle, warning]);
    dish.plate = plate;
    dish.broken = false;
    dish.warningText = warning;

    fragileDishes.push(dish);
    return dish;
}

function createDrippingFaucet(x, y) {
    let scene = game.scene.scenes[0];
    let faucet = scene.add.container(x, y);
    faucet.setDepth(35);
    faucet.radius = 30;

    let base = scene.add.graphics();
    base.fillStyle(0x90a4ae, 1);
    base.fillRoundedRect(-20, -30, 40, 35, 5);
    base.lineStyle(2, 0x546e7a, 1);
    base.strokeRoundedRect(-20, -30, 40, 35, 5);

    let spout = scene.add.graphics();
    spout.fillStyle(0xb0bec5, 1);
    spout.fillRoundedRect(-8, 0, 16, 25, 3);
    spout.lineStyle(2, 0x546e7a, 1);
    spout.strokeRoundedRect(-8, 0, 16, 25, 3);

    let handle = scene.add.graphics();
    handle.fillStyle(0x78909c, 1);
    handle.fillCircle(0, -25, 12);
    handle.fillStyle(0x455a64, 1);
    handle.fillRect(-2, -35, 4, 15);

    let drop = scene.add.graphics();
    drop.fillStyle(0x4fc3f7, 0.8);
    drop.fillCircle(0, 40, 10);
    drop.fillEllipse(0, 32, 6, 12);

    let label = scene.add.text(0, -55, '滴水！按E关闭', {
        fontSize: '12px',
        fill: '#4fc3f7',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    faucet.add([base, spout, handle, drop, label]);
    faucet.drop = drop;
    faucet.label = label;
    faucet.dripping = true;
    faucet.handle = handle;

    faucet.dripTween = scene.tweens.add({
        targets: drop,
        y: 20,
        alpha: { from: 0.8, to: 0 },
        duration: 1000,
        yoyo: false,
        repeat: -1
    });

    drippingFaucets.push(faucet);
    return faucet;
}

function createUtensil(x, y) {
    let scene = game.scene.scenes[0];
    let utensil = scene.add.container(x, y);
    utensil.setDepth(15);
    utensil.radius = 15;

    let type = Phaser.Math.Between(0, 2);
    let graphics = scene.add.graphics();

    if (type === 0) {
        graphics.fillStyle(0xb0bec5, 1);
        graphics.fillRoundedRect(-4, -30, 8, 60, 2);
        graphics.fillStyle(0x78909c, 1);
        graphics.beginPath();
        graphics.moveTo(-8, 25);
        graphics.lineTo(0, 35);
        graphics.lineTo(8, 25);
        graphics.lineTo(8, 20);
        graphics.lineTo(-8, 20);
        graphics.fill();
    } else if (type === 1) {
        graphics.fillStyle(0xcfd8dc, 1);
        graphics.fillRoundedRect(-5, -25, 10, 50, 3);
        graphics.fillStyle(0xffcc80, 1);
        graphics.fillRoundedRect(-8, 15, 16, 20, 4);
    } else {
        graphics.fillStyle(0xffb74d, 1);
        graphics.fillRoundedRect(-6, -20, 12, 40, 4);
        graphics.fillStyle(0xf57c00, 1);
        for (let i = 0; i < 3; i++) {
            graphics.fillCircle(-12 + i * 12, -18, 4);
        }
    }

    utensil.add(graphics);
    utensil.graphics = graphics;
    utensil.vx = 0;
    utensil.vy = 0;
    utensil.organized = false;

    utensils.push(utensil);
    return utensil;
}

function createSoapBubble(x, y) {
    let scene = game.scene.scenes[0];
    let bubble = scene.add.container(x, y);
    bubble.setDepth(12);

    let size = 10 + Math.random() * 15;
    let graphics = scene.add.graphics();

    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillCircle(0, 0, size);
    graphics.lineStyle(1.5, 0x4fc3f7, 0.6);
    graphics.strokeCircle(0, 0, size);

    let shine = scene.add.graphics();
    shine.fillStyle(0xffffff, 0.8);
    shine.fillCircle(-size * 0.3, -size * 0.3, size * 0.2);

    bubble.add([graphics, shine]);
    bubble.size = size;
    bubble.bobOffset = Math.random() * Math.PI * 2;
    bubble.bobSpeed = 1 + Math.random() * 2;
    bubble.baseY = y;
    bubble.baseX = x;

    soapBubbles.push(bubble);
    return bubble;
}

function createUtensilRack(x, y) {
    let scene = game.scene.scenes[0];
    let rack = scene.add.container(x, y);
    rack.setDepth(4);
    rack.radius = 45;

    let base = scene.add.graphics();
    base.fillStyle(0x607d8b, 1);
    base.fillRoundedRect(-55, -35, 110, 70, 8);
    base.lineStyle(3, 0x455a64, 1);
    base.strokeRoundedRect(-55, -35, 110, 70, 8);

    let inner = scene.add.graphics();
    inner.fillStyle(0x37474f, 1);
    inner.fillRoundedRect(-48, -28, 96, 56, 5);

    let slots = scene.add.graphics();
    slots.lineStyle(1, 0x546e7a, 0.6);
    for (let i = 0; i < 4; i++) {
        let sx = -40 + i * 27;
        slots.strokeRect(sx, -22, 22, 44);
    }

    let glow = scene.add.graphics();
    glow.fillStyle(0x4caf50, 0);
    glow.fillRoundedRect(-55, -35, 110, 70, 8);

    let label = scene.add.text(0, 50, '餐具架', {
        fontSize: '14px',
        fill: '#81c784',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    let countLabel = scene.add.text(0, -50, '0/3', {
        fontSize: '14px',
        fill: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
    }).setOrigin(0.5);

    rack.add([base, inner, slots, glow, label, countLabel]);
    rack.glow = glow;
    rack.countLabel = countLabel;
    rack.storedCount = 0;
    rack.capacity = 3;

    utensilRacks.push(rack);
    return rack;
}

function setUtensilOrganized(utensil, rack) {
    utensil.organized = true;
    utensil.vx = 0;
    utensil.vy = 0;

    let offsetIndex = rack.storedCount;
    let offsets = [
        { x: -28, y: 0 }, { x: 0, y: 0 }, { x: 28, y: 0 }
    ];
    let offset = offsets[offsetIndex] || { x: 0, y: 0 };

    let scene = game.scene.scenes[0];
    scene.tweens.add({
        targets: utensil,
        x: rack.x + offset.x,
        y: rack.y + offset.y,
        rotation: 0,
        scaleX: 0.85,
        scaleY: 0.85,
        duration: 250,
        ease: 'Cubic.easeOut'
    });

    rack.storedCount++;
    rack.countLabel.setText(rack.storedCount + '/' + rack.capacity);

    if (rack.storedCount >= rack.capacity) {
        scene.tweens.add({
            targets: rack.glow,
            alpha: 0.25,
            duration: 400,
            yoyo: true,
            repeat: 1
        });
        rack.countLabel.setFill('#a5d6a7');
    }

    score += 8;
    createScorePopup(utensil.x, utensil.y - 20, '+8');
}

function update(time, delta) {
    if (gameState !== 'playing') {
        if (gameState === 'menu' && Phaser.Input.Keyboard.JustDown(keys.ENTER)) {
            startGame();
        }
        if (gameState === 'gameover' && Phaser.Input.Keyboard.JustDown(keys.ENTER)) {
            startGame();
        }
        return;
    }

    let dt = delta / 1000;

    updatePlayer(dt);
    updateSpray(dt);
    updateSponges(dt);
    updateCrumbs(dt);
    updateUtensils(dt);
    updateHotPans(dt);
    updateSteamBursts(dt);
    updatePotLids(dt);
    updateDroppedItems(dt);
    updateCollisions(dt);
    updateSoapBubbles(time);
    updateUI();

    checkLevelComplete();
}

function updatePlayer(dt) {
    let input = new Phaser.Math.Vector2(0, 0);

    if (keys.W.isDown || cursors.up.isDown) input.y -= 1;
    if (keys.S.isDown || cursors.down.isDown) input.y += 1;
    if (keys.A.isDown || cursors.left.isDown) input.x -= 1;
    if (keys.D.isDown || cursors.right.isDown) input.x += 1;

    if (input.length() > 0) {
        input.normalize();
        player.direction.copy(input);
    }

    let currentSpeed = PLAYER_SPEED;

    if (onWaterStream) {
        currentSpeed = WATER_BOOST_SPEED;
    }

    if (syrupSlowTimer > 0) {
        syrupSlowTimer -= dt;
        currentSpeed = SYRUP_SLOW_SPEED;
    }

    if (onWaterStain && !isSliding) {
        currentSpeed = PLAYER_SPEED * 1.2;
    }

    if (isSliding && slideTimer > 0) {
        slideTimer -= dt;
        if (onWaterStain) {
            currentSpeed = WATER_STAIN_SLIDE_SPEED;
        } else {
            currentSpeed = PLAYER_SLIDE_SPEED;
        }
        player.vx = slideDirection.x * currentSpeed;
        player.vy = slideDirection.y * currentSpeed;
    } else if (Phaser.Input.Keyboard.JustDown(keys.SHIFT) && input.length() > 0) {
        isSliding = true;
        slideTimer = 0.5;
        slideDirection.copy(input).normalize();
        createSlideEffect();
    } else {
        player.vx = input.x * currentSpeed;
        player.vy = input.y * currentSpeed;
    }

    if (slideTimer <= 0) {
        isSliding = false;
    }

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    let targetAngle = Math.atan2(player.direction.y, player.direction.x);
    player.rotation = Phaser.Math.Linear(player.rotation, targetAngle, 0.2);

    if (invincible) {
        invincibleTimer -= dt;
        player.alpha = Math.sin(invincibleTimer * 20) > 0 ? 1 : 0.3;
        if (invincibleTimer <= 0) {
            invincible = false;
            player.alpha = 1;
        }
    }

    if (waterBoostTimer > 0) {
        waterBoostTimer -= dt;
        if (waterBoostTimer <= 0) {
            onWaterStream = false;
        }
    }

    if (comboTimer > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0 && combo > 0) {
            combo = 0;
            if (comboText) comboText.setText('');
        }
    }

    let counterLeft = 80;
    let counterRight = GAME_WIDTH - 80;
    let counterTop = 120;
    let counterBottom = GAME_HEIGHT - 120;

    player.x = Phaser.Math.Clamp(player.x, counterLeft + 20, counterRight - 20);
    player.y = Phaser.Math.Clamp(player.y, counterTop + 20, counterBottom - 20);

    if (Phaser.Input.Keyboard.JustDown(keys.E)) {
        tryInteract();
    }

    checkSteamDaredevil();
}

function createSlideEffect() {
    let scene = game.scene.scenes[0];
    for (let i = 0; i < 5; i++) {
        let particle = scene.add.graphics();
        particle.fillStyle(0xffffff, 0.6);
        particle.fillCircle(0, 0, 4);
        particle.x = player.x;
        particle.y = player.y;
        particle.setDepth(40);

        scene.tweens.add({
            targets: particle,
            x: player.x - slideDirection.x * 30 - Math.random() * 20,
            y: player.y - slideDirection.y * 30 - Math.random() * 20,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 300,
            onComplete: () => particle.destroy()
        });
    }
}

function updateSpray(dt) {
    if (sprayCooldown > 0) {
        sprayCooldown -= dt;
    }

    if (Phaser.Input.Keyboard.JustDown(keys.SPACE) && sprayCooldown <= 0) {
        sprayCooldown = 0.3;
        createSprayParticles();
    }

    for (let i = sprayParticles.length - 1; i >= 0; i--) {
        let p = sprayParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.alpha = p.life / p.maxLife;
        p.scaleX = p.alpha;
        p.scaleY = p.alpha;

        if (p.life <= 0) {
            p.destroy();
            sprayParticles.splice(i, 1);
        }
    }
}

function createSprayParticles() {
    let scene = game.scene.scenes[0];

    for (let i = 0; i < 8; i++) {
        let particle = scene.add.graphics();
        particle.fillStyle(0x4fc3f7, 0.8);
        particle.fillCircle(0, 0, 6);
        particle.setDepth(45);

        let angle = player.direction.angle() + (Math.random() - 0.5) * 0.6;
        let speed = 400 + Math.random() * 200;

        particle.x = player.x + player.direction.x * 25;
        particle.y = player.y + player.direction.y * 25;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.life = 0.4;
        particle.maxLife = 0.4;

        sprayParticles.push(particle);
    }
}

function updateSponges(dt) {
    for (let sponge of sponges) {
        sponge.x += sponge.vx * dt;
        sponge.y += sponge.vy * dt;
        sponge.vx *= 0.92;
        sponge.vy *= 0.92;

        let counterLeft = 80;
        let counterRight = GAME_WIDTH - 80;
        let counterTop = 120;
        let counterBottom = GAME_HEIGHT - 120;

        if (sponge.x < counterLeft + 25) {
            sponge.x = counterLeft + 25;
            sponge.vx *= -0.5;
        }
        if (sponge.x > counterRight - 25) {
            sponge.x = counterRight - 25;
            sponge.vx *= -0.5;
        }
        if (sponge.y < counterTop + 25) {
            sponge.y = counterTop + 25;
            sponge.vy *= -0.5;
        }
        if (sponge.y > counterBottom - 25) {
            sponge.y = counterBottom - 25;
            sponge.vy *= -0.5;
        }
    }
}

function updateCrumbs(dt) {
    for (let crumb of crumbs) {
        if (crumb.collected) continue;
        crumb.x += crumb.vx * dt;
        crumb.y += crumb.vy * dt;
        crumb.vx *= 0.9;
        crumb.vy *= 0.9;
    }
}

function updateUtensils(dt) {
    for (let utensil of utensils) {
        if (utensil.organized) continue;
        utensil.x += utensil.vx * dt;
        utensil.y += utensil.vy * dt;
        utensil.vx *= 0.92;
        utensil.vy *= 0.92;
    }
}

function updateCollisions(dt) {
    onSyrup = false;
    onWaterStain = false;
    onFlour = false;
    let currentStainType = '';

    for (let i = stains.length - 1; i >= 0; i--) {
        let stain = stains[i];
        for (let j = sprayParticles.length - 1; j >= 0; j--) {
            let particle = sprayParticles[j];
            let dist = Phaser.Math.Distance.Between(particle.x, particle.y, stain.x, stain.y);
            if (dist < stain.size) {
                hitStain(stain, 0.3, true, false);
                particle.destroy();
                sprayParticles.splice(j, 1);
            }
        }

        let playerDist = Phaser.Math.Distance.Between(player.x, player.y, stain.x, stain.y);
        if (playerDist < stain.size + 15) {
            if (stain.type === STAIN_SYRUP) {
                onSyrup = true;
                syrupSlowTimer = 0.3;
                currentStainType = '糖浆黏住! 移动减速';
            }
            if (stain.type === STAIN_WATER) {
                onWaterStain = true;
                currentStainType = '水渍滑行! 速度提升';
            }
            if (stain.type === STAIN_FLOUR && !stain.wetted) {
                onFlour = true;
                currentStainType = '面粉! 滑行可擦除干粉';
            }

            if (isSliding) {
                if (stain.type === STAIN_FLOUR && !stain.wetted) {
                    stain.wetted = true;
                    if (stain.warningText) {
                        stain.warningText.setText('干粉已擦');
                        stain.warningText.setFill('#4caf50');
                    }
                    hitStain(stain, 0.5, false, true);
                } else {
                    hitStain(stain, 0.5, false, true);
                }
            }
        }
    }

    if (stainTypeText) {
        stainTypeText.setText(currentStainType);
    }

    for (let sponge of sponges) {
        let dist = Phaser.Math.Distance.Between(player.x, player.y, sponge.x, sponge.y);
        if (dist < 40) {
            let pushDir = new Phaser.Math.Vector2(sponge.x - player.x, sponge.y - player.y).normalize();
            sponge.vx = pushDir.x * 250;
            sponge.vy = pushDir.y * 250;

            for (let i = stains.length - 1; i >= 0; i--) {
                let stain = stains[i];
                let stainDist = Phaser.Math.Distance.Between(sponge.x, sponge.y, stain.x, stain.y);
                if (stainDist < stain.size + 25) {
                    hitStain(stain, 0.8, false, true);
                }
            }
        }
    }

    if (!invincible) {
        for (let pan of hotPans) {
            let dist = Phaser.Math.Distance.Between(player.x, player.y, pan.x, pan.y);
            if (dist < 50) {
                takeDamage(pan.x, pan.y, true);
                break;
            }
        }

        for (let steam of steamBursts) {
            let dist = Phaser.Math.Distance.Between(player.x, player.y, steam.x, steam.y);
            if (dist < 80) {
                hitBySteam(steam.x, steam.y);
                break;
            }
        }
    }

    for (let lid of potLids) {
        let dist = Phaser.Math.Distance.Between(player.x, player.y, lid.x, lid.y);
        if (dist < 50) {
            let pushDir = new Phaser.Math.Vector2(lid.x - player.x, lid.y - player.y).normalize();
            lid.vx = pushDir.x * 300;
            lid.vy = pushDir.y * 300;

            if (isSliding) {
                lid.isBarrier = true;
                lid.barrierTimer = 5;
                createScorePopup(lid.x, lid.y - 30, '锅盖形成屏障!');
            }

            for (let pan of hotPans) {
                let panDist = Phaser.Math.Distance.Between(lid.x, lid.y, pan.x, pan.y);
                if (panDist < 60) {
                    pan.steamInterval = Math.max(8, pan.steamInterval + 2);
                    createScorePopup(pan.x, pan.y - 50, '蒸汽被阻挡!');
                }
            }
        }

        if (lid.isBarrier) {
            for (let steam of steamBursts) {
                let steamDist = Phaser.Math.Distance.Between(lid.x, lid.y, steam.x, steam.y);
                if (steamDist < 70) {
                    steam.life = Math.min(steam.life, 0.3);
                }
            }
        }
    }

    onWaterStream = false;
    for (let stream of waterStreams) {
        let inStream = stream.horizontal ?
            (Math.abs(player.y - stream.y) < stream.width / 2 + 15 &&
                Math.abs(player.x - stream.x) < stream.length / 2) :
            (Math.abs(player.x - stream.x) < stream.width / 2 + 15 &&
                Math.abs(player.y - stream.y) < stream.length / 2);

        if (inStream) {
            onWaterStream = true;
            waterBoostTimer = 0.2;
            let pushForce = 200;
            if (stream.horizontal) {
                player.vx += pushForce * dt * 60;
            } else {
                player.vy += pushForce * dt * 60;
            }
        }
    }

    for (let i = crumbs.length - 1; i >= 0; i--) {
        let crumb = crumbs[i];
        if (crumb.collected) continue;

        for (let point of collectPoints) {
            let dist = Phaser.Math.Distance.Between(crumb.x, crumb.y, point.x, point.y);
            if (dist < 30) {
                collectCrumb(crumb);
                break;
            }
        }
    }

    for (let point of collectPoints) {
        let dist = Phaser.Math.Distance.Between(player.x, player.y, point.x, point.y);
        if (dist < 55) {
            for (let i = crumbs.length - 1; i >= 0; i--) {
                let crumb = crumbs[i];
                if (crumb.collected) continue;
                let crumbDist = Phaser.Math.Distance.Between(player.x, player.y, crumb.x, crumb.y);
                if (crumbDist < 120) {
                    let dir = new Phaser.Math.Vector2(point.x - crumb.x, point.y - crumb.y).normalize();
                    crumb.vx = dir.x * 350;
                    crumb.vy = dir.y * 350;
                }
            }
        }
    }

    if (!invincible) {
        for (let dish of fragileDishes) {
            if (dish.broken) continue;
            let dist = Phaser.Math.Distance.Between(player.x, player.y, dish.x, dish.y);
            if (dist < 40 && isSliding) {
                breakDish(dish);
                break;
            }
        }
    }

    for (let utensil of utensils) {
        if (utensil.organized) continue;
        let dist = Phaser.Math.Distance.Between(player.x, player.y, utensil.x, utensil.y);
        if (dist < 30) {
            let pushDir = new Phaser.Math.Vector2(utensil.x - player.x, utensil.y - player.y).normalize();
            utensil.vx = pushDir.x * 200;
            utensil.vy = pushDir.y * 200;
        }
    }

    for (let i = utensils.length - 1; i >= 0; i--) {
        let utensil = utensils[i];
        if (utensil.organized) continue;
        for (let rack of utensilRacks) {
            if (rack.storedCount >= rack.capacity) continue;
            let dist = Phaser.Math.Distance.Between(utensil.x, utensil.y, rack.x, rack.y);
            if (dist < 40) {
                setUtensilOrganized(utensil, rack);
                break;
            }
        }
    }
}

function hitStain(stain, damage, isSpray = false, isSliding = false) {
    if (stain.type === STAIN_OIL) {
        if (isSpray && !stain.softened) {
            stain.softened = true;
            if (stain.warningText) {
                stain.warningText.setText('已软化');
                stain.warningText.setFill('#4caf50');
            }
            createScorePopup(stain.x, stain.y - 20, '油渍已软化!');
            createCleanEffect(stain.x, stain.y);
            return;
        }
        if (!stain.softened) {
            createScorePopup(stain.x, stain.y - 20, '需要先喷清洁剂!');
            return;
        }
    }

    if (stain.type === STAIN_FLOUR) {
        if (isSpray && !stain.expanded) {
            expandFlourStain(stain);
            return;
        }
        if (!stain.wetted && !isSliding) {
            createScorePopup(stain.x, stain.y - 20, '先滑行擦去干粉!');
            return;
        }
    }

    stain.health -= damage;

    let newScale = stain.health / stain.maxHealth;
    stain.scaleX = 0.5 + newScale * 0.5;
    stain.scaleY = 0.5 + newScale * 0.5;

    if (stain.health <= 0) {
        cleanStain(stain);
    }

    createCleanEffect(stain.x, stain.y);
}

function expandFlourStain(stain) {
    stain.expanded = true;
    stain.wetted = true;
    stain.size *= 1.5;
    stain.maxHealth = 3;
    stain.health = 3;

    let scene = game.scene.scenes[0];
    scene.tweens.add({
        targets: stain,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 300,
        yoyo: false
    });

    if (stain.warningText) {
        stain.warningText.setText('遇水扩大!');
        stain.warningText.setFill('#ff9800');
    }

    createScorePopup(stain.x, stain.y - 20, '面粉遇水扩大了!');

    let newStains = [];
    for (let i = 0; i < 2; i++) {
        let angle = Math.random() * Math.PI * 2;
        let dist = stain.size * 0.6;
        let nx = stain.x + Math.cos(angle) * dist;
        let ny = stain.y + Math.sin(angle) * dist;
        let counterLeft = 80;
        let counterRight = GAME_WIDTH - 80;
        let counterTop = 120;
        let counterBottom = GAME_HEIGHT - 120;
        nx = Phaser.Math.Clamp(nx, counterLeft + 30, counterRight - 30);
        ny = Phaser.Math.Clamp(ny, counterTop + 30, counterBottom - 30);
        let newStain = createStain(nx, ny, 30, STAIN_FLOUR);
        newStain.wetted = true;
        newStain.expanded = true;
        newStains.push(newStain);
    }
}

function cleanStain(stain) {
    let points = 10;
    if (stain.type === STAIN_STUBBORN) points = 30;
    else if (stain.type === STAIN_OIL) points = 25;
    else if (stain.type === STAIN_SYRUP) points = 20;
    else if (stain.type === STAIN_FLOUR) points = 15;
    else if (stain.type === STAIN_WATER) points = 5;

    combo++;
    comboTimer = 3;
    if (combo > maxCombo) maxCombo = combo;

    let comboBonus = Math.floor(combo / 3) * 5;
    points += comboBonus;
    score += points;

    let comboTextDisplay = combo > 2 ? ` x${combo}` : '';
    createScorePopup(stain.x, stain.y, `+${points}${comboTextDisplay}`);

    if (combo >= 3) {
        updateComboDisplay();
    }

    let idx = stains.indexOf(stain);
    if (idx > -1) stains.splice(idx, 1);

    let scene = game.scene.scenes[0];
    scene.tweens.add({
        targets: stain,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 200,
        onComplete: () => stain.destroy()
    });
}

function updateComboDisplay() {
    if (comboText) {
        let comboLevel = Math.floor(combo / 5);
        let colors = ['#ffeb3b', '#ff9800', '#f44336', '#e91e63', '#9c27b0'];
        let color = colors[Math.min(comboLevel, colors.length - 1)];
        comboText.setFill(color);
        comboText.setText(`${combo} 连击!`);

        let scene = game.scene.scenes[0];
        scene.tweens.add({
            targets: comboText,
            scaleX: { from: 1.5, to: 1 },
            scaleY: { from: 1.5, to: 1 },
            duration: 200
        });
    }
}

function createCleanEffect(x, y) {
    let scene = game.scene.scenes[0];
    for (let i = 0; i < 6; i++) {
        let particle = scene.add.graphics();
        particle.fillStyle(0x4fc3f7, 0.8);
        particle.fillCircle(0, 0, 5);
        particle.x = x;
        particle.y = y;
        particle.setDepth(48);

        let angle = Math.random() * Math.PI * 2;
        let speed = 80 + Math.random() * 120;

        scene.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            scaleX: 0.3,
            scaleY: 0.3,
            duration: 400,
            onComplete: () => particle.destroy()
        });
    }
}

function createScorePopup(x, y, text) {
    let scene = game.scene.scenes[0];
    let popup = scene.add.text(x, y, text, {
        fontSize: '20px',
        fill: '#ffeb3b',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(60);

    scene.tweens.add({
        targets: popup,
        y: y - 40,
        alpha: 0,
        duration: 800,
        onComplete: () => popup.destroy()
    });
}

function takeDamage(sourceX, sourceY, isBurn = false) {
    invincible = true;
    invincibleTimer = 1.5;

    timeLeft = Math.max(0, timeLeft - 5);

    let knockback = new Phaser.Math.Vector2(player.x - sourceX, player.y - sourceY).normalize();
    player.vx = knockback.x * 300;
    player.vy = knockback.y * 300;

    createScorePopup(player.x, player.y - 30, '-5秒');

    if (isBurn) {
        combo = 0;
        comboTimer = 0;
        if (comboText) comboText.setText('');
        dropHeldItem();
        createScorePopup(player.x, player.y - 60, '连击中断! 道具掉落!');
    }

    let scene = game.scene.scenes[0];
    scene.cameras.main.shake(200, 0.02);
}

function hitBySteam(sourceX, sourceY) {
    invincible = true;
    invincibleTimer = 1.0;

    timeLeft = Math.max(0, timeLeft - 3);

    let knockback = new Phaser.Math.Vector2(player.x - sourceX, player.y - sourceY).normalize();
    player.vx = knockback.x * 200;
    player.vy = knockback.y * 200;

    createScorePopup(player.x, player.y - 30, '-3秒 蒸汽烫伤!');

    combo = 0;
    comboTimer = 0;
    if (comboText) comboText.setText('');

    dropHeldItem();

    let scene = game.scene.scenes[0];
    scene.cameras.main.shake(150, 0.015);
}

function dropHeldItem() {
    if (sponges.length > 0) {
        let scene = game.scene.scenes[0];
        let dropItem = scene.add.container(player.x, player.y);
        dropItem.setDepth(45);

        let body = scene.add.graphics();
        body.fillStyle(0xffb74d, 1);
        body.fillRoundedRect(-20, -14, 40, 28, 6);
        body.lineStyle(2, 0xf57c00, 1);
        body.strokeRoundedRect(-20, -14, 40, 28, 6);

        let top = scene.add.graphics();
        top.fillStyle(0xffcc80, 1);
        top.fillRoundedRect(-18, -12, 36, 8, 3);

        dropItem.add([body, top]);
        dropItem.vx = (Math.random() - 0.5) * 200;
        dropItem.vy = -150 - Math.random() * 100;
        dropItem.life = 8;
        dropItem.radius = 20;
        dropItem.type = 'sponge';

        let label = scene.add.text(0, 25, '掉落的海绵 (E捡起)', {
            fontSize: '11px',
            fill: '#ffb74d',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        dropItem.add(label);

        droppedItems.push(dropItem);

        createScorePopup(player.x, player.y - 50, '海绵掉落!');
    }
}

function updateDroppedItems(dt) {
    for (let i = droppedItems.length - 1; i >= 0; i--) {
        let item = droppedItems[i];
        item.x += item.vx * dt;
        item.y += item.vy * dt;
        item.vy += 400 * dt;
        item.vx *= 0.98;
        item.life -= dt;

        let counterLeft = 80;
        let counterRight = GAME_WIDTH - 80;
        let counterTop = 120;
        let counterBottom = GAME_HEIGHT - 120;

        if (item.x < counterLeft + 20) {
            item.x = counterLeft + 20;
            item.vx *= -0.5;
        }
        if (item.x > counterRight - 20) {
            item.x = counterRight - 20;
            item.vx *= -0.5;
        }
        if (item.y < counterTop + 20) {
            item.y = counterTop + 20;
            item.vy *= -0.5;
        }
        if (item.y > counterBottom - 20) {
            item.y = counterBottom - 20;
            item.vy *= -0.5;
            item.vx *= 0.8;
        }

        if (item.life <= 0) {
            item.destroy();
            droppedItems.splice(i, 1);
        }
    }
}

function collectCrumb(crumb) {
    crumb.collected = true;
    score += 5;

    let idx = crumbs.indexOf(crumb);
    if (idx > -1) crumbs.splice(idx, 1);

    createScorePopup(crumb.x, crumb.y, '+5');

    let scene = game.scene.scenes[0];
    scene.tweens.add({
        targets: crumb,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 200,
        onComplete: () => crumb.destroy()
    });
}

function breakDish(dish) {
    dish.broken = true;

    timeLeft = Math.max(0, timeLeft - 8);
    score = Math.max(0, score - 20);

    createScorePopup(dish.x, dish.y - 40, '-8秒 -20分');

    let scene = game.scene.scenes[0];

    let pieces = scene.add.graphics();
    pieces.fillStyle(0xffffff, 1);
    for (let i = 0; i < 8; i++) {
        let angle = (Math.PI * 2 / 8) * i;
        let dist = 15 + Math.random() * 10;
        let px = Math.cos(angle) * dist;
        let py = Math.sin(angle) * dist;
        pieces.fillCircle(px, py, 5 + Math.random() * 3);
    }
    dish.add(pieces);

    dish.list.forEach((item, index) => {
        if (index < dish.list.length - 2) {
            item.visible = false;
        }
    });

    scene.cameras.main.shake(300, 0.03);

    dish.warningText.setText('碎了!');
    dish.warningText.setFill('#f44336');
}

function tryInteract() {
    for (let i = droppedItems.length - 1; i >= 0; i--) {
        let item = droppedItems[i];
        let dist = Phaser.Math.Distance.Between(player.x, player.y, item.x, item.y);
        if (dist < 50) {
            if (item.type === 'sponge') {
                let scene = game.scene.scenes[0];
                let newSponge = createSponge(item.x, item.y);
                item.destroy();
                droppedItems.splice(i, 1);
                createScorePopup(player.x, player.y - 30, '捡起海绵!');
                return;
            }
        }
    }

    for (let faucet of drippingFaucets) {
        if (!faucet.dripping) continue;
        let dist = Phaser.Math.Distance.Between(player.x, player.y, faucet.x, faucet.y);
        if (dist < 70) {
            closeFaucet(faucet);
            return;
        }
    }
}

function checkSteamDaredevil() {
    for (let pan of hotPans) {
        if (pan.isSteaming) {
            let dist = Phaser.Math.Distance.Between(player.x, player.y, pan.x, pan.y);
            if (dist < 90 && dist > 50 && !invincible) {
                let speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
                if (speed > 300 && isSliding) {
                    score += 15;
                    combo += 2;
                    comboTimer = 3;
                    updateComboDisplay();
                    createScorePopup(player.x, player.y - 40, '+15 冒险穿越!');
                    invincible = true;
                    invincibleTimer = 0.5;
                    return true;
                }
            }
        }
    }
    return false;
}

function closeFaucet(faucet) {
    faucet.dripping = false;
    score += 25;
    timeLeft += 5;

    faucet.dripTween.stop();
    faucet.drop.visible = false;
    faucet.label.setText('已关闭 ✓');
    faucet.label.setFill('#4caf50');

    createScorePopup(faucet.x, faucet.y - 30, '+25分 +5秒');

    let scene = game.scene.scenes[0];
    scene.tweens.add({
        targets: faucet.handle,
        rotation: Math.PI / 2,
        duration: 300
    });
}

function updateSoapBubbles(time) {
    let t = time / 1000;
    for (let bubble of soapBubbles) {
        bubble.y = bubble.baseY + Math.sin(t * bubble.bobSpeed + bubble.bobOffset) * 5;
        bubble.x = bubble.baseX + Math.cos(t * bubble.bobSpeed * 0.7 + bubble.bobOffset) * 3;
    }
}

function updateUI() {
    scoreText.setText('分数: ' + score);
    timeText.setText('时间: ' + timeLeft);
    levelText.setText('第 ' + level + ' 关');

    if (timeLeft <= 10) {
        timeText.setFill('#ff5722');
    } else {
        timeText.setFill('#ffffff');
    }

    if (gameState !== 'playing') return;

    let stainsLeft = stains.length;
    let stainDone = stainsLeft === 0 && levelTotalStains > 0;
    objStainText.setText('污渍: ' + (levelTotalStains - stainsLeft) + '/' + levelTotalStains + (stainDone ? ' ✅' : ''));
    objStainText.setFill(stainDone ? '#81c784' : '#ffffff');

    let crumbsLeft = crumbs.filter(c => !c.collected).length;
    let crumbDone = crumbsLeft === 0 && levelTotalCrumbs > 0;
    objCrumbText.setText('碎屑: ' + (levelTotalCrumbs - crumbsLeft) + '/' + levelTotalCrumbs + (crumbDone ? ' ✅' : ''));
    objCrumbText.setFill(crumbDone ? '#81c784' : '#ffffff');

    let faucetsClosed = drippingFaucets.filter(f => !f.dripping).length;
    let faucetDone = faucetsClosed === levelTotalFaucets && levelTotalFaucets > 0;
    objFaucetText.setText('水龙头: ' + faucetsClosed + '/' + levelTotalFaucets + (faucetDone ? ' ✅' : ''));
    objFaucetText.setFill(faucetDone ? '#81c784' : '#ffffff');

    let utensilsOrg = utensils.filter(u => u.organized).length;
    let utensilDone = utensilsOrg === levelTotalUtensils && levelTotalUtensils > 0;
    objUtensilText.setText('餐具整理: ' + utensilsOrg + '/' + levelTotalUtensils + (utensilDone ? ' ✅' : ''));
    objUtensilText.setFill(utensilDone ? '#81c784' : '#ffffff');

    let dishesIntact = fragileDishes.filter(d => !d.broken).length;
    let dishDone = dishesIntact === levelTotalDishes && levelTotalDishes > 0;
    if (levelTotalDishes > 0 && dishesIntact < levelTotalDishes) {
        objDishText.setText('杯盘完好: ' + dishesIntact + '/' + levelTotalDishes + ' ❌');
        objDishText.setFill('#e57373');
    } else {
        objDishText.setText('杯盘完好: ' + dishesIntact + '/' + levelTotalDishes + (dishDone ? ' ✅' : ''));
        objDishText.setFill(dishDone ? '#81c784' : '#ffffff');
    }
}

function checkLevelComplete() {
    let allClean = stains.length === 0;
    let allCrumbsCollected = crumbs.filter(c => !c.collected).length === 0;
    let allFaucetsClosed = drippingFaucets.every(f => !f.dripping);
    let allUtensilsOrganized = utensils.every(u => u.organized);
    let allDishesIntact = fragileDishes.every(d => !d.broken);

    if (allClean && allCrumbsCollected && allFaucetsClosed && allUtensilsOrganized && allDishesIntact) {
        nextLevel();
    }
}

function nextLevel() {
    level++;
    timeLeft += 30;
    score += 100;

    createScorePopup(GAME_WIDTH / 2, GAME_HEIGHT / 2, '关卡完成! +100分');

    let scene = game.scene.scenes[0];
    scene.cameras.main.flash(500, 0, 255, 100);

    clearLevel();
    drawKitchenBackground();
    createLevel(level);
    createPlayer();
    playerVelocity = new Phaser.Math.Vector2();
}

function endGame(won) {
    gameState = 'gameover';

    gameOverText.setVisible(true);
    finalScoreText.setVisible(true);

    if (won) {
        gameOverText.setText('🎉 恭喜通关！🎉');
        gameOverText.setFill('#4caf50');
    } else {
        gameOverText.setText('⏰ 时间到！');
        gameOverText.setFill('#ff5722');
    }

    finalScoreText.setText(`最终分数: ${score} | 到达第 ${level} 关\n按 回车键 重新开始`);

    menuGraphics.clear();
    menuGraphics.fillStyle(0x000000, 0.6);
    menuGraphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}
