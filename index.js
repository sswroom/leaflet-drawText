import * as text from "../sswr/text.js";
import * as web from "../sswr/web.js";

L.Control.DrawText = L.Control.extend({
	options: {
		title: 'Draw Text',
		position: 'topleft',
		layer: null,
		buttonClass: null,
		dialogClass: null,
		beforedialogshow: null,
		dialogMessage: "Input label content",
		addButton: "Add",
		cancelButton: "Cancel",
		dialogMargin: 20
	},

	onAdd: function () { 
		this._addCss();

		this.mapContainer = this._map.getContainer();
		let dialogContent = text.toHTMLText(this.options.dialogMessage)+"<br/><input id=\"drawTextLabelInput\" type=\"text\"/>";
		this.dialog = new web.Dialog(dialogContent, {zIndex: 1100, buttonClass: this.options.buttonClass, contentClass: this.options.dialogClass, width: 200 + this.options.dialogMargin * 2, height: 150 + this.options.dialogMargin * 2, margin: this.options.dialogMargin});

		let container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
		let btnClass = 'leaflet-control-drawText-button'
		this.link = L.DomUtil.create('a', btnClass, container);
		this.link.id = "leafletDrawText";
		this.link.title = this.options.title;
		this.holder = L.DomUtil.create('ul', 'leaflet-draw-actions leaflet-draw-actions-bottom', container);
		let btn = L.DomUtil.create('li', '', this.holder);
		let link = L.DomUtil.create('a', '', btn);
		link.title = 'Cancel drawing';
		link.innerText = 'Cancel';
		L.DomEvent.addListener(link, 'click', this._cancelDraw, this);
		L.DomEvent.addListener(this.link, 'click', this._onclick, this);
		this.screenPoint = null;
		this._map.on('mousemove', (e)=>{if (this.showing) this._onMouseMove(e);});
		this._map.on('click', (e)=>{if (this.showing) this._onMouseClick(e);});
		L.DomEvent.disableClickPropagation(container);
		return container;
	},

	_onclick: function (e) {
		this.holder.style.display = "block";
		this.showing = true;
	},

	_cancelDraw: function (e) {
		this.holder.style.display = "none";
		this.showing = false;
		if (this.screenPoint)
		{
			this.screenPoint.remove();
			this.screenPoint = null;
		}
	},

	_onMouseMove: function (e) {
		if (this.screenPoint == null)
		{
			this.screenPoint = L.marker(e.latlng).addTo(this._map);
		}
		else
		{
			this.screenPoint.setLatLng(e.latlng);
		}
	},

	_onMouseClick: function (e) {
		if (this.options.beforedialogshow)
			this.options.beforedialogshow();
		let dialogContent = text.toHTMLText(this.options.dialogMessage)+"<br/><input id=\"drawTextLabelInput\" type=\"text\" style=\"width: 200px;\"/>";
		this.dialog.setContent(dialogContent);
		this.dialog.updateOption("buttons", [this.dialog.closeButton(this.options.cancelButton),{name:this.options.addButton,onclick:()=>{this._onDialogAdd();}}]);
		if (this.options.dialogClass)
			this.dialog.updateOption("contentClass", this.options.dialogClass);
		this.dialog.show();
		let txt = document.getElementById("drawTextLabelInput");
		txt.focus();
		txt.addEventListener("keydown", (e)=>{this._onKeyDown(e);});
		this.labelPos = e.latlng;
		this._cancelDraw();
		if (this.options.ondialogshown)
		{
			this.options.ondialogshown();
		}
	},

	_onDialogAdd: function() {
		let txt = document.getElementById("drawTextLabelInput");
		if (txt.value.length == 0)
		{
			alert("Please input a label");
		}
		else
		{
			newLabel(text.toHTMLText(txt.value), this.labelPos).addTo(this.options.layer || this._map);
			this.dialog.close();
		}
	},

	_onKeyDown: function(e) {
		if (e.isComposing || e.keyCode === 229) {
			return;
		}
		if (e.key == "Enter")
		{
			let txt = document.getElementById("drawTextLabelInput");
			if (txt.value.length > 0)
				this._onDialogAdd();
		}
	},

	_addCss: function () {
		let css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML = `.leaflet-control-drawText-button { 
			background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AEFCQIZZfEbAAAAARNJREFUSMftlj0OwjAMhb8iJmb2zJ1h5RLMzOUOHIA7wNwZDsFaZuay0pkVFhc9RahJARUEPCmSlR87eXZsA1wCIyMeWUhfj47RF/kMHEweAs5kB4wi9TmRS6AyOQUG9UL93KINNS1dUXwEpUO51UTmd0J1CKmcnXi68Sn9zihN5AUOWAiN+ZOUzkReWtSSyOaRROoamMvawJQ14WBfq8ZKHjMG9n7QhG5eBPbclDbhrd+iCZXR7PtJ/Vu90mApPs3EYC4XiULnlP4Nvi1KFVv5b8dHDGZ3imcq835qO9kIpTbNTFMt4r/T05SW1eviOZOsH9vTKI25uQOrQu43eprELDe1iUtgE6lvKkU82CZ+Z5ReAYMroOcQXqePAAAAAElFTkSuQmCC);
			background-size: 24px 24px; 
			cursor: pointer; 
		}`;
		document.body.appendChild(css);
	},

	updateOption: function(name, value) {
		this.options[name] = value;
	}

});

L.drawText = function(options) {
	return new L.Control.DrawText(options);
};

export function newLabel(text, latlng, options)
{
	let marker = new L.marker(latlng, { opacity: 0.001 }); //opacity may be set to zero
	if (options == null)
		options = {};
	options.permanent = true;
	options.offset = [0, 0];
	marker.bindTooltip(text, options);
	return marker;
}

export function create(options)
{
	return new L.Control.DrawText(options);
}
