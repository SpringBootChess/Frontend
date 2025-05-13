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
    kingPosition: { row: number, col: number } | null
}

export const Cell = ({ row, col, piece, onClick, pieceIcon, movingPiece, cellSize, selected, availableMoves, kingPosition }: CellProps) => {
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
    const isKingInCheck = kingPosition && kingPosition.row === row && kingPosition.col === col;

    console.log("Is King In Check: ", isKingInCheck)
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
                    className={`absolute  `}
                    style={{
                        ...animationStyle,
                        filter: isKingInCheck ? 'drop-shadow(0 0 10px rgba(255, 0, 0, 1)) drop-shadow(0 0 20px rgba(255, 0, 0, 0.7)) drop-shadow(0 0 30px rgba(255, 0, 0, 0.5))' : 'none',
                    }}
                />


            )}

        </div>
    );
};

