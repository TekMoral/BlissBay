// components/HorizontalScroll.jsx
import React from 'react';

const HorizontalScroll = ({ title, items, renderItem, loading, error }) => {
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="min-w-[280px] h-[400px] bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {items.map((item) => (
              <div key={item._id} className="min-w-[280px] w-[280px] flex-shrink-0">
                {renderItem(item)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalScroll;
