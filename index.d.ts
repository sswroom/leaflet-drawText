declare class DrawText
{
	updateOption(name: string, value: any): void;
}

declare class DrawTextOptions
{
	title?: string;
	position?: string;
	layer?: Layer;
	buttonClass?: string;
	dialogClass?: string;
	beforedialogshow?: ()=>void;
	dialogMessage?: string;
	addButton?: string;
	cancelButton?: string;
	dialogMargin?: number;
}

export function newLabel(text: string, latlng: LatLng, options: TooltipOptions): Marker;
export function create(options?: DrawTextOptions): DrawText;
