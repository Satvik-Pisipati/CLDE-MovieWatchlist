// Replace the file with this version

export default function FiltersBar({
  sort,
  setSort,
  type,
  setType,
  category,          // new
  setCategory,       // new
  categories = [],   // new: array of {id, name}
}) {
  return (
    <div className="filters-bar card">
      <div className="filters-row">
        <label>
          <span>Type</span>
          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="movie">Movie</option>
            <option value="tv">TV</option>
          </select>
        </label>

        <label>
          <span>Sort by</span>
          <select
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="popularity">Popularity</option>
            <option value="date">Date</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
          </select>
        </label>

        <label>
          <span>Categories</span>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All</option>
            {categories.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
