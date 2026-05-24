import type { GenerationResult } from '../lib/types';
import { ImageCard } from './ImageCard';

interface Props {
  results: GenerationResult[];
}

export function ImageGrid({ results }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {results.map((result) => (
        <ImageCard key={result.modelId} result={result} />
      ))}
    </div>
  );
}
