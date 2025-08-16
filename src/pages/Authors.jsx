import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TableActions from "../components/ActionButton/TableActions";
import Header from "../components/Header";
import Modal from "../components/Modal";
import Table from "../components/Table/Table";
import { useAuth } from "../context/AuthContext";
import useLibraryData from "../hooks/useLibraryData";
import Loading from "./Loading";

const Authors = () => {
	const { isAuthenticated } = useAuth();
	const [searchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
	const [editingRowId, setEditingRowId] = useState(null);
	const [editName, setEditName] = useState("");
	const [newName, setNewName] = useState("");
	const [showModal, setShowModal] = useState(false);

	// API state
	const { authors, isLoading, setAuthors } = useLibraryData({ searchTerm });

	// Sync searchTerm with query params
	useEffect(() => {
		const search = searchParams.get("search") || "";
		setSearchTerm(search);
	}, [searchParams]);

	const deleteAuthor = useCallback(
		(id, first_name, last_name) => {
			// show prompt

			if (window.confirm(`Are you sure you want to delete ${first_name} ${last_name}?`)) {
				setAuthors((prevAuthors) => prevAuthors.filter((author) => author.id !== id));
				setEditingRowId(null);
				setEditName("");
				setNewName("");
			}
		},
		[setAuthors]
	);
	const handleEdit = (author) => {
		setEditingRowId(author.id);
		setEditName(`${author.first_name} ${author.last_name}`);
	};

	const handleSave = useCallback(
		(id) => {
			const [first_name, ...last_name_parts] = editName.trim().split(" ");
			const last_name = last_name_parts.join(" ");

			setAuthors(
				authors.map((author) =>
					author.id === id
						? { ...author, first_name, last_name: last_name || author.last_name }
						: author
				)
			);

			setEditingRowId(null);
			setEditName("");
		},
		[authors, editName, setAuthors]
	);

	// filter based on search
	const filteredAuthors = useMemo(() => {
		if (!searchTerm.trim()) return authors;
		const lowerSearch = searchTerm.toLowerCase();
		return authors.filter((author) =>
			Object.values(author).some((value) => String(value).toLowerCase().includes(lowerSearch))
		);
	}, [authors, searchTerm]);

	const columns = useMemo(
		() => [
			{ header: "ID", accessorKey: "id" },
			{
				header: "Name",
				accessorFn: (row) => `${row.first_name} ${row.last_name}`,
				id: "name",
				cell: ({ row }) =>
					editingRowId === row.original.id ? (
						<input
							type="text"
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSave(row.original.id);
								} else if (e.key === "Escape") {
									handleCancel();
								}
							}}
							className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
							autoFocus
							tooltip="Enter to save"
						/>
					) : (
						`${row.original.first_name} ${row.original.last_name}`
					),
			},
			...(isAuthenticated
				? [
						{
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
									onDelete={() =>
										deleteAuthor(
											row.original.id,
											row.original.first_name,
											row.original.last_name
										)
									}
								/>
							),
						},
					]
				: []),
		],
		[deleteAuthor, editName, editingRowId, handleSave, isAuthenticated]
	);

	const handleCancel = () => {
		setEditingRowId(null);
		setEditName("");
	};

	const openModal = () => {
		setShowModal(true);
	};
	const closeModal = () => {
		setShowModal(false);
	};
	const handleAddNew = () => {
		if (newName.trim() === "") {
			return;
		}
		const [first_name, ...last_name_parts] = newName.trim().split(" ");
		const last_name = last_name_parts.join(" ");

		const newAuthor = {
			id: authors.length + 1,
			first_name,
			last_name: last_name || "",
		};

		setAuthors((prevAuthors) => [...prevAuthors, newAuthor]);

		setNewName("");
		closeModal();
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="py-6">
			<Header addNew={openModal} title="Authors List" />
			{authors.length > 0 ? <Table data={filteredAuthors} columns={columns} /> : <Loading />}
			<Modal
				title={"New Author"}
				save={handleAddNew}
				cancel={closeModal}
				show={showModal}
				setShow={setShowModal}>
				<div className="flex flex-col gap-2 w-full">
					<span>Author Name</span>
					<input
						type="text"
						placeholder="Name"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						className="border border-gray-300 rounded p-1 ps-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
					/>
					<span className="hidden text-red-500">Please enter a name</span>
				</div>
			</Modal>
		</div>
	);
};

export default Authors;
