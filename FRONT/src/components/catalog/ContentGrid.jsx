import React from 'react';
import { ContentCard } from './ContentCard';
import { EmptyState } from './EmptyState';

export const ContentGrid = ({ data, onClearFilters }) => {
  if (data.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item, index) => (
        <ContentCard key={item.id} item={item} index={index} />
      ))}
    </div>
  );
};