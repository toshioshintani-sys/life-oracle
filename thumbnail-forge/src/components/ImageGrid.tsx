import type { GenerationResult, TextOverlay } from '../lib/types';
import { ImageCard } from './ImageCard';

interface Props {
  results: GenerationResult[];
  textOverlay?: TextOverlay;
}

export function ImageGrid({ results, textOverlay }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {results.map((result) => (
        <ImageCard key={result.modelId} result={result} textOverlay={textOverlay} />
      ))}
    </div>
  );
}
