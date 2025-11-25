import { useMemo } from "react";
import TablePagination from "./TablePagination";

// Helper simple para convertir "snake_case" o "camelCase" a "Title Case"
const formatHeader = (key) => {
  return key
    .replace(/([A-Z])/g, " $1") // Camel to space
    .replace(/_/g, " ") // Snake to space
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first
};

export default function ReusableTable({
  columns,
  data,
  loading,
  pagination,
  total,
}) {
  // LOGICA DE COLUMNAS DINÁMICAS
  const finalColumns = useMemo(() => {
    // 1. Si no hay datos, solo mostramos las columnas definidas (menos las excluidas)
    if (!data || data.length === 0) {
      return columns.filter((col) => !col.exclude);
    }

    // 2. Identificar qué llaves ya están "gestionadas" por el schema
    // (Ya sea porque se muestran O porque se excluyeron explícitamente)
    const handledKeys = new Set();

    // Filtramos las columnas que sí se van a mostrar del schema original
    const visibleDefinedColumns = columns.filter((col) => {
      if (col.accessor) handledKeys.add(col.accessor);
      // Si la columna tiene 'exclude: true', no la mostramos,
      // pero la registramos como handled para que no se genere automáticamente.
      return !col.exclude;
    });

    // 3. Descubrir llaves nuevas en la data
    // Tomamos el primer registro como muestra del esquema de datos de la API
    const sampleRow = data[0];
    const allDataKeys = Object.keys(sampleRow);

    // 4. Crear columnas dinámicas para las llaves no gestionadas
    const dynamicColumns = allDataKeys
      .filter((key) => !handledKeys.has(key)) // Solo las que no están en el schema
      .map((key) => ({
        header: formatHeader(key), // Generamos un título bonito
        accessor: key,
        // Render por defecto seguro: si es objeto lo pasa a string para que React no explote
        render: (row) => {
          const val = row[key];
          if (val === null || val === undefined) return "-";
          if (typeof val === "object") return JSON.stringify(val); // Safety check
          return String(val);
        },
      }));

    // 5. Retornar la fusión: Primero las definidas, luego las nuevas
    return [...visibleDefinedColumns, ...dynamicColumns];
  }, [columns, data]);

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-white/70">Cargando...</div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center py-12 text-white/60">
        No hay registros.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/30">
            <tr className="text-left text-white/80">
              {finalColumns.map((col, index) => (
                <th
                  key={index}
                  className="px-4 py-3 whitespace-nowrap font-semibold"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-white/5">
                {finalColumns.map((col, colIndex) => (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className="px-4 py-3 whitespace-nowrap"
                  >
                    {/* Prioridad: 1. Función render, 2. Accessor, 3. Valor vacío */}
                    {col.render
                      ? col.render(row)
                      : col.accessor
                        ? row[col.accessor]
                        : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && data.length > 0 && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalRecords={total}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
