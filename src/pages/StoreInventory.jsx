import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import BooksTable from "../components/BooksTable";
import Header from "../components/Header";
import Modal from "../components/Modal";
import useLibraryData from "../hooks/useLibraryData";
import Loading from "./Loading";

const Inventory = () => {
	const { storeId = "" } = useParams();

	// State for UI
	const [activeTab, setActiveTab] = useState("books");
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
	const [editingRowId, setEditingRowId] = useState(null);
	const [editName, setEditName] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [newBook, setNewBook] = useState({
		author_id: "",
		name: "",
		page_count: "",
	});

	// API state
	const {
		storeBooks: books = [],
		authors,
		isLoading,
		setBooks,
	} = useLibraryData({ storeId, searchTerm });

	// Set active tab based on view query param
	const view = "books";
	useEffect(() => {
		if (view === "authors" || view === "books") {
			setActiveTab(view);
		}
	}, [view]);

	// Sync search term with URL params
	useEffect(() => {
		const search = searchParams.get("search") || "";
		setSearchTerm(search);
	}, [searchParams]);

	// Filter books based on search
	const filteredBooks = books.filter((book) => {
		if (!searchTerm.trim()) return true;
		return Object.values(book).some((value) =>
			String(value).toLowerCase().includes(searchTerm.toLowerCase())
		);
	});

	// Modal controls
	const openModal = () => setShowModal(true);
	const closeModal = () => {
		setShowModal(false);
	};

	// Delete book handler
	const deleteBook = (id, name) => {
		if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
			setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
			setEditingRowId(null);
			setEditName("");
		}
	};

	// Add new book handler
	const handleAddNew = () => {
		if (!newBook.author_id || !newBook.name || !newBook.page_count) {
			alert("All fields are required");
			return;
		}

		const newId = books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;
		const newBookObject = {
			id: newId,
			author_id: parseInt(newBook.author_id),
			name: newBook.name,
			page_count: parseInt(newBook.page_count),
		};

		setBooks((prevBooks) => [...prevBooks, newBookObject]);
		setNewBook({ author_id: "", name: "", page_count: "" });
		setShowModal(false);
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="py-6">
			<div className="flex mb-4 w-full justify-center items-center">
				<button
					onClick={() => setActiveTab("books")}
					className={`px-4 border-b-2 py-2 ${activeTab === "books" ? "border-b-main" : "border-b-transparent"}`}>
					Books
				</button>
				<button
					onClick={() => setActiveTab("authors")}
					className={`px-4 border-b-2 py-2 ${activeTab === "authors" ? "border-b-main" : "border-b-transparent"}`}>
					Authors
				</button>
			</div>

			{activeTab === "books" ? (
				<>
					<Header
						addNew={openModal}
						title="Store Inventory"
						buttonTitle="Add to inventory"
					/>
					{books.length > 0 ? (
						<BooksTable
							books={filteredBooks}
							authors={authors}
							editingRowId={editingRowId}
							setEditingRowId={setEditingRowId}
							editName={editName}
							setEditName={setEditName}
							setBooks={setBooks}
							deleteBook={deleteBook}
							isPriceShown
							isAddBookCTAHidden
						/>
					) : (
						<p className="text-gray-600">No data found.</p>
					)}
				</>
			) : (
				<p className="text-gray-600">No authors with books in this store.</p>
			)}

			{activeTab === "books" && (
				<Modal
					title="Add/Edit Book in Store"
					save={handleAddNew}
					cancel={closeModal}
					show={showModal}
					setShow={setShowModal}>
					<div className="flex flex-col gap-4 w-full">
						<div>
							<label
								htmlFor="book_select"
								className="block text-gray-700 font-medium mb-1">
								Select Book
							</label>
							<select
								id="book_select"
								className="border border-gray-300 rounded p-2 w-full"></select>
						</div>

						<div>
							<label htmlFor="price" className="block text-gray-700 font-medium mb-1">
								Price
							</label>
							<input
								id="price"
								type="text"
								className="border border-gray-300 rounded p-2 w-full"
								placeholder="Enter Price (e.g., 29.99)"
							/>
						</div>
					</div>
				</Modal>
			)}
		</div>
	);
};

export default Inventory;
