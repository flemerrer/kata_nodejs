export type pastry = {
	id: number;
	name: string;
	price: number;
};

export type pastriesApiResponse = {
	status: string;
	code: number;
	message?: string;
	data?: pastry[];
};