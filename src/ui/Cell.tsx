import { PieceType } from "./Board";

interface CellProps {
    row: number;
    col: number;
    piece?: PieceType | null;
    onClick: () => void;
    pieceIcon?: string | null;
    movingPiece: { start: { row: number, col: number }, end: { row: number, col: number }, piece: PieceType } | null;
    cellSize: number;
    selected: boolean;
    availableMoves: number[][];
}

export const Cell = ({ row, col, piece, onClick, pieceIcon, movingPiece, cellSize, selected, availableMoves }: CellProps) => {
    const isLightCell = (row + col) % 2 === 0;
    const cellColor = isLightCell ? "bg-[#f0d9b5]" : "bg-[#b58863]";

    const isMoving = movingPiece && movingPiece.start.row === row && movingPiece.start.col === col;
    const animationStyle = isMoving
        ? {
            transition: "transform 0.2s linear",
            transform: `translate(${cellSize * (movingPiece.end.col - movingPiece.start.col)}px, ${cellSize * (movingPiece.end.row - movingPiece.start.row)}px)`,
        }
        : {};

    const isMove = availableMoves.some(([moveRow, moveCol]) => moveRow === row && moveCol === col);

    return (
        <div
            style={{ backgroundColor: selected ? "#829769" : "", }}
            className={`relative flex items-center justify-center  ${cellColor}`}
            onClick={onClick}
        >

            {isMove && !piece && (
                <div
                    style={{
                        width: `${cellSize * 0.3}%`,
                        height: `${cellSize * 0.3}%`,
                        minWidth: "10px",
                        minHeight: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#829769",
                        position: "absolute",
                    }}
                />
            )}

            {isMove && piece && (
                <div
                    className="absolute"
                    style={{
                        width: `${cellSize}%`,
                        height: `${cellSize}%`,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "transparent",
                        border: `4px solid #829769`,
                        boxSizing: "border-box",
                    }}
                />
            )}

            {pieceIcon && (
                <img
                    src={pieceIcon}
                    alt={`${piece?.color} ${piece?.name}`}
                    className="absolute z-10"
                    style={{ ...animationStyle, pointerEvents: "none" }}
                />
            )}
        </div>
    );
};

