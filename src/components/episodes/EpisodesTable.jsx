import { useCallback } from "react";
import { apiClient } from "../../modules/api";
import { useTableData } from "../../modules/useTableData";
import ReusableTable from "../shared/ReusableTable";
import { clinicalAttentionColumns } from "./episodesConfig";

export default function EpisodesTable() {
  // Definimos la función de fetch. Usamos useCallback para que su referencia
  // no cambie en cada render y no dispare el useEffect del hook infinitamente.
  const fetchAttentions = useCallback(async ({ page, pageSize }) => {
    return await apiClient.getClinicalAttentions({ page, page_size: pageSize });
  }, []);

  const { data, loading, error, pagination, total } =
    useTableData(fetchAttentions);

  if (error)
    return <div className="text-red-400 text-center py-10">{error}</div>;

  return (
    <div className="relative">
      <ReusableTable
        columns={clinicalAttentionColumns}
        data={data}
        loading={loading}
        pagination={pagination}
        total={total}
      />
    </div>
  );
}
