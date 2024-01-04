## leaflet-drawText
A [leaflet](http://www.leafletjs.com) plugin which adds an icon to draw text on map. 

## Features
* Draw text on map

### Download
You can either download this repo directly or install via NPM.
````
npm install @sswroom/leaflet-drawtext
````

### Options
You can pass a number of options to the plugin to control various settings.

| Option        | Type         | Default      | Description   |
| ------------- |--------------|--------------|---------------|
| title | string | 'Print map' | Sets the text which appears as the tooltip of the print/export button |
| position | [Leaflet control position](http://leafletjs.com/reference-1.1.0.html#controls) | 'topleft' | Positions the print button |
| layer | Layer | null | The layer for adding new labels |
| buttonClass | string | null | The class name of the dialog button |
| dialogClass | string | null | The class name of the dialog content |


### Example
````
import * as drawText from "leaflet-drawText";

drawText.create({
	title: 'My awesome print button',
	position: 'bottomright',
	buttonClass: "button"
}).addTo(map);
````

### Methods / Using programmatically
| Method        | Options      | Description   |
| --------------|--------------|--------------|
| updateOptions(name, value) | Update options dynamitically | Update the options at runtime. |
````
var textPlugin = drawText.create().addTo(map); 
textPlugin.updateOptions('buttonClass', 'button');
````
