Vue.component('canvas-area', {
	template: `
		<div class="workspace-wrap">
			<svg version="1.1" width="500" height="500" viewBox="0 0 500 500" fill="none" stroke="#ccc" stroke-linecap="round"
			 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="area"
			 @dblclick.self="createRect"
			 ref="workspace">
				<rect v-for="(rect, index) in rects" :x="rect.x" :y="rect.y" :width="20" :height="10" :fill="rect.color" :stroke="rect.stroke" @mousedown="mouseDownRect(rect, $event)" @click="pickRect(rect, $event)" @dblclick="deleteRect(index)" @dragstart.prevent/>
				<line v-for="(line, index) in lines" :x1="line.from.x + 20" :y1="line.from.y + 10" :x2="line.to.x" :y2="line.to.y" :stroke="line.stroke" stroke-width="1" @click="pickLine(line, index, $event)"/>
			</svg>
			<div class="btn-group" v-show="selectedLine !== null" :style="{ top: btns.y + 'px', left: btns.x + 'px' }">
				<button class="btn btn-delete" @click="deleteLine" v-html="settings.btn.deleteBtnText"></button>
				<button class="btn btn-cancel" @click="cancelDeleteLine" v-html="settings.btn.cancelBtnText"></button>
			</div>
			<div class="block-info">
				<ul>
					<li>Всего прямоугольников - {{rects.length}}</li>
					<li>Всего связей - {{lines.length}}</li>
				</ul>
				<button class="btn btn-clear" @click="clearData" v-html="settings.btn.clearBtnText"></button>
			</div>
		</div>
	`,
	data () {
		return {
			settings: {
				line: {
					colorDefault: '#999',
					colorActive: '#F00'
				},
				rect: {
					borderColorActive: '#F00'
				},
				btn: {
					deleteBtnText: '&#10005;',
					cancelBtnText: '&#8260;',
					clearBtnText: 'Очистить поле'
				}
			},
			pair: {from: null, to: null},
			selectedLine: null,
			dragged: null,
			rects : localStorage.getItem('rectSet') ? JSON.parse(localStorage.getItem('rectSet')) : [],
			lines: [],
			btns: {
				x: 0,
				y: 0
			},
			workspace: {
				x: 0,
				y: 0
			}
		}
	},
	mounted () {
		this.getWorkspaceCoords();
		window.addEventListener('resize', this.getWorkspaceCoords);
		document.body.addEventListener('mouseup', this.mouseUpRect, true);
		window.addEventListener('beforeunload', this.saveData);

		if (localStorage.getItem('lineSet')) {		
			this.lines = JSON.parse(localStorage.getItem('lineSet'));
			this.lines.forEach((line) => {
				line.from = this.rects.find((rect) => {return rect.x === line.from.x});
				line.to = this.rects.find((rect) => {return rect.x === line.to.x});
			});
		};
	},
	methods: {
		createRect (event) {
			let rect = {
				x: event.x - this.workspace.x,
				y: event.y - this.workspace.y,
				color: '#'+Math.round(0xffffff * Math.random()).toString(16).padStart(6, '0')
			};
			rect.stroke = rect.color;
			this.rects.push(rect);
		},
		deleteRect (itemIndex) {
			this.lines = this.lines.filter((line) => {return !(line.from === this.rects[itemIndex] || line.to === this.rects[itemIndex])});
			this.pair.from = null;
			this.rects.splice(itemIndex, 1);
		},
		createLine (event) {
			if (!this.lines.some((line) => {return (line.from === this.pair.from && line.to === this.pair.to) || (line.from === this.pair.to && line.to === this.pair.from)})) {
				let line = {
					from: this.pair.from,
					to: this.pair.to,
					stroke: this.settings.line.colorDefault
				};
				this.lines.push(line);
			}
		},
		deleteLine () {
			this.lines.splice(this.selectedLine, 1);
			this.selectedLine = null;
		},
		cancelDeleteLine () {
			this.lines[this.selectedLine].stroke = this.settings.line.colorDefault;
			this.selectedLine = null;
		},
		pickRect (pickedRect, event) {
			console.log('pickRect e: ', event);
			if (this.pair.from === null) {
				pickedRect.stroke = this.settings.rect.borderColorActive;
				this.pair.from = pickedRect;
			} else if (pickedRect === this.pair.from) {
				pickedRect.stroke = pickedRect.color;
				this.pair.from = null;
			} else {
				this.pair.to = pickedRect;
				this.pair.from.stroke = this.pair.from.color;
				this.createLine();
				this.pair.from = this.pair.to = null;
			}
		},
		pickLine(pickedLine, lineIndex, e) {
			this.selectedLine = lineIndex;
			pickedLine.stroke = this.settings.line.colorActive;
			this.btns.x = e.x;
			this.btns.y = e.y - 20;
		},
		mouseDownRect (draggedRect, e) {
			this.dragged = draggedRect;
			this.$refs.workspace.addEventListener('mousemove', this.mouseMoveRect);
		},
		mouseUpRect (e) {
			this.dragged = null;
			this.$refs.workspace.removeEventListener('mousemove', this.mouseMoveRect);
		},
		mouseMoveRect (e) {
			this.dragged.x = e.x - this.workspace.x;
			this.dragged.y = e.y - this.workspace.y;
		},
		getWorkspaceCoords () {
			this.workspace.x = this.$refs.workspace.getBoundingClientRect().left;
			this.workspace.y = this.$refs.workspace.getBoundingClientRect().top;
		},
		saveData(e) {
			e.preventDefault();
			e.returnValue = '';
			if (this.selectedLine) this.lines[this.selectedLine].stroke = this.settings.line.colorDefault;
			if (this.pair.from)  this.pair.from.stroke = this.pair.from.color;
			localStorage.setItem('rectSet', JSON.stringify(this.rects));
			localStorage.setItem('lineSet', JSON.stringify(this.lines));
		},
		clearData () {
			this.rects = [];
			this.lines = [];
			this.pair.from = this.pair.to = this.selectedLine = null;
			localStorage.clear();
		}
	}
})

var app = new Vue({
	el: '#app'
})