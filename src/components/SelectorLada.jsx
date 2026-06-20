const LADAS = [
  { codigo: "+52", pais: "México", bandera: "🇲🇽" },
  { codigo: "+1",  pais: "EE.UU. / Canadá", bandera: "🇺🇸" },
  { codigo: "+34", pais: "España", bandera: "🇪🇸" },
  { codigo: "+57", pais: "Colombia", bandera: "🇨🇴" },
  { codigo: "+54", pais: "Argentina", bandera: "🇦🇷" },
  { codigo: "+56", pais: "Chile", bandera: "🇨🇱" },
  { codigo: "+51", pais: "Perú", bandera: "🇵🇪" },
  { codigo: "+55", pais: "Brasil", bandera: "🇧🇷" },
];

export default function SelectorLada({ value, onChange, className = "" }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`px-2.5 py-2.5 text-sm border border-neutral-300 rounded-lg
                  bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900
                  ${className}`}>
      {LADAS.map(l => (
        <option key={l.codigo} value={l.codigo}>
          {l.bandera} {l.codigo}
        </option>
      ))}
    </select>
  );
}