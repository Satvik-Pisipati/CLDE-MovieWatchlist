
export default function SkeletonCard(){
  return (
    <div className="media-card card skeleton">
      <div className="poster-wrap skeleton-box" />
      <div className="content">
        <div className="skeleton-line" style={{width:'80%'}} />
        <div className="skeleton-line" style={{width:'40%'}} />
        <div className="skeleton-button" />
      </div>
    </div>
  );
}
