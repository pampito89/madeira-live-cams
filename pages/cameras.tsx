
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { cameras, CameraCategory } from '../components/cameraData';
import CameraCard from '../components/CameraCard';

const categories: CameraCategory[] = [
  'Mountains',
  'Beaches',
  'Towns',
  'North Coast',
  'South Coast',
  'East Coast',
  'West Coast',
  'Sunrise spots',
];

const CamerasPage: React.FC = () => {
  const [selected, setSelected] = useState<CameraCategory | null>(null);

  const filtered = selected
    ? cameras.filter((c) => c.category.includes(selected))
    : cameras;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-navy">Explore cameras</h1>
        <p className="text-sm text-slate-600">
          Filter webcams by region and type to quickly see mountains, beaches, towns, and sunrise spots across Madeira.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelected(selected === cat ? null : cat)}
              className={`px-3 py-1 rounded-full border text-xs ${
                selected === cat
                  ? 'bg-ocean text-white border-ocean'
                  : 'bg-panel text-slate-700 border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3 mt-4">
          {filtered.map((camera) => (
            <CameraCard key={camera.id} camera={camera} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CamerasPage;
