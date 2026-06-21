import { useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function ProductoVariantesTabla({ variantes, onNuevaVariante, onSubirImagen }) {
    const inputRefs = useRef({});

    if (!variantes || variantes.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="w-10 h-10 text-neutral-200 mx-auto mb-3" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m8 14V11" />
                </svg>
                <p className="text-sm text-neutral-400">Sin variantes registradas.</p>
                <button onClick={onNuevaVariante}
                    className="mt-3 text-xs text-neutral-700 font-medium underline
                               underline-offset-2 hover:text-neutral-900 transition-colors">
                    Agregar variante
                </button>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/50">
                        <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">
                            Imagen
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">
                            SKU
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">
                            Atributos
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-neutral-500 text-xs">
                            Stock
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {variantes.map(v => (
                        <tr key={v.id} className="hover:bg-neutral-50 transition-colors">

                            {/* Imagen */}
                            <td className="px-5 py-3">
                                <div className="relative group w-12 h-12">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden
                                                    bg-neutral-100 border border-neutral-200
                                                    flex items-center justify-center">
                                        {v.imagenUrl ? (
                                            <img src={`${API_URL}${v.imagenUrl}`}
                                                alt={v.sku}
                                                className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-5 h-5 text-neutral-300"
                                                fill="none" viewBox="0 0 24 24"
                                                stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16
                                                       m-2-2l1.586-1.586a2 2 0 012.828 0L20 14
                                                       m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0
                                                       00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Overlay hover */}
                                    <button
                                        onClick={() => inputRefs.current[v.id]?.click()}
                                        className="absolute inset-0 rounded-lg bg-black/50
                                                   opacity-0 group-hover:opacity-100
                                                   transition-opacity flex items-center
                                                   justify-center"
                                        title="Cambiar imagen">
                                        <svg className="w-4 h-4 text-white" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor"
                                            strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1
                                                   m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </button>

                                    <input
                                        ref={el => inputRefs.current[v.id] = el}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) onSubirImagen(v.id, file);
                                            e.target.value = "";
                                        }}
                                    />
                                </div>
                            </td>

                            {/* SKU */}
                            <td className="px-5 py-3 font-mono text-xs text-neutral-700">
                                {v.sku}
                            </td>

                            {/* Atributos */}
                            <td className="px-5 py-3">
                                {v.atributos && Object.keys(v.atributos).length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(v.atributos)
                                            .filter(([k]) => k !== "color_hex")
                                            .map(([nombre, valor]) => (
                                                <span key={nombre}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5
                                                               rounded-full text-xs bg-neutral-100
                                                               text-neutral-600">
                                                    <span className="text-neutral-400">{nombre}:</span>
                                                    {valor}
                                                </span>
                                            ))}
                                    </div>
                                ) : (
                                    <span className="text-neutral-300 text-xs">Sin atributos</span>
                                )}
                            </td>

                            {/* Stock */}
                            <td className="px-5 py-3">
                                {(v.stock ?? 0) === 0 ? (
                                    <span className="inline-flex items-center px-2 py-0.5
                                                     rounded-full text-xs bg-red-50
                                                     text-red-500 font-medium">
                                        Agotado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5
                                                     rounded-full text-xs bg-green-50
                                                     text-green-600 font-medium">
                                        {v.stock} pzs
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}