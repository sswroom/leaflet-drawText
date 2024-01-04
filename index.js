import * as web from "../sswr/web.js";

L.Control.DrawText = L.Control.extend({
	options: {
		title: 'Draw Text',
		position: 'topleft',
		layer: null,
		buttonClass: null,
		dialogClass: null
	},

	onAdd: function () { 
		this._addCss();

		this.mapContainer = this._map.getContainer();
		var dialogContent = "Input label content<br/><input id=\"drawTextLabelInput\" type=\"text\"/>";
		var dialogButtons = [web.Dialog.closeButton("Cancel"),{name:"Add",onclick:()=>{this._onDialogAdd();}}];
		this.dialog = new web.Dialog(dialogContent, {zIndex: 1100, buttonClass: this.options.buttonClass, contentClass: this.options.dialogClass, buttons: dialogButtons});

		var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
		var btnClass = 'leaflet-control-drawText-button'
		this.link = L.DomUtil.create('a', btnClass, container);
		this.link.id = "leafletDrawText";
		this.link.title = this.options.title;
		this.holder = L.DomUtil.create('ul', 'leaflet-draw-actions leaflet-draw-actions-bottom', container);
		var btn = L.DomUtil.create('li', '', this.holder);
		var link = L.DomUtil.create('a', '', btn);
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

		this.dialog.show();
		var txt = document.getElementById("drawTextLabelInput");
		txt.focus();
		txt.addEventListener("keydown", (e)=>{this._onKeyDown(e);});
		this.labelPos = e.latlng;
		this._cancelDraw();
	},

	_onDialogAdd: function() {
		var txt = document.getElementById("drawTextLabelInput");
		if (txt.value.length == 0)
		{
			alert("Please input a label");
		}
		else
		{
			newLabel(txt.value, this.labelPos).addTo(this.options.layer || this._map);
			this.dialog.close();
		}
	},

	_onKeyDown: function(e) {
		if (e.isComposing || e.keyCode === 229) {
			return;
		}
		if (e.key == "Enter")
		{
			var txt = document.getElementById("drawTextLabelInput");
			if (txt.value.length > 0)
				this._onDialogAdd();
		}
	},

	_addCss: function () {
		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML = `.leaflet-control-drawText-button { 
			background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMTI4LDMyaDI1NnY2NEgxMjhWMzJ6IE00ODAsMTI4SDMyYy0xNy42LDAtMzIsMTQuNC0zMiwzMnYxNjBjMCwxNy42LDE0LjM5OCwzMiwzMiwzMmg5NnYxMjhoMjU2VjM1Mmg5NiAgIGMxNy42LDAsMzItMTQuNCwzMi0zMlYxNjBDNTEyLDE0Mi40LDQ5Ny42LDEyOCw0ODAsMTI4eiBNMzUyLDQ0OEgxNjBWMjg4aDE5MlY0NDh6IE00ODcuMTk5LDE3NmMwLDEyLjgxMy0xMC4zODcsMjMuMi0yMy4xOTcsMjMuMiAgIGMtMTIuODEyLDAtMjMuMjAxLTEwLjM4Ny0yMy4yMDEtMjMuMnMxMC4zODktMjMuMiwyMy4xOTktMjMuMkM0NzYuODE0LDE1Mi44LDQ4Ny4xOTksMTYzLjE4Nyw0ODcuMTk5LDE3NnoiIGZpbGw9IiMwMDAwMDAiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);
			background-size: 16px 16px; 
			cursor: pointer; 
		}`;
		document.body.appendChild(css);
	},

	updateOptions: function(name, value) {
		this.options[name] = value;
	}

});

L.drawText = function(options) {
	return new L.Control.DrawText(options);
};

export function newLabel(text, latlng, options)
{
	var marker = new L.marker(latlng, { opacity: 0.001 }); //opacity may be set to zero
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
