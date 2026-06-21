import { useState, useEffect } from "react";
import {
    fetchProducto, crearProducto, actualizarProducto,
    fetchTipos, subirImagenProducto, fetchCategorias
} from "../../../api/productos.js";
import { fetchProveedores } from "../../../api/proveedores.js";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export function useProductoForm(id) {
    const esEdicion = Boolean(id);

    const [tipos, setTipos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [form, setForm] = useState({
        nombre: "", descripcion: "", idTipoProducto: "",
        idProveedor: "", precioVenta: "", idCategoria: "",
    });

    const [categorias, setCategorias] = useState([]);
    const [imagenPreview, setImagenPreview] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(esEdicion);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTipos().then(setTipos).catch(() => { });
        fetchProveedores().then(setProveedores).catch(() => { });
        fetchCategorias().then(setCategorias).catch(() => { });

        if (esEdicion) {
            fetchProducto(id)
                .then(p => {
                    setForm({
                        nombre: p.nombre,
                        descripcion: p.descripcion ?? "",
                        idTipoProducto: String(p.idTipoProducto ?? ""),
                        idProveedor: p.idProveedor ? String(p.idProveedor) : "",
                        precioVenta: String(p.precioVenta ?? ""),
                        idCategoria: p.idCategoria ? String(p.idCategoria) : "",

                    });
                    if (p.imagenUrl) setImagenPreview(`${API_URL}${p.imagenUrl}`);
                })
                .catch(() => setError("No se pudo cargar el producto"))
                .finally(() => setLoadingData(false));
        }
    }, [id]);

    function handleChange(e) {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setError("");
    }

    function handleImagen(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setImagenFile(file);
        setImagenPreview(URL.createObjectURL(file));
    }

    async function handleSubmit(navigate) {
        setLoading(true);
        setError("");
        try {
            const payload = {
                nombre: form.nombre,
                descripcion: form.descripcion || null,
                idTipoProducto: Number(form.idTipoProducto),
                idProveedor: form.idProveedor ? Number(form.idProveedor) : null,
                precioVenta: Number(form.precioVenta),
                idCategoria: form.idCategoria ? Number(form.idCategoria) : null,
                // precio_compra viene de la OC — no se captura aquí
            };

            const producto = esEdicion
                ? await actualizarProducto(id, payload)
                : await crearProducto(payload);

            if (imagenFile) await subirImagenProducto(producto.id, imagenFile);
            navigate(`/productos/${producto.id}`);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return {
        tipos, proveedores, categorias, form, handleChange,
        imagenPreview, handleImagen,
        loading, loadingData, error,
        esEdicion, handleSubmit,
    };
}