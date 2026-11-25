import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { columnLabels, type Column } from "@/lib/payment-columns";

type ColumnWidths = Record<Column, number>;
type DropTarget = { column: Column; side: "before" | "after" };

const defaultWidths: ColumnWidths = {
  id: 184, customer: 244, amount: 144, status: 144, method: 208, created: 200,
};
const defaultOrder = Object.keys(columnLabels) as Column[];
export const minColumnWidth = 96;
export const maxColumnWidth = 720;
export const selectionColumnWidth = 48;
export const actionColumnWidth = 80;

function clampWidth(width: number) {
  return Math.min(maxColumnWidth, Math.max(minColumnWidth, Math.round(width)));
}

export function usePaymentColumns() {
  const [columns, setColumns] = useState(defaultOrder);
  const [hiddenColumns, setHiddenColumns] = useState<Column[]>([]);
  const [columnWidths, setColumnWidths] = useState<ColumnWidths | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [columnAnnouncement, setColumnAnnouncement] = useState("");
  const headerRow = useRef<HTMLTableRowElement>(null);
  const pointerGesture = useRef<AbortController | null>(null);
  useEffect(() => () => pointerGesture.current?.abort(), []);
  const widths = columnWidths ?? defaultWidths;
  const visibleColumns = columns.filter(column => !hiddenColumns.includes(column));
  const tableWidth = visibleColumns.reduce((total, column) => total + widths[column], selectionColumnWidth + actionColumnWidth);

  function measureWidths(): ColumnWidths {
    const measured = { ...widths };
    for (const cell of Array.from(headerRow.current?.cells ?? [])) {
      if (cell.dataset.column) {
        measured[cell.dataset.column as Column] = cell.getBoundingClientRect().width;
      }
    }
    return measured;
  }

  function moveColumn(column: Column, target: DropTarget) {
    if (column === target.column) return;
    const next = columns.filter(item => item !== column);
    const index = next.indexOf(target.column) + (target.side === "after" ? 1 : 0);
    next.splice(index, 0, column);
    setColumns(next);
    const visibleOrder = next.filter(item => !hiddenColumns.includes(item));
    setColumnAnnouncement(`${columnLabels[column]} moved to column ${visibleOrder.indexOf(column) + 1} of ${visibleOrder.length}.`);
  }

  function trackPointer(
    event: ReactPointerEvent<HTMLElement>,
    onMove: (event: PointerEvent) => void,
    onDrop?: (event: PointerEvent) => void,
  ) {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    pointerGesture.current?.abort();
    const gesture = new AbortController();
    pointerGesture.current = gesture;
    const options = { signal: gesture.signal };
    const id = event.pointerId;
    const finish = () => {
      gesture.abort();
      pointerGesture.current = null;
      setDropTarget(null);
    };
    window.addEventListener("pointermove", move => {
      if (move.pointerId === id) onMove(move);
    }, options);
    window.addEventListener("pointerup", up => {
      if (up.pointerId !== id) return;
      onDrop?.(up);
      finish();
    }, options);
    window.addEventListener("pointercancel", cancel => {
      if (cancel.pointerId === id) finish();
    }, options);
    window.addEventListener("blur", finish, options);
  }

  function findDropTarget(event: PointerEvent, source: Column): DropTarget | null {
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLTableCellElement>("th[data-column]");
    if (!cell || cell.parentElement !== headerRow.current) return null;
    const column = cell.dataset.column as Column;
    if (column === source) return null;
    const bounds = cell.getBoundingClientRect();
    return { column, side: event.clientX < bounds.left + bounds.width / 2 ? "before" : "after" };
  }

  function startReorder(event: ReactPointerEvent<HTMLElement>, column: Column) {
    trackPointer(event, move => {
      setDropTarget(findDropTarget(move, column));
    }, up => {
      const target = findDropTarget(up, column);
      if (target) moveColumn(column, target);
    });
  }

  function reorderWithKeyboard(column: Column, index: number, key: string) {
    const left = key === "ArrowLeft";
    const neighbor = visibleColumns[index + (left ? -1 : 1)];
    if (neighbor) moveColumn(column, { column: neighbor, side: left ? "before" : "after" });
  }

  function startResize(event: ReactPointerEvent<HTMLElement>, column: Column) {
    const container = headerRow.current?.closest('[data-slot="table-container"]');
    const startScroll = container?.scrollLeft ?? 0;
    const startX = event.clientX;
    const measured = measureWidths();
    trackPointer(event, move => {
      const scrollDelta = (container?.scrollLeft ?? 0) - startScroll;
      const width = clampWidth(measured[column] + move.clientX - startX + scrollDelta);
      setColumnWidths({ ...measured, [column]: width });
    });
  }

  function resizeWithKeyboard(column: Column, key: string) {
    const measured = measureWidths();
    const delta = key === "ArrowLeft" ? -16 : 16;
    setColumnWidths({ ...measured, [column]: clampWidth(measured[column] + delta) });
  }

  function setColumnVisible(column: Column, checked: boolean) {
    setHiddenColumns(previous => {
      if (checked) return previous.filter(item => item !== column);
      if (previous.length >= columns.length - 1) return previous;
      return [...previous, column];
    });
  }

  return {
    columns, visibleColumns, widths, columnWidths, tableWidth, headerRow,
    dropTarget, columnAnnouncement, startReorder, reorderWithKeyboard,
    startResize, resizeWithKeyboard, setColumnVisible,
  };
}
