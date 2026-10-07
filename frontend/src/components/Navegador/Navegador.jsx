import { useMemo, useState } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import "./Navegador.css";

function Navegador({
    data = [],
    searchKey,
    searchPlaceholder = "Buscar...",
    filters = [],
    onNew,
    newButtonText = "Nuevo",
    children,
}) {
    const [searchValue, setSearchValue] = useState("");
    const [filterValues, setFilterValues] = useState({});

    const filteredData = useMemo(() => {
        const normalizedSearch = searchValue
            .trim()
            .toLocaleLowerCase();

        return data.filter((item) => {
            const matchesSearch = !normalizedSearch || String(item[searchKey] ?? "")
                .toLocaleLowerCase()
                .includes(normalizedSearch);
            const matchesFilters = filters.every((filter) => {
                const selectedValue = filterValues[filter.key];
                return !selectedValue || item[filter.key] === selectedValue;
            });

            return matchesSearch && matchesFilters;
        });
    }, [data, searchValue, searchKey, filters, filterValues]);

    return (
        <>
            <section className="navegador">
                <div className="navegador-buscador">
                    <Search size={17} aria-hidden="true" />
                    <input
                        type="search"
                        aria-label={searchPlaceholder}
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                    />
                </div>

                {filters.map((filter) => {
                    const options = Array.isArray(filter.options) ? filter.options : [];

                    return (
                        <label className="navegador-filtro" key={filter.key}>
                            <span className="navegador-filtro-etiqueta">{filter.label}</span>
                            <select
                                aria-label={filter.label}
                                value={filterValues[filter.key] ?? ""}
                                onChange={(event) => {
                                    setFilterValues((current) => ({
                                        ...current,
                                        [filter.key]: event.target.value,
                                    }));
                                }}
                            >
                                <option value="">{filter.label}</option>
                                {options.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={15} aria-hidden="true" />
                        </label>
                    );
                })}

                {onNew && (
                    <button
                        type="button"
                        className="navegador-btn-nuevo"
                        onClick={onNew}
                    >
                        <Plus size={16} />
                        {newButtonText}
                    </button>
                )}
            </section>
            {typeof children === "function" ? children(filteredData) : children}
        </>
    );
}

export default Navegador;