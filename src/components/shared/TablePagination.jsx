export default function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}) {
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex items-center justify-between text-sm text-white/70 mt-4">
      {/* Selector de tamaño y contador */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <span>Filas por pág:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg bg-black/40 border border-white/10 px-2 py-1 outline-none focus:ring-2 focus:ring-health-accent"
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs">
          {startRecord}-{endRecord} de {totalRecords}
        </p>
      </div>

      {/* Botones de navegación */}
      <div className="flex items-center gap-2">
        <span className="text-xs mr-2">
          Pág {currentPage} de {totalPages || 1}
        </span>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-black/40 transition"
        >
          Anterior
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-black/40 transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
