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
			let dir = {direction: "center"};
			newLabel(text.toHTMLText(txt.value), this.labelPos, dir).addTo(this.options.layer || this._map);
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
			background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAadEVYdEF1dGhvcgBNaWNoYWVsIE1pbmcgSG8gWUlQZfP9fgAAACB0RVh0Q3JlYXRpb25UaW1lADIwMjM6MTE6MjMgMTc6MDM6NTPIXPOBAAAAIXRFWHRDcmVhdGlvbiBUaW1lADIwMjM6MTE6MjMgMTc6MDM6NTNA05BHAAAC20lEQVRIS52WaW7bMBCFR4vtBDlTW9Rb6yK5SU6RLsiFYgNpHDtoe538CpBYG8tvpFEUVwvQJwikqOG8mcchpWD5+ZMLgkDSNBXam5sbGY1GUhSFRGEk4pz0ws9x/srzXMIwlCxJ5eLiQqIokizL1GeMs81mow5XX1by8PCgBBBBHPtx10GEgwIK/348HiuRFE6SJJH9fq82y+VSQgzV2BV1NDYWx7G2jLXdvAMQvLy81MGcnp6+CSyYzmeO1IgekFUcxSqBpxJXjXch8GSH5CCT8aQc8M7n83kdgAZzSBO32+3k5OREPrx7ry8MxFKadoPgcHQMZD8cDq9yoT/p/g/aCMDT05PKDWKkeX5+Vh2PcfX1Sv78+l09tYMKwtnt7W01UsLWE2gYLFxbBT0+Pla9bkwmk9a5qKPV5qEkMBLRMc7OzupocMTNcz3ZS0XfbJpojse2kUy/Jn58+171RLbbrVxfX+tEiuTy8lJWq1X19l9YANqnAkitLeUmeE+2TGYOEveBDYmUIDSCNrmaICrkg4B+V1UZKCRsQUidQ2CsXUBOypy2PkJ6gF9bEx9QeUQMTWICGTcn9+ENiXU4DPtAECy4kQ0FxVFlNiETyIS16QPOWUzLesieoM1GMzHGrMj1vGqDZUBLlEPgE5D7kx1/9WbEAd+OLrWNgIohm6GzrrnvVC5So+2DnUWsC7ZD+wR1VFqvTpBkqeNYBvPpTNsu4NykbTshmrjf77TCZt6n7ngmDmWib1kP75y737o8ndWvv4LZYu4sKqrn/m6r/WPg1AfmJSifQdf6fZxNdXMjF2Tqfb1e66d2sVzIz+1drSe3l1SridQZt4CsDnXTRaHauLyonkeyWW8kSRM5Pz+XsFmOSIZjxriNzH6X7LtDdOrU96NRSaqbOSxzw5Yfk/GoLI5gsVhoSK7KnawUrtSlONLEVYZa9r4twtcfDUhdlut/l/990LFQCvkLvQKzv5v4kmcAAAAASUVORK5CYII=);
			background-size: 25px 25px; 
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
	let icon = L.divIcon({iconSize: [1, 1]});
	let marker = new L.marker(latlng, { icon: icon, opacity: 0.001 }); //opacity may be set to zero
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
