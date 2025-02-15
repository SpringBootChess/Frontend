import { useEffect, useState } from "react";
import { Cell } from "./Cell";
import axios from "axios";

export type PieceType = { name: string, color: string };

export const Board = () => {
    const [matchId, setMatchId] = useState<string>();
    const [board, setBoard] = useState<Record<string, PieceType | null>>({});
    const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);

    useEffect(() => {
        axios.post("http://localhost:8080/matches", { mode: "LOCAL" })
            .then((response) => {
                const { matchId, whitePieces, blackPieces } = response.data;

                setMatchId(matchId);
                setBoard(() => {
                    const newBoard: Record<string, PieceType | null> = {};
                    for (let row = 0; row < 8; row++) {
                        for (let col = 0; col < 8; col++) {
                            newBoard[`${row}-${col}`] = null;
                        }
                    }

                    whitePieces.forEach(({ row, col, name, color }: any) => {
                        newBoard[`${row}-${col}`] = { name, color };
                    });

                    blackPieces.forEach(({ row, col, name, color }: any) => {
                        newBoard[`${row}-${col}`] = { name, color };
                    });

                    return newBoard;
                });
            })
            .catch((e) => console.log("Error: ", e));
    }, []);

    const onClickCell = (row: number, col: number, piece?: PieceType | null) => {
        if (!selectedCell && piece) {
            setSelectedCell({ row, col });
            console.log("Selected cell: ", selectedCell)
        } else if (selectedCell) {

            axios.put(`http://localhost:8080/matches/move/${matchId}`, {
                matchId,
                startRow: selectedCell.row,
                startCol: selectedCell.col,
                endRow: row,
                endCol: col,
            })
                .then(() => {
                    setBoard((prevBoard) => {
                        const updatedBoard = { ...prevBoard };
                        updatedBoard[`${row}-${col}`] = updatedBoard[`${selectedCell.row}-${selectedCell.col}`];
                        updatedBoard[`${selectedCell.row}-${selectedCell.col}`] = null;
                        return updatedBoard;
                    });
                })
                .catch((error) => console.error("Error moving piece:", error))
                .finally(() => setSelectedCell(null));
        }
    };
    console.log("Selected cell: ", selectedCell)

    return (
        <div className="grid grid-cols-8 w-full max-w-[min(90vw,700px)] aspect-square">
            {Object.entries(board).map(([key, piece]) => {
                const [row, col] = key.split("-").map(Number);
                return (
                    <Cell
                        key={key}
                        row={row}
                        col={col}
                        piece={piece}
                        onClick={() => onClickCell(row, col, piece)}
                    />
                );
            })}
        </div>
    );
};
