export default class Room {
	private fullname: string; // Full building name
	private shortname: string; // Short building name
	private number: string; // The room number. Not always a number so represented as a string
	private name: string; // The room id. Should be rooms shortname+"_"+rooms number
	private address: string; // The building address
	private lat: number; // The latitude of the building
	private lon: number; // The longitude of the building
	private seats: number; // The number of seats in the room
	private type: string; // The room type
	private furniture: string; // The room furniture
	private href: string; // The link to the full details online

	constructor(
		fullname: string,
		shortname: string,
		number: string,
		name: string,
		seats: number,
		type: string,
		furniture: string,
		address: string,
		lat: number,
		lon: number,
		href: string
	) {
		this.fullname = fullname;
		this.shortname = shortname;
		this.number = number;
		this.name = shortname + "_" + number;
		this.seats = seats;
		this.type = type;
		this.furniture = furniture;
		this.address = address;
		this.lat = lat;
		this.lon = lon;
		this.href = href;
	}

	// Getters
	public getFullname(): string {
		return this.fullname;
	}

	public getShortname(): string {
		return this.shortname;
	}

	public getNumber(): string {
		return this.number;
	}

	public getName(): string {
		return this.name;
	}

	public getSeats(): number {
		return this.seats;
	}

	public getType(): string {
		return this.type;
	}

	public getFurniture(): string {
		return this.furniture;
	}

	public getAddress(): string {
		return this.address;
	}

	public getLat(): number {
		return this.lat;
	}

	public getLon(): number {
		return this.lon;
	}

	public getHref(): string {
		return this.href;
	}

	// Setters
	public setFullname(fullname: string): void {
		this.fullname = fullname;
	}

	public setShortname(shortname: string): void {
		this.shortname = shortname;
		this.name = shortname + "_" + this.number; // Updates the name as well
	}

	public setNumber(number: string): void {
		this.number = number;
		this.name = this.shortname + "_" + number; // Updates the name as well
	}


	public setName(shortname: string, number: string): void {
		this.name = shortname + "_" + number;
	}

	public setSeats(seats: number): void {
		this.seats = seats;
	}

	public setType(type: string): void {
		this.type = type;
	}

	public setFurniture(furniture: string): void {
		this.furniture = furniture;
	}

	public setAddress(address: string): void {
		this.address = address;
	}

	public setLat(lat: number): void {
		this.lat = lat;
	}

	public setLon(lon: number): void {
		this.lon = lon;
	}

	public setHref(href: string): void {
		this.href = href;
	}
}
