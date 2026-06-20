import { useState, useEffect } from "react";
import { fetchProveedores } from "../../../api/proveedores.js";
import { fetchProductos, fetchProducto } from "../../../api/productos.js";

function lineaVacia() {
    return {
        idProducto: "",
        idVariante: "",   // ← variante seleccionada del catálogo
        sku: "",
        cantidad: "",
        costoUnitario: "",
    };
}

export function useOrdenCompra() {
    const [variantesPorProducto, setVariantesPorProducto] = useState({});
    const [proveedores, setProveedores] = useState([]);
    const [todosProductos, setTodosProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errorData, setErrorData] = useState("");

    // Campos de la orden
    const [idProveedor, setIdProveedor] = useState("");
    const [lineas, setLineas] = useState([lineaVacia()]);
    const [esLote, setEsLote] = useState(false);
    const [costoLote, setCostoLote] = useState("");
    const [piezasLote, setPiezasLote] = useState("");
    const [flete, setFlete] = useState("0");

    useEffect(() => {
        Promise.all([
            fetchProveedores(),
            fetchProductos(),
        ]).then(([p, pr, g, t, c]) => {
            setProveedores(p);
            setTodosProductos(pr);
        }).catch(() => setErrorData("Error al cargar datos"))
            .finally(() => setLoadingData(false));
    }, []);

    async function handleProveedorChange(nuevoId) {
        setIdProveedor(nuevoId);
        setLineas([lineaVacia()]);
        setVariantesPorProducto({});

        if (!nuevoId) { setProductosFiltrados([]); return; }

        const filtrados = todosProductos.filter(
            p => String(p.idProveedor) === String(nuevoId)
        );
        setProductosFiltrados(filtrados);

        if (filtrados.length === 0) return;

        // Cargar variantes de todos los productos del proveedor
        const variantes = {};
        await Promise.all(filtrados.map(async p => {
            try {
                const prod = await fetchProducto(p.id);
                variantes[String(p.id)] = prod.variantes ?? [];
            } catch { }
        }));
        setVariantesPorProducto({ ...variantes });
    }

    function handleLinea(idx, field, value) {
        console.log("handleLinea:", idx, field, value);
        const nuevas = [...lineas];
        nuevas[idx] = { ...nuevas[idx], [field]: value };
        setLineas(nuevas);
    }

    function agregarLinea() { setLineas([...lineas, lineaVacia()]); }
    function eliminarLinea(idx) { if (lineas.length > 1) setLineas(lineas.filter((_, i) => i !== idx)); }

    // Cálculos derivados
    const costoPorPieza = esLote && costoLote && piezasLote && Number(piezasLote) > 0
        ? (Number(costoLote) + Number(flete)) / Number(piezasLote)
        : null;

    const sumaLineas = lineas.reduce((s, l) => s + (Number(l.cantidad) || 0), 0);

    const totalNormal = lineas.reduce(
        (s, l) => s + (Number(l.cantidad) || 0) * (Number(l.costoUnitario) || 0), 0
    );

    const totalOrden = esLote
        ? (Number(costoLote) || 0) + (Number(flete) || 0)
        : totalNormal + (Number(flete) || 0);

    function buildPayload() {
        return {
            idProveedor: Number(idProveedor),
            esLote,
            costoLote: esLote ? Number(costoLote) : null,
            piezasLote: esLote ? Number(piezasLote) : null,
            flete: Number(flete) || 0,
            detalles: lineas.map(l => ({
                idVariante: Number(l.idVariante),   // ← variante existente
                cantidad: Number(l.cantidad),
                costoUnitario: esLote ? null : Number(l.costoUnitario),
            })),
        };
    }

    return {
        // Catálogos
        proveedores, productosFiltrados,
        loadingData, errorData, variantesPorProducto,

        // Estado de la orden
        idProveedor, lineas, esLote, costoLote, piezasLote, flete,

        // Setters simples
        setCostoLote, setPiezasLote, setFlete,
        setEsLote: (v) => { setEsLote(v); setLineas([lineaVacia()]); },

        // Handlers
        handleProveedorChange, handleLinea, agregarLinea, eliminarLinea,

        // Derivados
        costoPorPieza, sumaLineas, totalOrden,
        buildPayload,

        // Validación
        puedeEnviar: !!idProveedor && productosFiltrados.length > 0,
        difPiezas: esLote && piezasLote ? Number(piezasLote) - sumaLineas : null,
    };
}