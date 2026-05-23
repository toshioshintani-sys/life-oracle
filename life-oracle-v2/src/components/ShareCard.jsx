export function ShareCard({
  headline,
  mainText,
  subText,
  tagline,
  brand = 'ライフオラクル｜life-oracle.jp',
}) {
  return (
    <div className="share-card" role="img" aria-label={`${headline ?? ''} ${mainText ?? ''}`}>
      <div className="share-card-inner">
        <div className="share-card-brand">
          <span className="share-card-compass" aria-hidden="true">◐</span>
          <span className="share-card-brand-text">ライフオラクル</span>
        </div>

        {headline && <p className="share-card-headline">{headline}</p>}

        {mainText && <p className="share-card-main">{mainText}</p>}

        {subText && <p className="share-card-sub">{subText}</p>}

        {tagline && <p className="share-card-tagline">{tagline}</p>}

        <div className="share-card-divider" aria-hidden="true">
          <span>⊙</span>
        </div>

        <p className="share-card-footer">{brand}</p>
      </div>
    </div>
  );
}

export default ShareCard;
