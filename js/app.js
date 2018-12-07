Vue.component('canvas-area', {
	template: `
		<div>
			<svg version="1.1" width="500" height="500" viewBox="0 0 500 500" fill="none" stroke="#ccc" stroke-linecap="round"
			 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="area"
			 @dblclick.self="createRect"
			 ref="canvas">
				<rect v-for="(rect, index) in rects" :x="rect.x" :y="rect.y" :width="20" :height="10" :fill="rect.color" :stroke="rect.stroke" @mousedown="mouseDownRect(rect, $event)" @click="pickRect(rect, $event)" @dblclick="deleteRect(index)"/>
				<line v-for="(line, index) in lines" :x1="line.from.x + 20" :y1="line.from.y + 10" :x2="line.to.x" :y2="line.to.y" :stroke="line.stroke" stroke-width="1" @click="pickLine(line, index, $event)" @mouseover=""/>
			</svg>
			<button class="btn btn-delete" v-show="selectedLine !== null" @click="deleteLine" ref="btnDelete">&#128936;</button>
			<button class="btn btn-cancel" v-show="selectedLine !== null" @click="cancelDeleteLine" ref="btnCancel">&#8260;</button>
		</div>
	`,
	data () {
		return {
			pair: {from: null, to: null},
			selectedLine: null,
			dragged: null,
			rects : [],
			lines: []
		}
	},
	created () {
		document.body.addEventListener('mouseup', this.mouseUpRect);
	},
	methods: {
		createRect (event) {
			let rect = {
				x: event.x - event.originalTarget.getBoundingClientRect().x,
				y: event.y - event.originalTarget.getBoundingClientRect().y,
				color: '#'+Math.round(0xffffff * Math.random()).toString(16).padStart(6, '0'),
				stroke: ''
			};
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
					stroke: '#555'
				};
				this.lines.push(line);
			}
		},
		deleteLine () {
			this.lines.splice(this.selectedLine, 1);
			this.selectedLine = null;
		},
		cancelDeleteLine () {
			this.lines[this.selectedLine].stroke = '#555';
			this.selectedLine = null;
		},
		pickRect (pickedRect, event) {
			if (this.pair.from === null) {
				pickedRect.stroke = 'red';
				this.pair.from = pickedRect;
			} else if (pickedRect === this.pair.from) {
				pickedRect.stroke = '';
				this.pair.from = null;
			} else {
				this.pair.to = pickedRect;
				this.pair.from.stroke = '';
				this.createLine();
				this.pair.from = this.pair.to = null;
			}
		},
		pickLine(pickedLine, lineIndex, e) {
			this.selectedLine = lineIndex;
			pickedLine.stroke = '#F00';
			this.$refs.btnDelete.style.top = this.$refs.btnCancel.style.top = e.y - 20 + 'px';
			this.$refs.btnDelete.style.left = e.x + 'px';
			this.$refs.btnCancel.style.left = e.x + 22 + 'px';
		},
		mouseDownRect (draggedRect, e) {
			this.dragged = draggedRect;
			this.$refs.canvas.addEventListener('mousemove', this.mouseMoveRect);
		},
		mouseUpRect (e) {
			this.dragged = null;
			this.$refs.canvas.removeEventListener('mousemove', this.mouseMoveRect);
		},
		mouseMoveRect (e) {
			this.dragged.x = e.x - this.$refs.canvas.getBoundingClientRect().x;
			this.dragged.y = e.y - this.$refs.canvas.getBoundingClientRect().y;
		}
	}
})

var app = new Vue({
	el: '#app'
})