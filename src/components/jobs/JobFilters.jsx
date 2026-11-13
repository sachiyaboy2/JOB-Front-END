import Icon from "../ui/Icon.jsx";
import {
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  WORK_MODES,
} from "../../utils/constants.js";

/**
 * The filter fields, shared between the desktop sidebar and the mobile
 * drawer. Every control has a real <label>.
 */
export function JobFilters({ filters, onChange, categories, districts, onReset }) {
  const set = (key) => (event) => {
    const value = event.target.value;
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="filter-category" className="label">
          Category
        </label>
        <select id="filter-category" value={filters.category} onChange={set("category")} className="field">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-district" className="label">
          District
        </label>
        <select id="filter-district" value={filters.district} onChange={set("district")} className="field">
          <option value="">All districts</option>
          {districts.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="label">Salary range (LKR / month)</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="filter-salary-min" className="sr-only">
              Minimum salary
            </label>
            <input
              id="filter-salary-min"
              type="number"
              min="0"
              step="5000"
              inputMode="numeric"
              value={filters.salaryMin}
              onChange={set("salaryMin")}
              placeholder="Min"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="filter-salary-max" className="sr-only">
              Maximum salary
            </label>
            <input
              id="filter-salary-max"
              type="number"
              min="0"
              step="5000"
              inputMode="numeric"
              value={filters.salaryMax}
              onChange={set("salaryMax")}
              placeholder="Max"
              className="field"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label htmlFor="filter-employment" className="label">
          Employment type
        </label>
        <select id="filter-employment" value={filters.employmentType} onChange={set("employmentType")} className="field">
          <option value="">Any type</option>
          {EMPLOYMENT_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-workmode" className="label">
          Work mode
        </label>
        <select id="filter-workmode" value={filters.workMode} onChange={set("workMode")} className="field">
          <option value="">Any mode</option>
          {WORK_MODES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-experience" className="label">
          Experience level
        </label>
        <select id="filter-experience" value={filters.experienceLevel} onChange={set("experienceLevel")} className="field">
          <option value="">Any experience</option>
          {EXPERIENCE_LEVELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-education" className="label">
          Education level
        </label>
        <select id="filter-education" value={filters.educationLevel} onChange={set("educationLevel")} className="field">
          <option value="">Any education</option>
          {EDUCATION_LEVELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <button type="button" onClick={onReset} className="btn btn-secondary w-full">
        <Icon name="refresh" size={15} />
        Clear all filters
      </button>
    </div>
  );
}

export default JobFilters;
