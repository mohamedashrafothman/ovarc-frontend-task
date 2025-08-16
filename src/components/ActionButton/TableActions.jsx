import trash from "../../assets/Bin.png";
import pencil from "../../assets/Pencil.png";
import ActionButton from "../ActionButton/ActionButton";

const TableActions = ({ row, onEdit, onDelete }) => {
	return (
		<div className="flex space-x-2">
			<ActionButton icon={pencil} action={() => onEdit(row)} />
			<ActionButton icon={trash} action={onDelete} className="bg-red-500 hover:bg-red-600" />
		</div>
	);
};
export default TableActions;
