import { PieceType } from "./Board";

const PIECE_ICONS: Record<string, string> = {
    Pawn: "♙",
    Knight: "♘",
    Bishop: "♗",
    Rook: "♖",
    Queen: "♕",
    King: "♔",
};

interface CellProps {
    row: number;
    col: number;
    piece?: PieceType | null;
    onClick: () => void;
}

export const Cell = ({ row, col, piece, onClick }: CellProps) => {
    const isLightCell = (row + col) % 2 === 0;
    const bgColor = isLightCell ? "bg-[#8B5A2B]" : "bg-[#DEB887]";
    const textColor = piece?.color === "BLACK" ? "text-black" : "text-amber-50";

    return (
        <div
            className={`flex items-center justify-center aspect-square text-lg font-bold ${bgColor} ${textColor} cursor-pointer`}
            onClick={onClick}
        >
            <p className="text-5xl">{piece ? PIECE_ICONS[piece.name] || "?" : null}</p>
        </div>
    );
};
