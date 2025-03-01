import { useEffect, useRef, useState } from "react";
import { Cell } from "./Cell";
import axios from "axios";

export type PieceType = { name: string, color: string };
type SoundType = "capture" | "move";

const PIECE_ICONS: Record<string, Record<string, string>> = {
    BLACK: {
        Pawn: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PHBhdGggc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJNMjIuNSA5YTQgNCAwIDAgMC0zLjIyIDYuMzggNi40OCA2LjQ4IDAgMCAwLS44NyAxMC42NWMtMyAxLjA2LTcuNDEgNS41NS03LjQxIDEzLjQ3aDIzYzAtNy45Mi00LjQxLTEyLjQxLTcuNDEtMTMuNDdhNi40NiA2LjQ2IDAgMCAwLS44Ny0xMC42NUE0LjAxIDQuMDEgMCAwIDAgMjIuNSA5eiIvPjwvc3ZnPg==",    // Peón negro
        Knight: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGZpbGw9IiMwMDAiIGQ9Ik0yMiAxMGMxMC41IDEgMTYuNSA4IDE2IDI5SDE1YzAtOSAxMC02LjUgOC0yMSIvPjxwYXRoIGZpbGw9IiMwMDAiIGQ9Ik0yNCAxOGMuMzggMi45MS01LjU1IDcuMzctOCA5LTMgMi0yLjgyIDQuMzQtNSA0LTEuMDQtLjk0IDEuNDEtMy4wNCAwLTMtMSAwIC4xOSAxLjIzLTEgMi0xIDAtNCAxLTQtNCAwLTIgNi0xMiA2LTEyczEuODktMS45IDItMy41Yy0uNzMtMS0uNS0yLS41LTMgMS0xIDMgMi41IDMgMi41aDJzLjc4LTIgMi41LTNjMSAwIDEgMyAxIDMiLz48cGF0aCBmaWxsPSIjZWNlY2VjIiBzdHJva2U9IiNlY2VjZWMiIGQ9Ik05LjUgMjUuNWEuNS41IDAgMSAxLTEgMCAuNS41IDAgMSAxIDEgMHptNS40My05Ljc1YS41IDEuNSAzMCAxIDEtLjg2LS41LjUgMS41IDMwIDEgMSAuODYuNXoiLz48cGF0aCBmaWxsPSIjZWNlY2VjIiBzdHJva2U9Im5vbmUiIGQ9Im0yNC41NSAxMC40LS40NSAxLjQ1LjUuMTVjMy4xNSAxIDUuNjUgMi40OSA3LjkgNi43NVMzNS43NSAyOS4wNiAzNS4yNSAzOWwtLjA1LjVoMi4yNWwuMDUtLjVjLjUtMTAuMDYtLjg4LTE2Ljg1LTMuMjUtMjEuMzQtMi4zNy00LjQ5LTUuNzktNi42NC05LjE5LTcuMTZsLS41MS0uMXoiLz48L2c+PC9zdmc+",  // Caballo negro
        Bishop: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxnIGZpbGw9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJidXR0Ij48cGF0aCBkPSJNOSAzNmMzLjQtMSAxMC4xLjQgMTMuNS0yIDMuNCAyLjQgMTAuMSAxIDEzLjUgMiAwIDAgMS42LjUgMyAyLS43IDEtMS42IDEtMyAuNS0zLjQtMS0xMC4xLjUtMTMuNS0xLTMuNCAxLjUtMTAuMSAwLTEzLjUgMS0xLjQuNS0yLjMuNS0zLS41IDEuNC0yIDMtMiAzLTJ6Ii8+PHBhdGggZD0iTTE1IDMyYzIuNSAyLjUgMTIuNSAyLjUgMTUgMCAuNS0xLjUgMC0yIDAtMiAwLTIuNS0yLjUtNC0yLjUtNCA1LjUtMS41IDYtMTEuNS01LTE1LjUtMTEgNC0xMC41IDE0LTUgMTUuNSAwIDAtMi41IDEuNS0yLjUgNCAwIDAtLjUuNSAwIDJ6Ii8+PHBhdGggZD0iTTI1IDhhMi41IDIuNSAwIDEgMS01IDAgMi41IDIuNSAwIDEgMSA1IDB6Ii8+PC9nPjxwYXRoIHN0cm9rZT0iI2VjZWNlYyIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgZD0iTTE3LjUgMjZoMTBNMTUgMzBoMTVtLTcuNS0xNC41djVNMjAgMThoNSIvPjwvZz48L3N2Zz4=",  // Alfil negro
        Rook: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJidXR0IiBkPSJNOSAzOWgyN3YtM0g5djN6bTMuNS03IDEuNS0yLjVoMTdsMS41IDIuNWgtMjB6bS0uNSA0di00aDIxdjRIMTJ6Ii8+PHBhdGggc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGQ9Ik0xNCAyOS41di0xM2gxN3YxM0gxNHoiLz48cGF0aCBzdHJva2UtbGluZWNhcD0iYnV0dCIgZD0iTTE0IDE2LjUgMTEgMTRoMjNsLTMgMi41SDE0ek0xMSAxNFY5aDR2Mmg1VjloNXYyaDVWOWg0djVIMTF6Ii8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWNlY2VjIiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2Utd2lkdGg9IjEiIGQ9Ik0xMiAzNS41aDIxbS0yMC00aDE5bS0xOC0yaDE3bS0xNy0xM2gxN00xMSAxNGgyMyIvPjwvZz48L3N2Zz4=",    // Torre negra
        Queen: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxnIHN0cm9rZT0ibm9uZSI+PGNpcmNsZSBjeD0iNiIgY3k9IjEyIiByPSIyLjc1Ii8+PGNpcmNsZSBjeD0iMTQiIGN5PSI5IiByPSIyLjc1Ii8+PGNpcmNsZSBjeD0iMjIuNSIgY3k9IjgiIHI9IjIuNzUiLz48Y2lyY2xlIGN4PSIzMSIgY3k9IjkiIHI9IjIuNzUiLz48Y2lyY2xlIGN4PSIzOSIgY3k9IjEyIiByPSIyLjc1Ii8+PC9nPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJidXR0IiBkPSJNOSAyNmM4LjUtMS41IDIxLTEuNSAyNyAwbDIuNS0xMi41TDMxIDI1bC0uMy0xNC4xLTUuMiAxMy42LTMtMTQuNS0zIDE0LjUtNS4yLTEzLjZMMTQgMjUgNi41IDEzLjUgOSAyNnoiLz48cGF0aCBzdHJva2UtbGluZWNhcD0iYnV0dCIgZD0iTTkgMjZjMCAyIDEuNSAyIDIuNSA0IDEgMS41IDEgMSAuNSAzLjUtMS41IDEtMS41IDIuNS0xLjUgMi41LTEuNSAxLjUuNSAyLjUuNSAyLjUgNi41IDEgMTYuNSAxIDIzIDAgMCAwIDEuNS0xIDAtMi41IDAgMCAuNS0xLjUtMS0yLjUtLjUtMi41LS41LTIgLjUtMy41IDEtMiAyLjUtMiAyLjUtNC04LjUtMS41LTE4LjUtMS41LTI3IDB6Ii8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIGQ9Ik0xMSAzOC41YTM1IDM1IDEgMCAwIDIzIDAiLz48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiNlY2VjZWMiIGQ9Ik0xMSAyOWEzNSAzNSAxIDAgMSAyMyAwbS0yMS41IDIuNWgyMG0tMjEgM2EzNSAzNSAxIDAgMCAyMiAwbS0yMyAzYTM1IDM1IDEgMCAwIDI0IDAiLz48L2c+PC9zdmc+",   // Reina negra
        King: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGQ9Ik0yMi41IDExLjZWNiIvPjxwYXRoIGZpbGw9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBkPSJNMjIuNSAyNXM0LjUtNy41IDMtMTAuNWMwIDAtMS0yLjUtMy0yLjVzLTMgMi41LTMgMi41Yy0xLjUgMyAzIDEwLjUgMyAxMC41Ii8+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTExLjUgMzdhMjIuMyAyMi4zIDAgMCAwIDIxIDB2LTdzOS00LjUgNi0xMC41Yy00LTYuNS0xMy41LTMuNS0xNiA0VjI3di0zLjVjLTMuNS03LjUtMTMtMTAuNS0xNi00LTMgNiA1IDEwIDUgMTBWMzd6Ii8+PHBhdGggc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgZD0iTTIwIDhoNSIvPjxwYXRoIHN0cm9rZT0iI2VjZWNlYyIgZD0iTTMyIDI5LjVzOC41LTQgNi05LjdDMzQuMSAxNCAyNSAxOCAyMi41IDI0LjZ2Mi4xLTIuMUMyMCAxOCA5LjkgMTQgNyAxOS45Yy0yLjUgNS42IDQuOCA5IDQuOCA5Ii8+PHBhdGggc3Ryb2tlPSIjZWNlY2VjIiBkPSJNMTEuNSAzMGM1LjUtMyAxNS41LTMgMjEgMG0tMjEgMy41YzUuNS0zIDE1LjUtMyAyMSAwbS0yMSAzLjVjNS41LTMgMTUuNS0zIDIxIDAiLz48L2c+PC9zdmc+",    // Rey negro
    },
    WHITE: {
        Pawn: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PHBhdGggZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41IiBkPSJNMjIuNSA5Yy0yLjIxIDAtNCAxLjc5LTQgNCAwIC44OS4yOSAxLjcxLjc4IDIuMzhDMTcuMzMgMTYuNSAxNiAxOC41OSAxNiAyMWMwIDIuMDMuOTQgMy44NCAyLjQxIDUuMDMtMyAxLjA2LTcuNDEgNS41NS03LjQxIDEzLjQ3aDIzYzAtNy45Mi00LjQxLTEyLjQxLTcuNDEtMTMuNDcgMS40Ny0xLjE5IDIuNDEtMyAyLjQxLTUuMDMgMC0yLjQxLTEuMzMtNC41LTMuMjgtNS42Mi40OS0uNjcuNzgtMS40OS43OC0yLjM4IDAtMi4yMS0xLjc5LTQtNC00eiIvPjwvc3ZnPg==",    // Peón blanco
        Knight: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMiAxMGMxMC41IDEgMTYuNSA4IDE2IDI5SDE1YzAtOSAxMC02LjUgOC0yMSIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yNCAxOGMuMzggMi45MS01LjU1IDcuMzctOCA5LTMgMi0yLjgyIDQuMzQtNSA0LTEuMDQyLS45NCAxLjQxLTMuMDQgMC0zLTEgMCAuMTkgMS4yMy0xIDItMSAwLTQuMDAzIDEtNC00IDAtMiA2LTEyIDYtMTJzMS44OS0xLjkgMi0zLjVjLS43My0uOTk0LS41LTItLjUtMyAxLTEgMyAyLjUgMyAyLjVoMnMuNzgtMS45OTIgMi41LTNjMSAwIDEgMyAxIDMiLz48cGF0aCBmaWxsPSIjMDAwIiBkPSJNOS41IDI1LjVhLjUuNSAwIDEgMS0xIDAgLjUuNSAwIDEgMSAxIDB6bTUuNDMzLTkuNzVhLjUgMS41IDMwIDEgMS0uODY2LS41LjUgMS41IDMwIDEgMSAuODY2LjV6Ii8+PC9nPjwvc3ZnPg==",  // Caballo blanco
        Bishop: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxnIGZpbGw9IiNmZmYiIHN0cm9rZS1saW5lY2FwPSJidXR0Ij48cGF0aCBkPSJNOSAzNmMzLjM5LS45NyAxMC4xMS40MyAxMy41LTIgMy4zOSAyLjQzIDEwLjExIDEuMDMgMTMuNSAyIDAgMCAxLjY1LjU0IDMgMi0uNjguOTctMS42NS45OS0zIC41LTMuMzktLjk3LTEwLjExLjQ2LTEzLjUtMS0zLjM5IDEuNDYtMTAuMTEuMDMtMTMuNSAxLTEuMzUuNDktMi4zMi40Ny0zLS41IDEuMzUtMS45NCAzLTIgMy0yeiIvPjxwYXRoIGQ9Ik0xNSAzMmMyLjUgMi41IDEyLjUgMi41IDE1IDAgLjUtMS41IDAtMiAwLTIgMC0yLjUtMi41LTQtMi41LTQgNS41LTEuNSA2LTExLjUtNS0xNS41LTExIDQtMTAuNSAxNC01IDE1LjUgMCAwLTIuNSAxLjUtMi41IDQgMCAwLS41LjUgMCAyeiIvPjxwYXRoIGQ9Ik0yNSA4YTIuNSAyLjUgMCAxIDEtNSAwIDIuNSAyLjUgMCAxIDEgNSAweiIvPjwvZz48cGF0aCBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBkPSJNMTcuNSAyNmgxME0xNSAzMGgxNW0tNy41LTE0LjV2NU0yMCAxOGg1Ii8+PC9nPjwvc3ZnPg==",  // Alfil blanco
        Rook: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJidXR0IiBkPSJNOSAzOWgyN3YtM0g5djN6bTMtM3YtNGgyMXY0SDEyem0tMS0yMlY5aDR2Mmg1VjloNXYyaDVWOWg0djUiLz48cGF0aCBkPSJtMzQgMTQtMyAzSDE0bC0zLTMiLz48cGF0aCBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgZD0iTTMxIDE3djEyLjVIMTRWMTciLz48cGF0aCBkPSJtMzEgMjkuNSAxLjUgMi41aC0yMGwxLjUtMi41Ii8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgZD0iTTExIDE0aDIzIi8+PC9nPjwvc3ZnPg==",    // Torre blanca
        Queen: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0iI2ZmZiIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIGQ9Ik04IDEyYTIgMiAwIDEgMS00IDAgMiAyIDAgMSAxIDQgMHptMTYuNS00LjVhMiAyIDAgMSAxLTQgMCAyIDIgMCAxIDEgNCAwek00MSAxMmEyIDIgMCAxIDEtNCAwIDIgMiAwIDEgMSA0IDB6TTE2IDguNWEyIDIgMCAxIDEtNCAwIDIgMiAwIDEgMSA0IDB6TTMzIDlhMiAyIDAgMSAxLTQgMCAyIDIgMCAxIDEgNCAweiIvPjxwYXRoIHN0cm9rZS1saW5lY2FwPSJidXR0IiBkPSJNOSAyNmM4LjUtMS41IDIxLTEuNSAyNyAwbDItMTItNyAxMVYxMWwtNS41IDEzLjUtMy0xNS0zIDE1LTUuNS0xNFYyNUw3IDE0bDIgMTJ6Ii8+PHBhdGggc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIGQ9Ik05IDI2YzAgMiAxLjUgMiAyLjUgNCAxIDEuNSAxIDEgLjUgMy41LTEuNSAxLTEuNSAyLjUtMS41IDIuNS0xLjUgMS41LjUgMi41LjUgMi41IDYuNSAxIDE2LjUgMSAyMyAwIDAgMCAxLjUtMSAwLTIuNSAwIDAgLjUtMS41LTEtMi41LS41LTIuNS0uNS0yIC41LTMuNSAxLTIgMi41LTIgMi41LTQtOC41LTEuNS0xOC41LTEuNS0yNyAweiIvPjxwYXRoIGZpbGw9Im5vbmUiIGQ9Ik0xMS41IDMwYzMuNS0xIDE4LjUtMSAyMiAwTTEyIDMzLjVjNi0xIDE1LTEgMjEgMCIvPjwvZz48L3N2Zz4=",   // Reina blanca
        King: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NSA0NSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjUiPjxwYXRoIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGQ9Ik0yMi41IDExLjYzVjZNMjAgOGg1Ii8+PHBhdGggZmlsbD0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIGQ9Ik0yMi41IDI1czQuNS03LjUgMy0xMC41YzAgMC0xLTIuNS0zLTIuNXMtMyAyLjUtMyAyLjVjLTEuNSAzIDMgMTAuNSAzIDEwLjUiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTEuNSAzN2M1LjUgMy41IDE1LjUgMy41IDIxIDB2LTdzOS00LjUgNi0xMC41Yy00LTYuNS0xMy41LTMuNS0xNiA0VjI3di0zLjVjLTMuNS03LjUtMTMtMTAuNS0xNi00LTMgNiA1IDEwIDUgMTBWMzd6Ii8+PHBhdGggZD0iTTExLjUgMzBjNS41LTMgMTUuNS0zIDIxIDBtLTIxIDMuNWM1LjUtMyAxNS41LTMgMjEgMG0tMjEgMy41YzUuNS0zIDE1LjUtMyAyMSAwIi8+PC9nPjwvc3ZnPg==",    // Rey blanco
    },
};


export const Board = () => {
    const [matchId, setMatchId] = useState<string>();
    const [board, setBoard] = useState<Record<string, PieceType | null>>({});
    const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
    const [movingPiece, setMovingPiece] = useState<{ start: { row: number, col: number }, end: { row: number, col: number }, piece: PieceType } | null>(null);
    const [moves, setMoves] = useState<number[][]>([]); // Lista de movimientos disponibles

    const [turn, setTurn] = useState<string>("");

    const boardRef = useRef<HTMLDivElement>(null);
    const [cellSize, setCellSize] = useState<number>(92);

    const moveSound = new Audio("/move.mp3");
    const captureSound = new Audio("/capture.mp3");

    const passTurn = () => {
        setTurn(turn === "WHITE" ? "BLACK" : "WHITE");
    };

    const playSound = (sound: SoundType) => {
        if (sound === "move") {
            moveSound.play();
        } else if (sound === "capture") {
            captureSound.play();
        }
    };

    useEffect(() => {
        axios.post(`${import.meta.env.VITE_API_URL}matches`, { mode: "LOCAL" })
            .then((response) => {
                const { matchId, whitePieces, blackPieces, turn } = response.data;
                setMatchId(matchId);
                setTurn(turn);
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

    useEffect(() => {
        if (!boardRef.current) return;

        const updateSize = () => {
            setCellSize(boardRef.current!.offsetWidth / 8);
        };

        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(boardRef.current);
        updateSize();

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (selectedCell) {
            axios.post(`${import.meta.env.VITE_API_URL}matches/move/${matchId}`, {
                row: selectedCell?.row,
                col: selectedCell?.col
            })
                .then((response) => {
                    setMoves(response.data.moves);
                })
                .catch((e) => console.log("Error: ", e));
        }

    }, [setSelectedCell, selectedCell])

    const onClickCell = (row: number, col: number, piece?: PieceType | null) => {
        if (!selectedCell && piece && turn === board[`${row}-${col}`]?.color) {
            setSelectedCell({ row, col });
        } else if (selectedCell) {


            if (board[`${row}-${col}`] && board[`${row}-${col}`]?.color === board[`${selectedCell.row}-${selectedCell.col}`]?.color) {
                setMoves([])
                setSelectedCell({ row: row, col: col })
                return
            }

            axios.put(`${import.meta.env.VITE_API_URL}matches/move/${matchId}`, {
                startRow: selectedCell.row,
                startCol: selectedCell.col,
                endRow: row,
                endCol: col,
            })
                .then(() => {
                    passTurn();
                    setMovingPiece({
                        start: selectedCell,
                        end: { row, col },
                        piece: board[`${selectedCell.row}-${selectedCell.col}`]!,
                    });

                    setSelectedCell(null);
                    setMoves([])

                    setTimeout(() => {
                        setBoard((prevBoard) => {
                            const updatedBoard = { ...prevBoard };
                            const movingPiece = updatedBoard[`${selectedCell.row}-${selectedCell.col}`];

                            updatedBoard[`${selectedCell.row}-${selectedCell.col}`] = null;

                            if (updatedBoard[`${row}-${col}`] !== null) {
                                console.log("Capturando pieza en:", row, col);
                                playSound("capture");
                            } else {
                                playSound("move");
                            }

                            updatedBoard[`${row}-${col}`] = movingPiece;
                            return updatedBoard;
                        });

                        setMovingPiece(null);
                    }, 100);
                })
                .catch((e) => {
                    setMovingPiece(null);
                    console.error("Error al mover la pieza:", e);
                });
        }
    };

    return (
        <div className="grid grid-cols-8 grid-rows-8 w-full max-w-[min(90vw,736px)] aspect-square relative">
            {Object.entries(board).map(([key, piece]) => {
                const [row, col] = key.split("-").map(Number);
                const pieceIcon = piece ? PIECE_ICONS[piece.color][piece.name] : null;

                return (
                    <Cell
                        key={`cell-${key}`}
                        row={row}
                        col={col}
                        piece={piece}
                        onClick={() => onClickCell(row, col, piece)}
                        pieceIcon={pieceIcon}
                        movingPiece={movingPiece}
                        cellSize={cellSize}
                        selected={selectedCell?.row === row && selectedCell.col === col}
                        availableMoves={moves}
                    />
                );
            })}
        </div>
    );
};
