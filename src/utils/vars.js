export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const API_ROUTES = {
	stores: USE_MOCK ? "/api/stores" : "/data/stores.json",
	books: USE_MOCK ? "/api/books" : "/data/books.json",
	authors: USE_MOCK ? "/api/authors" : "/data/authors.json",
	inventory: USE_MOCK ? "/api/inventory" : "/data/inventory.json",
};
