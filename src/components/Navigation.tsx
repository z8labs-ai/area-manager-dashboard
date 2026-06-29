type NavigationProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

const navItems = [
  { page: "dashboard", label: "Dashboard" },
  { page: "map", label: "Map" },
  { page: "planner", label: "Planner" },
  { page: "stores", label: "Stores" },
];

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Monthly Store Walks</p>
        <h1>Area Manager Dashboard</h1>
      </div>

      <nav className="nav-tabs" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            className={currentPage === item.page ? "active" : ""}
            key={item.page}
            onClick={() => onNavigate(item.page)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
