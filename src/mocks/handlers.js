import { http, HttpResponse } from "msw";

import authors from "./data/authors.json";
import books from "./data/books.json";
import inventory from "./data/inventory.json";
import stores from "./data/stores.json";

export const handlers = [
	http.get("/api/books", () => HttpResponse.json(books)),
	http.get("/api/authors", () => HttpResponse.json(authors)),
	http.get("/api/inventory", () => HttpResponse.json(inventory)),
	http.get("/api/stores", () => HttpResponse.json(stores)),
];

export default handlers;
