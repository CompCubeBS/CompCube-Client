import { encode, type ClientTransport } from "../core.js";
import type { MapCategory } from "../types.js";

export type MapCategoryWrite = Partial<Pick<MapCategory, "name" | "imageUrl" | "color">>;

export class MapCategoriesResource {
	constructor(private readonly transport: ClientTransport) {}
	list() {
		return this.transport.get<MapCategory[]>("/map-categories");
	}
	get(input: { categoryGuid: string }) {
		return this.transport.get<MapCategory>(`/map-categories/${encode(input.categoryGuid)}`);
	}
	create(input: MapCategoryWrite & { name: string }) {
		return this.transport.post<MapCategory>("/map-categories", { body: input });
	}
	update(input: MapCategoryWrite & { categoryGuid: string }) {
		const { categoryGuid, ...body } = input;
		return this.transport.patch<MapCategory>(`/map-categories/${encode(categoryGuid)}`, { body });
	}
	remove(input: { categoryGuid: string }) {
		return this.transport.delete<void>(`/map-categories/${encode(input.categoryGuid)}`);
	}
}
