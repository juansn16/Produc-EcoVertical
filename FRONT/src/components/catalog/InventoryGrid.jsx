import React from 'react';
import InventoryCard from './InventoryCard';
import EmptyState from './EmptyState';
import { Package } from 'lucide-react';

const InventoryGrid = ({ data, onClearFilters, onEdit, onDelete, onUpdateStock, onRecordUsage, onShowHistory, canEdit, canDelete, canUpdateStock, canRecordUsage }) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        type="inventory"
        icon={<Package size={48} className="text-gray-400" />}
        title="No se encontraron elementos en el inventario"
        description="Intenta ajustar los filtros o términos de búsqueda para encontrar lo que buscas."
        actionText="Limpiar Filtros"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map((item) => (
        <InventoryCard
          key={item.id}
          item={item}
          onEdit={() => onEdit && onEdit(item)}
          onDelete={() => onDelete && onDelete(item.id)}
          onUpdateStock={() => onUpdateStock && onUpdateStock(item)}
          onRecordUsage={() => onRecordUsage && onRecordUsage(item)}
          onShowHistory={() => onShowHistory && onShowHistory(item)}
          canEdit={canEdit}
          canDelete={canDelete}
          canUpdateStock={canUpdateStock}
          canRecordUsage={canRecordUsage}
        />
      ))}
    </div>
  );
};

export default InventoryGrid;