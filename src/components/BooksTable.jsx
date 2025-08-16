import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import TableActions from "./ActionButton/TableActions";
import Table from "./Table/Table";

const BooksTable = ({
	books,
	authors,
	editingRowId,
	setEditingRowId,
	editName,
	setEditName,
	setBooks,
	deleteBook,
	columnsConfig = ["id", "name", "pages", "author", "actions"],
	isPriceShown = false,
	isEditPriceEnabled = false,
}) => {
	const { isAuthenticated } = useAuth();

	const [editPrice, setEditPrice] = useState("");

	// event handlers
	// Handle edit button click
	const handleEdit = useCallback(
		(book) => {
			setEditingRowId(book.id);
			if (isEditPriceEnabled) {
				setEditPrice(book.price !== undefined ? book.price : "");
			} else {
				setEditName(book.name);
			}
		},
		[isEditPriceEnabled, setEditName, setEditingRowId]
	);

	// Save edited name or price depending on mode
	const handleSave = useCallback(
		(id) => {
			if (isEditPriceEnabled) {
				const parsedPrice = parseFloat(editPrice);
				if (isNaN(parsedPrice) || parsedPrice < 0) {
					alert("Please enter a valid non-negative price");
					return;
				}
				setBooks(
					books.map((book) => (book.id === id ? { ...book, price: parsedPrice } : book))
				);
				setEditPrice("");
			} else {
				setBooks(
					books.map((book) => (book.id === id ? { ...book, name: editName } : book))
				);
				setEditName("");
			}
			setEditingRowId(null);
		},
		[books, editName, editPrice, isEditPriceEnabled, setBooks, setEditName, setEditingRowId]
	);

	// Cancel editing
	const handleCancel = useCallback(() => {
		setEditingRowId(null);
		setEditName("");
		setEditPrice("");
	}, [setEditName, setEditingRowId]);

	// memo hooks
	const authorMap = useMemo(() => {
		return authors.reduce((map, author) => {
			map[author.id] = `${author.first_name} ${author.last_name}`;
			return map;
		}, {});
	}, [authors]);

	const enrichedBooks = useMemo(() => {
		return books.map((book) => ({
			...book,
			author_name: authorMap[book.author_id] || "Unknown Author",
		}));
	}, [books, authorMap]);

	const allColumns = useMemo(
		() => ({
			id: { header: "Book Id", accessorKey: "id" },
			name: {
				header: "Name",
				accessorKey: "name",
				cell: ({ row }) => {
					if (editingRowId === row.original.id && !isEditPriceEnabled) {
						// Editing name
						return (
							<input
								type="text"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSave(row.original.id);
									if (e.key === "Escape") handleCancel();
								}}
								className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
								autoFocus
							/>
						);
					}
					return row.original.name;
				},
			},
			pages: { header: "Pages", accessorKey: "page_count" },
			author: { header: "Author", accessorKey: "author_name" },
			...(isPriceShown && {
				price: {
					header: "Price",
					accessorKey: "price",
					cell: ({ row }) => {
						if (editingRowId === row.original.id && isEditPriceEnabled) {
							// Editing price
							return (
								<input
									type="number"
									value={editPrice}
									onChange={(e) => setEditPrice(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleSave(row.original.id);
										if (e.key === "Escape") handleCancel();
									}}
									className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
									autoFocus
									min="0"
									step="0.01"
								/>
							);
						}
						return row.original.price !== undefined ? row.original.price : "-";
					},
				},
			}),
			...(isAuthenticated
				? {
						actions: {
							header: "Actions",
							id: "actions",
							cell: ({ row }) => (
								<TableActions
									row={row}
									onEdit={
										editingRowId === row.original.id
											? handleCancel
											: () => handleEdit(row.original)
									}
									onDelete={() => deleteBook(row.original.id, row.original.name)}
								/>
							),
						},
					}
				: {}),
		}),
		[
			isPriceShown,
			editingRowId,
			isEditPriceEnabled,
			editName,
			setEditName,
			handleSave,
			handleCancel,
			editPrice,
			handleEdit,
			deleteBook,
			isAuthenticated,
		]
	);

	// Compose columns based on columnsConfig + price if isPriceShown is true
	const columns = useMemo(() => {
		let baseCols = columnsConfig.map((colKey) => allColumns[colKey]).filter(Boolean);
		if (isPriceShown && !columnsConfig.includes("price")) {
			const actionsIndex = baseCols.findIndex((col) => col.id === "actions");
			if (actionsIndex === -1) {
				baseCols.push(allColumns.price);
			} else {
				baseCols.splice(actionsIndex, 0, allColumns.price);
			}
		}
		return baseCols;
	}, [columnsConfig, allColumns, isPriceShown]);

	return <Table data={enrichedBooks} columns={columns} />;
};

export default BooksTable;
